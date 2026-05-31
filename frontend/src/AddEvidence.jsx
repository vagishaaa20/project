import { useState } from "react";
import axios from "axios";

const AddEvidence = () => {
  const [caseId,         setCaseId]         = useState("");
  const [evidenceId,     setEvidenceId]     = useState("");
  const [video,          setVideo]          = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [uploadResult,   setUploadResult]   = useState(null);
  const [videoHash,      setVideoHash]      = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadEvidence = async () => {
    if (!caseId || !evidenceId || !video) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setUploadResult(null);
    setVideoHash("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("caseId",     caseId);
    formData.append("evidenceId", evidenceId);
    formData.append("video",      video);

    try {
      const res = await axios.post(
        "http://localhost:5001/upload",
        formData,
        {
          headers:         { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
          timeout:         300000, // 5 minutes
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          },
        }
      );

      const data = res.data;
      setVideoHash(data.videoHash || "");
      setUploadResult({
        type:    "success",
        message: "Evidence uploaded successfully",
        output:  data.output || "",
      });

      setCaseId("");
      setEvidenceId("");
      setVideo(null);
      setUploadProgress(0);

    } catch (error) {
      console.error("Upload error:", error);

      const status        = error.response?.status;
      const serverMessage = error.response?.data?.message;
      let message         = "Upload failed. Please try again.";

      if (status === 400 || status === 409) {
        message = serverMessage || "Evidence already exists.";
      } else if (error.code === "ECONNABORTED") {
        message = "Upload timed out. Please try with a smaller video or check your connection.";
      }

      setUploadResult({ type: "error", message, output: null });
      setUploadProgress(0);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-evidence-container">
      <div className="add-evidence-card">
        <h1>Add Evidence</h1>

        <div className="form-group">
          <label htmlFor="case-id">Case ID:</label>
          <input
            id="case-id"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="input-field"
            disabled={loading}
            placeholder="e.g. CASE-001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="evidence-id">Evidence ID:</label>
          <input
            id="evidence-id"
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            className="input-field"
            disabled={loading}
            placeholder="e.g. EV-001"
          />
        </div>

        <div className="form-group">
          <label htmlFor="video-upload">Upload Video:</label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="input-field"
            disabled={loading}
          />
          {video && <p className="file-info">{video.name} ({(video.size / (1024 * 1024)).toFixed(2)} MB)</p>}
        </div>

        <button
          onClick={uploadEvidence}
          disabled={loading || !caseId || !evidenceId || !video}
          className="btn-upload"
        >
          {loading ? "Uploading..." : "Upload Evidence"}
        </button>

        {/* Progress bar */}
        {loading && (
          <div className="upload-progress">
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>
              {uploadProgress < 100
                ? `Uploading video... ${uploadProgress}%`
                : "Processing blockchain & cloud storage..."}
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-icon">🔒</div>
          <div className="security-text">
            <h4>Security Notice</h4>
            <p>
              All evidence records are encrypted and protected
              with government-grade security. Access is logged
              for audit purposes. Unauthorized access is
              prohibited by law. This system maintains complete
              chain of custody integrity for legal admissibility.
            </p>
          </div>
        </div>

        {videoHash && (
          <div className="hash-display">
            <h3>Generated Hash (SHA-256):</h3>
            <div className="hash-value">{videoHash}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(videoHash);
                alert("Hash copied to clipboard!");
              }}
              className="btn-copy"
            >
              Copy Hash
            </button>
          </div>
        )}

        {uploadResult && (
          <div className={`result-box ${uploadResult.type}`}>
            <h3>{uploadResult.message}</h3>
            {uploadResult.output && (
              <pre className="result-output">{uploadResult.output}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEvidence;