import { useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Upload, ShieldCheck, ShieldX, Loader2, Film } from "lucide-react";
import "./DeepfakeDetection.css";
import API_URL from "./config";

const DeepfakeDetection = () => {
  const [caseId,     setCaseId]     = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [video,      setVideo]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState("");
  const [dragOver,   setDragOver]   = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (file && file.type.startsWith("video/")) {
      setVideo(file);
      setError("");
    } else {
      setError("Please select a valid video file.");
    }
  };

  const handleAnalyze = async () => {
    if (!caseId || !evidenceId || !video) {
      setError("Please fill all fields and select a video.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("caseId",     caseId);
    formData.append("evidenceId", evidenceId);
    formData.append("video",      video);

    try {
      const res = await axios.post(
        `${API_URL}/analyze`,
        formData,
        { withCredentials: true, timeout: 300000 }
      );
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFake = result?.prediction === "FAKE";
  const prob   = result ? Math.round(result.avg_probability * 100) : 0;

  return (
    <div className="df-root">
      <div className="df-ambient df-ambient-1" />
      <div className="df-ambient df-ambient-2" />

      <motion.div
        className="df-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="df-header"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="df-icon-wrap">
            <ScanFace size={36} />
          </div>
          <h1>Deepfake Detection</h1>
          <p>AI-powered video authenticity analysis using Meso4 neural network</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="df-card"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Inputs row */}
          <div className="df-inputs-row">
            <div className="df-form-group">
              <label>Case ID</label>
              <input
                className="df-input"
                placeholder="e.g. CASE-001"
                value={caseId}
                onChange={e => setCaseId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="df-form-group">
              <label>Evidence ID</label>
              <input
                className="df-input"
                placeholder="e.g. EV-001"
                value={evidenceId}
                onChange={e => setEvidenceId(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`df-dropzone ${dragOver ? "drag-over" : ""} ${video ? "has-file" : ""}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={e => handleFile(e.target.files[0])}
            />
            <AnimatePresence mode="wait">
              {video ? (
                <motion.div
                  key="file"
                  className="df-file-info"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Film size={28} className="df-file-icon" />
                  <span className="df-filename">{video.name}</span>
                  <span className="df-filesize">{(video.size / (1024 * 1024)).toFixed(2)} MB</span>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="df-drop-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Upload size={32} />
                  <span>Drop video here or <u>browse</u></span>
                  <small>MP4, AVI, MOV supported</small>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="df-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze button */}
          <motion.button
            className="df-btn"
            onClick={handleAnalyze}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="df-spin" />
                Analyzing video frames...
              </>
            ) : (
              <>
                <ScanFace size={18} />
                Run Deepfake Detection
              </>
            )}
          </motion.button>

          {/* Loading progress hint */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className="df-loading-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="df-progress-bar">
                  <div className="df-progress-fill" />
                </div>
                <small>Processing frames with Meso4 neural network. This may take 1-3 minutes.</small>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              className={`df-result ${isFake ? "fake" : "real"}`}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.45 }}
            >
              <div className="df-result-icon">
                {isFake
                  ? <ShieldX size={48} />
                  : <ShieldCheck size={48} />
                }
              </div>

              <h2>{isFake ? "FAKE VIDEO DETECTED" : "AUTHENTIC VIDEO"}</h2>
              <p className="df-result-sub">
                {isFake
                  ? "This video shows signs of AI manipulation."
                  : "This video appears to be genuine."}
              </p>

              {/* Probability meter */}
              <div className="df-meter-wrap">
                <div className="df-meter-labels">
                  <span>Real</span>
                  <span>Fake</span>
                </div>
                <div className="df-meter">
                  <motion.div
                    className={`df-meter-fill ${isFake ? "fake" : "real"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${prob}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
                <div className="df-meter-value">{prob}% fake probability</div>
              </div>

              <div className="df-result-stats">
                <div className="df-stat">
                  <span className="df-stat-label">Avg Probability</span>
                  <span className="df-stat-value">{result.avg_probability}</span>
                </div>
                <div className="df-stat">
                  <span className="df-stat-label">Frames Analyzed</span>
                  <span className="df-stat-value">{result.frames_analyzed}</span>
                </div>
                <div className="df-stat">
                <span className="df-stat-label">Faces Detected</span>
                <span className="df-stat-value">{result.frames_with_face ?? "N/A"}</span>
                </div>
                <div className="df-stat">
                  <span className="df-stat-label">Model</span>
                  <span className="df-stat-value">Meso4</span>
                </div>
              </div>

              <p className="df-saved-note">✓ Result saved to evidence record</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security notice */}
        <motion.div
          className="df-security"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span>🔒</span>
          <p>All analysis is performed server-side. Video files are not stored after processing.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DeepfakeDetection;