import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="security-badge">
        GOVERNMENT-GRADE SECURITY • BLOCKCHAIN VERIFIED
      </div>

      <h1>TRUSTVAULT</h1>

      <p className="hero-subtitle">
        Blockchain-based evidence management with AI-powered deepfake detection.
      </p>

      <div className="hero-features">
        <div className="hero-feature">Blockchain Verified</div>
        <div className="hero-feature">Deepfake Detection</div>
        <div className="hero-feature">Immutable Storage</div>
        <div className="hero-feature">Real-time Authentication</div>
      </div>

      <div className="cta-section">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;
