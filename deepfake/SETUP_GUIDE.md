# Deepfake Detection Model - Complete Setup Guide

This guide will walk you through setting up and running the MesoNet deepfake detection model with Streamlit from scratch.

## Prerequisites

Before starting, ensure you have:
- **macOS** (this guide is for macOS; adjust for Linux/Windows)
- **Git** installed
- **Homebrew** installed (for macOS package management)
- Internet connection for downloading dependencies

## Step 1: Install Required System Dependencies

### 1.1 Install CMake (required for some Python packages)
```bash
brew install cmake
```

### 1.2 Install Python 3.10 (TensorFlow 2.20 requires Python ≤ 3.11)
```bash
brew install python@3.10
```

Verify installation:
```bash
/opt/homebrew/bin/python3.10 --version
```

## Step 2: Clone the Project

### 2.1 Navigate to your workspace
```bash
cd /Users/shanawaz/Desktop/gdgfinal
```

### 2.2 Clone the repository (if not already done)
```bash
git clone https://github.com/vagishaaa20/deepfake.git
cd deepfake
```

## Step 3: Install Python Dependencies

### 3.1 Install Streamlit
```bash
/opt/homebrew/bin/python3.10 -m pip install streamlit
```

### 3.2 Install TensorFlow (includes Keras)
```bash
/opt/homebrew/bin/python3.10 -m pip install tensorflow
```

### 3.3 Install OpenCV and other dependencies
```bash
/opt/homebrew/bin/python3.10 -m pip install opencv-python numpy pillow
```

### 3.4 Verify all packages are installed
```bash
/opt/homebrew/bin/python3.10 -c "import streamlit, tensorflow, keras, cv2, numpy; print('✓ All packages installed successfully')"
```

## Step 4: Verify Project Structure

Ensure the following files and folders exist:

```
deepfake/
├── app.py                 # Main Streamlit application
├── classifiers.py         # Neural network model definitions
├── weights/
│   ├── Meso4_DF.h5       # Pre-trained model weights (for DeepFake detection)
│   ├── Meso4_F2F.h5      # Pre-trained model weights (for Face2Face detection)
│   ├── MesoInception_DF.h5
│   └── MesoInception_F2F.h5
├── test_images/          # Sample test images/videos
├── README.md
└── SETUP_GUIDE.md        # This file
```

Verify weights exist:
```bash
ls -lh weights/
```

## Step 5: Run the Streamlit Application

### 5.1 Navigate to the project directory
```bash
cd /Users/shanawaz/Desktop/gdgfinal/deepfake
```

### 5.2 Start the Streamlit server
```bash
/opt/homebrew/bin/python3.10 -m streamlit run app.py
```

You should see output like:
```
  You can now view your Streamlit app in your browser.

  Local URL: http://localhost:8501
  Network URL: http://10.xxx.xxx.xxx:8501
```

### 5.3 Open the application in your browser
- **Local:** http://localhost:8501
- **Network:** http://10.xxx.xxx.xxx:8501 (shown in terminal)

## Step 6: Using the Deepfake Detection App

### 6.1 Upload a video
1. Click "Upload a video file" button
2. Select a video in MP4, AVI, or MOV format
3. The video will be displayed in the app

### 6.2 Run detection
1. Click "Run Deepfake Detection" button
2. The app will:
   - Process every 10th frame of the video for speed
   - Run inference using the Meso4 model
   - Display progress bar showing processing status
   - Show results with average fake probability

### 6.3 Interpret results
- **Fake Probability: 0.00 - 1.00**
  - 0.0 = Definitely REAL
  - 1.0 = Definitely FAKE
  - **Threshold: 0.5**
    - Score > 0.5 = ❌ **FAKE VIDEO DETECTED**
    - Score ≤ 0.5 = ✅ **REAL VIDEO DETECTED**

## Step 7: Troubleshooting

### Issue: "weights/Meso4_DF.h5 not found"
**Solution:** Make sure the weights directory exists in the project folder:
```bash
ls -la weights/Meso4_DF.h5
```
If missing, download from the project repository.

### Issue: "ModuleNotFoundError: No module named 'streamlit'"
**Solution:** Install missing package:
```bash
/opt/homebrew/bin/python3.10 -m pip install streamlit
```

### Issue: TensorFlow import errors
**Solution:** Ensure Python 3.10 is used (not 3.14 or higher):
```bash
/opt/homebrew/bin/python3.10 --version  # Should show 3.10.x
```

### Issue: "Address already in use" port 8501
**Solution:** Stop the running Streamlit app:
```bash
pkill -f "streamlit run"
```
Then restart it.

### Issue: Slow video processing
**Solution:** The app processes every 10th frame by default for speed. This is in `app.py` line 58:
```python
if frame_count % 10 == 0:  # Change 10 to process more/fewer frames
```

## Step 8: Alternative Setup with Virtual Environment (Optional)

If you prefer using a virtual environment:

### 8.1 Create virtual environment
```bash
cd /Users/shanawaz/Desktop/gdgfinal/deepfake
/opt/homebrew/bin/python3.10 -m venv venv
```

### 8.2 Activate virtual environment
```bash
source venv/bin/activate
```

### 8.3 Install dependencies in virtual environment
```bash
pip install streamlit tensorflow opencv-python numpy pillow
```

### 8.4 Run the app
```bash
streamlit run app.py
```

### 8.5 Deactivate when done
```bash
deactivate
```

## Step 9: Performance Notes

- **Model Used:** Meso4 (optimized for speed and accuracy)
- **Input Resolution:** 256x256 pixels
- **Detection Accuracy:** 
  - DeepFake: 98%+
  - Face2Face: 95%+
- **Processing Speed:** ~1-2 seconds per video (depending on length)

## Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/vagishaaa20/deepfake.git

# Navigate to project
cd deepfake

# Install all dependencies at once
/opt/homebrew/bin/python3.10 -m pip install streamlit tensorflow opencv-python numpy pillow

# Run the app
/opt/homebrew/bin/python3.10 -m streamlit run app.py

# Stop the app
pkill -f "streamlit run"

# Check if weights exist
ls -lh weights/
```

## Additional Resources

- **Paper:** [MesoNet: a Compact Facial Video Forgery Detection Network](https://arxiv.org/abs/1809.00888)
- **Authors:** Darius Afchar, Vincent Nozick
- **GitHub:** https://github.com/vagishaaa20/deepfake

## Support

If you encounter issues:
1. Check Step 7 (Troubleshooting) section
2. Verify all files are present (Step 4)
3. Ensure correct Python version (Python 3.10)
4. Check internet connection for downloading packages



absolute beginner setup 
brew install python@3.10
cd /Users/shanawaz/Desktop/gdgfinal/deepfake
/opt/homebrew/bin/python3.10 -m pip install streamlit tensorflow opencv-python numpy pillow
/opt/homebrew/bin/python3.10 -m streamlit run app.py