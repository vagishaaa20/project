import streamlit as st
import cv2
import numpy as np
import tempfile
import os

# Fix for LeakyReLU negative_slope keyword issue
from tensorflow.keras.layers import LeakyReLU as KerasLeakyReLU

class FixedLeakyReLU(KerasLeakyReLU):
    def __init__(self, *args, **kwargs):
        if 'negative_slope' in kwargs:
            kwargs['alpha'] = kwargs.pop('negative_slope')
        super().__init__(*args, **kwargs)

# Monkey-patch Keras LeakyReLU globally
import sys
sys.modules['keras.layers'].LeakyReLU = FixedLeakyReLU
sys.modules['tensorflow.keras.layers'].LeakyReLU = FixedLeakyReLU


from classifiers import Meso4

# Get the directory of the current script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(SCRIPT_DIR, "weights", "Meso4_DF.h5")

# Set page layout
st.set_page_config(page_title="Deepfake Detection", layout="centered")
st.title("🎥 Deepfake Video Detection")
st.write("Upload a video and check whether it is REAL or FAKE")

# Load the model and cache it for faster reloads
@st.cache_resource
def load_model():
    model = Meso4()
    model.load(WEIGHTS_PATH)
    return model

model = load_model()

# Upload video
uploaded_video = st.file_uploader("Upload a video file", type=["mp4", "avi", "mov"])

if uploaded_video:
    tfile = tempfile.NamedTemporaryFile(delete=False)
    tfile.write(uploaded_video.read())
    
    # Show uploaded video in Streamlit
    st.video(tfile.name)

    # Run Deepfake Detection
    if st.button("Run Deepfake Detection"):
        cap = cv2.VideoCapture(tfile.name)
        fake_scores = []
        frame_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        progress_bar = st.progress(0)
        status_text = st.empty()

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            
            # Process every 10th frame for speed
            if frame_count % 10 == 0:
                frame_resized = cv2.resize(frame, (256, 256))
                frame_normalized = frame_resized / 255.0
                frame_input = np.expand_dims(frame_normalized, axis=0)
                
                # Predict
                pred = model.model.predict(frame_input, verbose=0)[0][0]
                fake_scores.append(pred)

            frame_count += 1

            # Update progress
            if total_frames > 0:
                progress_bar.progress(min(frame_count / total_frames, 1.0))
                status_text.text(f"Processing frame {frame_count} / {total_frames}")

        cap.release()

        # Compute average fake probability
        if fake_scores:
            avg_fake = sum(fake_scores) / len(fake_scores)
            st.subheader("📊 Result")
            st.write(f"Average Fake Probability: **{avg_fake:.2f}**")
            if avg_fake > 0.5:
                st.error("❌ FAKE VIDEO DETECTED")
            else:
                st.success("✅ REAL VIDEO DETECTED")
        else:
            st.warning("No frames were processed. Please try another video.")
