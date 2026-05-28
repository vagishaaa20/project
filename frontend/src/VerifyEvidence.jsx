import { useState } from "react";
import axios from "axios";

const VerifyEvidence = () => {
  const [evidenceId, setEvidenceId] = useState("");
  const [video, setVideo] = useState(null);
  const [videoHash, setVideoHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const verifyEvidence = async () => {
    if (!evidenceId || !video) {
      setMessage("Please provide both Evidence ID and video file");
      return;
    }

    setLoading(true);
    setMessage("");
    setVerificationResult(null);
    setVideoHash("");

    const formData = new FormData();
    formData.append("evidenceId", evidenceId);
    formData.append("video", video);

    try {
      const res = await axios.post(
        "http://localhost:5001/verify",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          timeout: 60000,
        }
      );

      const data = res.data;

      // Display the generated hash
      if (data.videoHash) {
        setVideoHash(data.videoHash);
      }

      // Show verification result
      if (data.tampered === false) {
  setVerificationResult({
    status: "authentic",
    message: "EVIDENCE IS AUTHENTIC",
    details: `========== EVIDENCE VERIFICATION ==========
 Evidence ID    : ${evidenceId}
 Computed Hash  : ${data.videoHash}
 Verification   : ${new Date().toISOString()}
-------------------------------------------
 Blockchain     : Connected
 Stored Hash    : ${data.storedHash}
-------------------------------------------
 VERIFICATION RESULT : AUTHENTIC
 Status              : Evidence not tampered
===========================================`,
  });
} else {
  setVerificationResult({
    status: "tampered",
    message: "EVIDENCE IS TAMPERED",
    details: `========== EVIDENCE VERIFICATION ==========
 Evidence ID    : ${evidenceId}
 Computed Hash  : ${data.videoHash}
 Verification   : ${new Date().toISOString()}
-------------------------------------------
 Blockchain     : Connected
 Stored Hash    : ${data.storedHash || "NOT FOUND"}
-------------------------------------------
 VERIFICATION RESULT : TAMPERED
 Status              : Evidence has been modified
 ${data.reason ? "Reason      : " + data.reason : ""}
===========================================`,
  });
}
 } catch (error) {
      console.error("Verify error:", error);

      let errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;

      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timeout - the verification took too long";

      } else if (!navigator.onLine) {
        errorMessage = "Network is offline";

      } else if (
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Failed to connect to backend server. Make sure http://localhost:5001 is accessible";
      }

      setMessage(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    setVideo(file);
    setMessage("");
    setVideoHash("");
    setVerificationResult(null);
  };

  return (
    <div className="verify-container">
      <div className="verify-card">

        <h1 style={{ fontFamily: "Helvetica" }}>
          Verify Evidence
        </h1>

        <p className="subtitle">
          Upload a video to verify its authenticity
          against the ID stored on the blockchain
        </p>

        <div className="form-group">
          <label htmlFor="evidence-id">
            Evidence ID:
          </label>

          <input
            id="evidence-id"
            type="text"
            placeholder="Enter Evidence ID"
            value={evidenceId}
            onChange={(e) =>
              setEvidenceId(e.target.value)
            }
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="video-upload">
            Upload Video:
          </label>

          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="input-field"
            disabled={loading}
          />

          {video && (
            <p className="file-info">
              📁 {video.name}
            </p>
          )}
        </div>

        <button
          onClick={verifyEvidence}
          disabled={loading || !evidenceId || !video}
          className="btn-verify"
        >
          {loading
            ? "Verifying..."
            : "Verify Evidence"}
        </button>

        {message && (
          <div className="error-message">
            {message}
          </div>
        )}

        {videoHash && (
          <div className="hash-display">
            <h3>Generated Hash (SHA-256):</h3>

            <div className="hash-value">
              {videoHash}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(videoHash);

                alert("Hash copied to clipboard!");

                setCopied(true);

                setTimeout(
                  () => setCopied(false),
                  2000
                );
              }}
              className="btn-copy"
            >
              {copied ? "Copied!" : "Copy Hash"}
            </button>
          </div>
        )}

        {/* Verification Info */}
        <div className="verification-info">

          {/* How Verification Works */}
          <div className="info-card info-blue">
            <h3>
              <span className="info-icon">
                ℹ️
              </span>

              How Verification Works
            </h3>

            <ul>
              <li>
                Cryptographic hash verification
              </li>

              <li>
                Digital signature validation
              </li>

              <li>
                Chain of custody audit trail
              </li>

              <li>
                Metadata integrity check
              </li>

              <li>
                Timestamp authentication
              </li>
            </ul>
          </div>

          {/* Verification Standards */}
          <div className="info-card info-green">
            <h3>
              <span className="info-icon">
                ✔️
              </span>

              Verification Standards
            </h3>

            <p>
              Compliant with the Indian Evidence Act
              and recognized digital forensics
              standards to ensure legal admissibility
              and integrity of electronic evidence.
            </p>
          </div>
        </div>

        {verificationResult && (
          <div
            className={`result-box ${verificationResult.status}`}
          >
            <h2>
              {verificationResult.message}
            </h2>

            <div className="result-details">
              <pre>
                {verificationResult.details}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEvidence;