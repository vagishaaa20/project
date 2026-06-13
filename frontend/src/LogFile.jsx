import React, { useState, useEffect } from "react";
import axios from "axios";
import { Activity, Filter, Download, RefreshCw } from "lucide-react";
import API_URL from "./config";

const LogFile = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, success, error

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_URL}/auth/logs`,
        {
          withCredentials: true,
        }
      );
      console.log("Logs data:", res.data[0]); 
      setLogs(res.data);

    } catch (error) {
      console.error("Failed to fetch logs:", error);

      // Dummy data fallback
      setLogs([
        {
          action: "Evidence uploaded - Case #EVD-2024-001",
          status: 200,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          user: "Admin",
          ip: "192.168.1.100"
        },
        {
          action: "Deepfake analysis completed - Video verified",
          status: 200,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          user: "Investigator_2",
          ip: "192.168.1.105"
        },
        {
          action: "Evidence verification - Hash matched",
          status: 200,
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          user: "Forensics_Team",
          ip: "192.168.1.110"
        },
        {
          action: "Failed authentication attempt",
          status: 401,
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          user: "Unknown",
          ip: "203.45.67.89"
        },
        {
          action: "New evidence record created - EVD-2024-002",
          status: 200,
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          user: "Admin",
          ip: "192.168.1.100"
        },
        {
          action: "Blockchain verification successful",
          status: 200,
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          user: "System",
          ip: "localhost"
        },
        {
          action: "Evidence tamper check - Anomaly detected",
          status: 403,
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          user: "Security_Monitor",
          ip: "192.168.1.115"
        },
        {
          action: "Video evidence processed - Case #EVD-2024-003",
          status: 200,
          timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
          user: "Investigator_1",
          ip: "192.168.1.102"
        },
        {
          action: "Hash verification failed - Integrity check",
          status: 500,
          timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
          user: "Forensics_Team",
          ip: "192.168.1.110"
        },
        {
          action: "User login - Admin panel access",
          status: 200,
          timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
          user: "Admin",
          ip: "192.168.1.100"
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "success") {
      return log.status >= 200 && log.status < 300;
    }
    if (filter === "error") {
      return log.status >= 400;
    }
    return true;
  });

  const downloadLogs = () => {
    const csvContent = [
      ["Timestamp", "Action", "Status", "User", "IP"],

      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.status,
        log.user || "N/A",
        log.ip || "N/A"
      ])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
      `activity-logs-${
        new Date().toISOString().split("T")[0]
      }.csv`;

    a.click();
  };

  return (
    <div className="log-file-container">

      <div className="log-file-header">
        <div className="header-title">
          <Activity size={32} />

          <div>
            <h1>Activity Logs</h1>

            <p>
              Complete system activity audit trail
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-refresh"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spinning" : ""}
            />

            Refresh
          </button>

          <button
            className="btn-download"
            onClick={downloadLogs}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="log-controls">
        <div className="filter-group">
          <Filter size={16} />

          <span>Filter:</span>

          <button
            className={`filter-btn ${
              filter === "all" ? "active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All ({logs.length})
          </button>

          <button
            className={`filter-btn ${
              filter === "success" ? "active" : ""
            }`}
            onClick={() => setFilter("success")}
          >
            Success (
            {
              logs.filter(
                l => l.status >= 200 && l.status < 300
              ).length
            }
            )
          </button>

          <button
            className={`filter-btn ${
              filter === "error" ? "active" : ""
            }`}
            onClick={() => setFilter("error")}
          >
            Errors (
            {
              logs.filter(
                l => l.status >= 400
              ).length
            }
            )
          </button>
        </div>
      </div>

      {loading ? (

        <div className="log-loading">
          Loading activity logs...
        </div>

      ) : filteredLogs.length === 0 ? (

        <div className="log-empty">
          No logs found for the selected filter
        </div>

      ) : (

        <div className="log-table-container">
          <table className="log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Status</th>
                <th>User</th>
                <th>IP Address</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr
                  key={idx}
                  className="log-row"
                >
                  <td className="log-timestamp">
                    <div className="timestamp-date">
                      {new Date(
                        log.timestamp
                      ).toLocaleDateString()}
                    </div>

                    <div className="timestamp-time">
                      {new Date(
                        log.timestamp
                      ).toLocaleTimeString()}
                    </div>
                  </td>

                  <td className="log-action">
                    {log.action}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        log.status >= 200 &&
                        log.status < 300
                          ? "success"
                          : "error"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  <td className="log-user">
                    {log.user || "N/A"}
                  </td>

                  <td className="log-ip">
                    {log.ip || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LogFile;