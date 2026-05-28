import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header>
      <div className="logo">
        <div className="ashoka-seal">
          <div className="chakra"></div>
        </div>
        <div className="logo-text">
          <div className="logo-main">TRUSTVAULT</div>
          <div className="logo-sub">Blockchain Evidence Platform</div>
          <div className="logo-shlok">|| यतो धर्मस्ततो जयः ||</div>
        </div>
      </div>

      <nav>
        <a href="/register" className="nav-link">Get Started</a>
        <Link to="/login" className="login-btn">Login</Link>
      </nav>
    </header>
  );
};

export default Navbar;
