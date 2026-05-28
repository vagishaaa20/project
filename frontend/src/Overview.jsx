import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Overview.css";

const Overview = () => {
  const navigate = useNavigate();

  const [systemStatus, setSystemStatus] = useState({
    backend: "checking",
    ganache: "checking",
    contract: "checking",
  });

  // Check system status on mount
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check backend
      const backendRes = await axios.get(
        "http://localhost:5001/health",
        {
          timeout: 5000,
          withCredentials: true,
        }
      );

      setSystemStatus((prev) => ({
        ...prev,
        backend:
          backendRes.status === 200
            ? "online"
            : "offline",
      }));

      // Check Ganache
      const ganacheRes = await axios.post(
        "http://localhost:8545",
        {
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSystemStatus((prev) => ({
        ...prev,
        ganache:
          ganacheRes.status === 200
            ? "online"
            : "offline",
      }));

      // Check contract deployment
      const contractRes = await axios.post(
        "http://localhost:8545",
        {
          jsonrpc: "2.0",
          method: "eth_getCode",
          params: [
            "0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA",
            "latest",
          ],
          id: 1,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const contractData = contractRes.data;

      setSystemStatus((prev) => ({
        ...prev,
        contract:
          contractData.result !== "0x"
            ? "deployed"
            : "not_deployed",
      }));

    } catch (error) {
      console.error(
        "Status check error:",
        error
      );

      setSystemStatus({
        backend: "offline",
        ganache: "offline",
        contract: "not_deployed",
      });
    }
  };

  const getStatusColor = (status) => {
    if (
      status === "online" ||
      status === "deployed"
    ) {
      return "#4CAF50";
    }

    if (status === "checking") {
      return "#FF9800";
    }

    return "#F44336";
  };

  const getStatusText = (status) => {
    if (
      status === "online" ||
      status === "deployed"
    ) {
      return " Online";
    }

    if (status === "checking") {
      return "🔄 Checking...";
    }

    return "❌ Offline";
  };

  return (
    <div className="overview-container">

      {/* Header */}
      <header className="overview-header">
        <div className="header-content">
          <h1>
            🔗 Blockchain Chain of Custody System
          </h1>

          <p className="subtitle">
            Secure evidence management with
            SHA-256 hashing and Ethereum
            blockchain verification
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="overview-content">

        {/* System Status */}
        <section className="status-section">
          <h2>📊 System Status</h2>

          <div className="status-grid">

            <div className="status-card">
              <div
                className="status-indicator"
                style={{
                  backgroundColor:
                    getStatusColor(
                      systemStatus.backend
                    ),
                }}
              />

              <h3>Backend Server</h3>

              <p className="status-text">
                {getStatusText(
                  systemStatus.backend
                )}
              </p>

              <p className="status-detail">
                Port: 5001
              </p>

              <p className="status-detail">
                Express.js + Node.js
              </p>
            </div>

            <div className="status-card">
              <div
                className="status-indicator"
                style={{
                  backgroundColor:
                    getStatusColor(
                      systemStatus.ganache
                    ),
                }}
              />

              <h3>Ganache Blockchain</h3>

              <p className="status-text">
                {getStatusText(
                  systemStatus.ganache
                )}
              </p>

              <p className="status-detail">
                Port: 8545
              </p>

              <p className="status-detail">
                Local Ethereum Network
              </p>
            </div>

            <div className="status-card">
              <div
                className="status-indicator"
                style={{
                  backgroundColor:
                    getStatusColor(
                      systemStatus.contract
                    ),
                }}
              />

              <h3>Smart Contract</h3>

              <p className="status-text">
                {getStatusText(
                  systemStatus.contract
                )}
              </p>

              <p className="status-detail">
                EvidenceChain.sol
              </p>

              <p className="status-detail">
                0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA
              </p>
            </div>
          </div>
        </section>

        {/* Functionality Overview */}
        <section className="functionality-section">
          <h2>🎯 Core Functionality</h2>

          <div className="features-grid">

            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon">
                📹
              </div>

              <h3>Add Evidence</h3>

              <ul className="feature-list">
                <li>
                  Upload video files as evidence
                </li>

                <li>
                  Generate SHA-256 cryptographic
                  hash
                </li>

                <li>
                  Store hash on Ethereum blockchain
                </li>

                <li>
                  Immutable chain of custody record
                </li>

                <li>
                  Real-time blockchain confirmation
                </li>
              </ul>

              <button
                className="feature-button"
                onClick={() =>
                  navigate("/add-evidence")
                }
              >
                Upload Evidence →
              </button>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon">
                ✅
              </div>

              <h3>Verify Evidence</h3>

              <ul className="feature-list">
                <li>
                  Verify integrity of evidence files
                </li>

                <li>
                  Recalculate SHA-256 hash
                </li>

                <li>
                  Compare with blockchain record
                </li>

                <li>
                  Detect tampering instantly
                </li>

                <li>
                  Proof of authenticity
                </li>
              </ul>

              <button
                className="feature-button"
                onClick={() =>
                  navigate("/verify-evidence")
                }
              >
                Verify Evidence →
              </button>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon">
                📋
              </div>

              <h3>View Records</h3>

              <ul className="feature-list">
                <li>
                  Access stored evidence records
                </li>

                <li>
                  View blockchain transactions
                </li>

                <li>
                  Track chain of custody
                </li>

                <li>
                  Audit trail visibility
                </li>

                <li>
                  Historical evidence data
                </li>
              </ul>

              <button
                className="feature-button"
                onClick={() =>
                  navigate("/view-evidence")
                }
              >
                View Records →
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="overview-footer">
        <p>
          🔗 Blockchain Chain of Custody
          System v1.0
        </p>

        <p className="footer-info">
          Smart Contract:
          0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA
          | Ganache Network | SHA-256 Hashing
        </p>

        <button
          className="refresh-btn"
          onClick={checkSystemStatus}
          title="Refresh system status"
        >
          🔄 Refresh Status
        </button>
      </footer>
    </div>
  );
};

export default Overview;