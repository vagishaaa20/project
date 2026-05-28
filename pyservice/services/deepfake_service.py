import os
import sys
import cv2
import numpy as np

DEEPFAKE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "deepfake")
sys.path.insert(0, DEEPFAKE_DIR)

from classifiers import Meso4

WEIGHTS_PATH = os.path.join(DEEPFAKE_DIR, "weights", "Meso4_DF.h5")

_model = None

def get_model():
    global _model
    if _model is None:
        m = Meso4()
        m.model.load_weights(WEIGHTS_PATH)
        _model = m
    return _model


def analyze_video(video_path: str) -> dict:
    model = get_model()
    cap   = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise Exception("Could not open video file")

    fake_scores  = []
    frame_count  = 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % 10 == 0:
            frame_resized    = cv2.resize(frame, (256, 256))
            frame_normalized = frame_resized / 255.0
            frame_input      = np.expand_dims(frame_normalized, axis=0)
            # use model.model.predict to bypass Classifier wrapper
            pred             = float(model.model.predict(frame_input, verbose=0)[0][0])
            fake_scores.append(pred)

        frame_count += 1

    cap.release()

    if not fake_scores:
        raise Exception("No frames could be processed")

    avg_probability = sum(fake_scores) / len(fake_scores)
    prediction      = "FAKE" if avg_probability > 0.5 else "REAL"

    return {
        "avg_probability": round(avg_probability, 4),
        "prediction":      prediction,
        "frames_analyzed": len(fake_scores),
        "total_frames":    total_frames,
    }