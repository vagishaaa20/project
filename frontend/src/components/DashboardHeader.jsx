import { useNavigate } from "react-router-dom";
import { LogOut, Shield, Activity } from "lucide-react";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later: clear auth/session
    navigate("/");
  };

  return (
    <>
      <style>
        {`
        .dashboard-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .header-inner {
          max-width: 1200px;
          margin: auto;
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .icon-box {
          background: linear-gradient(135deg, #111827, #374151);
          padding: 10px;
          border-radius: 10px;
          color: #fff;
        }

        .header-text h1 {
          font-size: 18px;
          margin: 0;
          font-weight: 700;
          color: #111827;
        }

        .header-text p {
          font-size: 11px;
          margin: 2px 0 0;
          color: #4b5563;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(16, 185, 129, 0.15);
          color: #065f46;
          font-weight: 600;
          margin-left: 10px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }
        `}
      </style>

      <header className="dashboard-header">
        <div className="header-inner">
          <div className="header-left">
            <div className="icon-box">
              <Shield size={22} />
            </div>

            <div className="header-text">
              <h1>Chain of Custody System</h1>
              <p>Government of India · Digital Evidence Platform</p>
            </div>

            <div className="status-pill">
              <Activity size={12} />
              System Online
            </div>
          </div>

          <div className="header-right">
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
