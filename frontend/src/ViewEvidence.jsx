import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "./config";

const ViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/records`,
          {
            withCredentials: true,
          }
        );

        setRecords(res.data);

      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.error ||
          "Failed to load records"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <p className="loading-text">
        Loading records...
      </p>
    );
  }

  if (error) {
    return (
      <p className="error-text">
        {error}
      </p>
    );
  }

  if (records.length === 0) {
    return (
      <p className="empty-text">
        No evidence records found.
      </p>
    );
  }

  return (
    <div className="view-records-container">
      <h1 className="view-records-title">
        Evidence Records
      </h1>

      <div className="records-grid">
        {records.map((record, index) => {

          const prediction =
            record.prediction || "PENDING";

          const probability =
            record.avg_probability !== null
              ? (
                  record.avg_probability * 100
                ).toFixed(2) + "%"
              : "—";

          const analyzedAt =
            record.deepfake_analyzed_at
              ? new Date(
                  record.deepfake_analyzed_at
                ).toLocaleString()
              : "Not analyzed yet";

          return (
            <div
              key={index}
              className="record-card"
            >
              <div className="record-info">
                <p>
                  <strong>Case ID:</strong>{" "}
                  {record.case_id}
                </p>

                <p>
                  <strong>Evidence ID:</strong>{" "}
                  {record.evidence_id}
                </p>

                <p>
                  <strong>File Path:</strong>{" "}
                  {record.file_path}
                </p>
              </div>

              <div className="analysis-box">
                <p>
                  <strong>
                    Deepfake Result:
                  </strong>{" "}

                  <span
                    className={
                      prediction === "FAKE"
                        ? "prediction-fake"
                        : prediction === "REAL"
                        ? "prediction-real"
                        : "prediction-pending"
                    }
                  >
                    {prediction}
                  </span>
                </p>

                <p>
                  <strong>
                    Average Probability:
                  </strong>{" "}
                  {probability}
                </p>

                <p>
                  <strong>
                    Analyzed At:
                  </strong>{" "}
                  {analyzedAt}
                </p>
              </div>

              <video
            controls
            className="record-video"
            src={record.cloud_url || `${API_URL}/${record.file_path}`}
          />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewRecords;