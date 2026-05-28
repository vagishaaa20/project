const TechStack = () => {
  return (
    <section className="tech-stack" id="technology">
      <div className="section-header">
        <h2 className="section-title">Technology Stack</h2>
        <p className="section-subtitle">
          Built with cutting-edge technologies for maximum security and reliability
        </p>
      </div>

      <div className="tech-grid">
        <div className="tech-item">
          <div className="tech-icon">⛓️</div>
          <div className="tech-name">Polygon Blockchain</div>
          <div className="tech-desc">Implemented with Merkle Tree for immutable evidence tracking</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🔐</div>
          <div className="tech-name">PostgreSQL</div>
          <div className="tech-desc">Secure relational database for metadata storage</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🧠</div>
          <div className="tech-name">Mesonet</div>
          <div className="tech-desc">ML anomaly detection for deepfake analysis</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🛡️</div>
          <div className="tech-name">JWT Authentication</div>
          <div className="tech-desc">Secure token-based authorization</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">⚛️</div>
          <div className="tech-name">React.js</div>
          <div className="tech-desc">Modern component-based user interface</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🚀</div>
          <div className="tech-name">Node.js</div>
          <div className="tech-desc">High-performance backend server</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🔒</div>
          <div className="tech-name">SHA-256 Hashing</div>
          <div className="tech-desc">Cryptographic hash verification</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">📊</div>
          <div className="tech-name">Real-time Analytics</div>
          <div className="tech-desc">Live monitoring and audit trails</div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;