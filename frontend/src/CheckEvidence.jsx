import { useEffect, useState } from "react";
import axios from "axios";
import "./CheckEvidence.css";

const CheckEvidence = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        "http://localhost:5001/records",
        {
          withCredentials: true,
        }
      );

      setRecords(res.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
        "Failed to load evidence records"
      );

    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!filter) return true;

    const q = filter.toLowerCase();

    return (
      record.case_id?.toLowerCase().includes(q) ||
      record.evidence_id?.toLowerCase().includes(q) ||
      record.file_path?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="check-evidence-container">
      <div className="check-evidence-card">
        <h1>Evidence Database</h1>

        <p className="subtitle">
          Stored evidence metadata (database)
        </p>

        <div className="controls">
          <input
            type="text"
            placeholder="Search by Case ID, Evidence ID, or File Path"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />

          <button
            onClick={fetchRecords}
            className="btn-refresh"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <p className="status-loading">
            Loading records...
          </p>
        )}

        {error && (
          <p className="status-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          filteredRecords.length === 0 && (
            <p className="status-empty">
              No evidence records found
            </p>
          )}

        {!loading && filteredRecords.length > 0 && (
          <div className="records-container">
            <p className="record-count">
              Total: {filteredRecords.length} record(s)
            </p>

            {filteredRecords.map((record, index) => (
              <div
                key={index}
                className="evidence-record"
              >
                <div className="record-grid">
                  <div className="record-item">
                    <span className="label">
                      Case ID
                    </span>

                    <span className="value">
                      {record.case_id}
                    </span>
                  </div>

                  <div className="record-item">
                    <span className="label">
                      Evidence ID
                    </span>

                    <span className="value">
                      {record.evidence_id}
                    </span>
                  </div>
                </div>

                <div className="record-item">
                  <span className="label">
                    Stored File Path
                  </span>

                  <span className="value mono">
                    {record.file_path}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckEvidence;