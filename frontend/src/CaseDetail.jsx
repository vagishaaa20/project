import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, Clock, Shield, Upload, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import "./CaseDetail.css";
import API_URL from "./config";

const ACTION_ICONS = {
  UPLOAD_EVIDENCE:  <Upload size={14} />,
  VERIFY_EVIDENCE:  <Shield size={14} />,
  DEEPFAKE_ANALYSIS:<CheckCircle size={14} />,
  UPLOAD_DUPLICATE: <AlertCircle size={14} />,
  CREATE_CASE:      <Briefcase size={14} />,
  UPDATE_CASE:      <Clock size={14} />,
};

const ACTION_COLORS = {
  UPLOAD_EVIDENCE:   "#6366f1",
  VERIFY_EVIDENCE:   "#10b981",
  DEEPFAKE_ANALYSIS: "#f59e0b",
  UPLOAD_DUPLICATE:  "#ef4444",
  CREATE_CASE:       "#8b5cf6",
  UPDATE_CASE:       "#64748b",
};

const CaseDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [caseData,   setCaseData]   = useState(null);
  const [evidence,   setEvidence]   = useState([]);
  const [timeline,   setTimeline]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("evidence");
  const [updating,   setUpdating]   = useState(false);

  useEffect(() => { fetchCase(); fetchTimeline(); }, [id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCase = async () => {
    try {
      const res = await axios.get(`${API_URL}/cases/${id}`, { withCredentials: true });
      setCaseData(res.data.case);
      setEvidence(res.data.evidence);
    } catch (err) {
      console.error("Failed to fetch case:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const res = await axios.get(`${API_URL}/cases/${id}/timeline`, { withCredentials: true });
      setTimeline(res.data.timeline);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/cases/${id}`, { status }, { withCredentials: true });
      setCaseData(prev => ({ ...prev, status }));
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="cd-loading">Loading case...</div>;
  if (!caseData) return <div className="cd-loading">Case not found.</div>;

  const STATUS_OPTIONS = ["open", "pending", "closed"].filter(s => s !== caseData.status);

  return (
    <div className="cd-root">
      <div className="cd-ambient cd-ambient-1" />

      <motion.div
        className="cd-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Back */}
        <motion.button
          className="cd-back"
          onClick={() => navigate("/cases")}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <ArrowLeft size={16} /> Back to Cases
        </motion.button>

        {/* Case header */}
        <motion.div
          className="cd-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="cd-header-left">
            <span className="cd-case-number">{caseData.case_number}</span>
            <h1>{caseData.title}</h1>
            {caseData.description && <p className="cd-desc">{caseData.description}</p>}
            <div className="cd-meta">
              <span>Created by {caseData.created_by_name}</span>
              {caseData.assigned_to_name && <span>Assigned to {caseData.assigned_to_name}</span>}
              <span>{new Date(caseData.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="cd-header-right">
            <span className={`cd-status cd-status-${caseData.status}`}>
              {caseData.status}
            </span>
            <div className="cd-status-actions">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  className="cd-status-btn"
                  onClick={() => updateStatus(s)}
                  disabled={updating}
                >
                  Mark {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="cd-stats"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="cd-stat">
            <span className="cd-stat-value">{evidence.length}</span>
            <span className="cd-stat-label">Evidence Items</span>
          </div>
          <div className="cd-stat">
            <span className="cd-stat-value">{timeline.length}</span>
            <span className="cd-stat-label">Audit Events</span>
          </div>
          <div className="cd-stat">
            <span className="cd-stat-value">
              {evidence.filter(e => e.prediction === "FAKE").length}
            </span>
            <span className="cd-stat-label">Fake Detected</span>
          </div>
          <div className="cd-stat">
            <span className="cd-stat-value">
              {evidence.filter(e => e.prediction === "REAL").length}
            </span>
            <span className="cd-stat-label">Authentic</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="cd-tabs">
          <button
            className={`cd-tab ${activeTab === "evidence" ? "active" : ""}`}
            onClick={() => setActiveTab("evidence")}
          >
            Evidence ({evidence.length})
          </button>
          <button
            className={`cd-tab ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            Chain of Custody ({timeline.length})
          </button>
        </div>

        {/* Evidence tab */}
        {activeTab === "evidence" && (
          <motion.div
            className="cd-evidence-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {evidence.length === 0 ? (
              <div className="cd-empty">No evidence linked to this case yet.</div>
            ) : (
              evidence.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  className="cd-evidence-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="cd-ev-left">
                    <span className="cd-ev-id">{ev.evidence_id}</span>
                    <span className="cd-ev-path">{ev.file_path}</span>
                    <span className="cd-ev-meta">
                      Uploaded by {ev.uploaded_by_name} · {new Date(ev.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="cd-ev-right">
                    {ev.prediction ? (
                      <span className={`cd-ev-prediction ${ev.prediction.toLowerCase()}`}>
                        {ev.prediction === "FAKE"
                          ? <><XCircle size={13} /> FAKE</>
                          : <><CheckCircle size={13} /> REAL</>
                        }
                      </span>
                    ) : (
                      <span className="cd-ev-prediction unanalyzed">Not analyzed</span>
                    )}
                    {ev.avg_probability && (
                      <span className="cd-ev-prob">{Math.round(ev.avg_probability * 100)}%</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Timeline tab */}
        {activeTab === "timeline" && (
          <motion.div
            className="cd-timeline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {timeline.length === 0 ? (
              <div className="cd-empty">No audit events yet.</div>
            ) : (
              timeline.map((event, i) => {
                const color = ACTION_COLORS[event.action] || "#64748b";
                const icon  = ACTION_ICONS[event.action]  || <Clock size={14} />;
                return (
                  <motion.div
                    key={i}
                    className="cd-timeline-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="cd-timeline-line">
                      <div className="cd-timeline-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }}>
                        {icon}
                      </div>
                      {i < timeline.length - 1 && <div className="cd-timeline-connector" />}
                    </div>
                    <div className="cd-timeline-content">
                      <div className="cd-timeline-action" style={{ color }}>
                        {event.action.replace(/_/g, " ")}
                      </div>
                      {event.detail && (
                        <div className="cd-timeline-detail">{event.detail}</div>
                      )}
                      <div className="cd-timeline-meta">
                        <span>{event.user_name || "System"}</span>
                        {event.user_role && <span>({event.user_role})</span>}
                        {event.ip_address && <span>· {event.ip_address}</span>}
                        <span>· {new Date(event.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CaseDetail;