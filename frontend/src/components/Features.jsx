const Features = () => {
  return (
    <section className="features" id="features">
      <div className="section-header">
        <h2 className="section-title">Core Capabilities</h2>
      </div>

      <div className="features-grid">
        {/* 1 */}
        <div className="feature-card">
          <span className="feature-icon">⛓️</span>
          <h3 className="feature-title">Blockchain-Secured Evidence Storage</h3>
          <p className="feature-desc">
            Immutable digital evidence storage backed by blockchain technology.
            Each file is cryptographically hashed, timestamped, and permanently
            recorded to preserve integrity and legal admissibility.
          </p>
        </div>

        {/* 2 */}
        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3 className="feature-title">Evidence Integrity Verification</h3>
          <p className="feature-desc">
            Multi-layer verification ensures evidence remains unaltered after
            submission. Cryptographic validation and audit trails allow instant
            integrity checks throughout the evidence lifecycle.
          </p>
        </div>

        {/* 3 */}
        <div className="feature-card">
          <span className="feature-icon">🤖</span>
          <h3 className="feature-title">
            ML Anomaly Detection
          </h3>
          <p className="feature-desc">
            Machine learning models analyze images, videos, and audio to detect
            deepfakes, synthetic content, and anomalous patterns. Supports
            forensic analysis with confidence indicators.
          </p>
        </div>

        {/* 4 */}
        <div className="feature-card">
          <span className="feature-icon">🛡️</span>
          <h3 className="feature-title">Role-Based Secure Access</h3>
          <p className="feature-desc">
            The system enforces role-based authentication for users and
            administrators. Access permissions, actions, and dashboards are
            strictly separated to ensure controlled and accountable usage.
          </p>
        </div>

        {/* 5 */}
        <div className="feature-card feature-card-center">
          <span className="feature-icon">📜</span>
          <h3 className="feature-title">Chain of Custody & Audit Logs</h3>
          <p className="feature-desc">
            Every interaction with evidence is automatically logged, including
            uploads, access, verification, and system actions. A complete,
            court-admissible audit trail is maintained.
          </p>
        </div>

        {/* 6 */}
        <div className="feature-card feature-card-center">
          <span className="feature-icon">📁</span>
          <h3 className="feature-title">Evidence Lifecycle Management</h3>
          <p className="feature-desc">
            Manages the full lifecycle of digital evidence from submission and
            verification to review and long-term archival, supporting
            investigative and legal workflows.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
