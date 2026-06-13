import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, X, ChevronRight, Search } from "lucide-react";
import "./cases.css";

const STATUS_COLORS = {
  open:    { bg: "rgba(99,102,241,0.15)",  text: "#818cf8", border: "rgba(99,102,241,0.3)"  },
  pending: { bg: "rgba(245,158,11,0.15)",  text: "#fbbf24", border: "rgba(245,158,11,0.3)"  },
  closed:  { bg: "rgba(16,185,129,0.15)",  text: "#34d399", border: "rgba(16,185,129,0.3)"  },
};

const Cases = () => {
  const navigate              = useNavigate();
  const [cases,    setCases]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]  = useState("");
  const [filter,   setFilter]  = useState("all");
  const [form,     setForm]    = useState({
    case_number: "", title: "", description: "", assigned_to: ""
  });
  const [error,    setError]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCases(); }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://${API_URL}/cases`, { withCredentials: true });
      setCases(res.data.cases);
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.case_number || !form.title) {
      setError("Case number and title are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`http://${API_URL}/cases`, form, { withCredentials: true });
      setShowForm(false);
      setForm({ case_number: "", title: "", description: "", assigned_to: "" });
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create case.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = cases.filter(c => {
    const matchSearch = c.case_number.toLowerCase().includes(search.toLowerCase()) ||
                        c.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="cases-root">
      <div className="cases-ambient cases-ambient-1" />
      <div className="cases-ambient cases-ambient-2" />

      <motion.div
        className="cases-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="cases-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="cases-title-row">
            <div className="cases-icon-wrap">
              <Briefcase size={28} />
            </div>
            <div>
              <h1>Case Management</h1>
              <p>{cases.length} total cases</p>
            </div>
          </div>
          <motion.button
            className="cases-btn-new"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} /> New Case
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="cases-controls"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="cases-search-wrap">
            <Search size={16} />
            <input
              className="cases-search"
              placeholder="Search by case number or title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="cases-filters">
            {["all", "open", "pending", "closed"].map(f => (
              <button
                key={f}
                className={`cases-filter-btn ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="cases-filter-count">
                  {f === "all" ? cases.length : cases.filter(c => c.status === f).length}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cases list */}
        {loading ? (
          <div className="cases-loading">Loading cases...</div>
        ) : filtered.length === 0 ? (
          <div className="cases-empty">
            <Briefcase size={48} opacity={0.2} />
            <p>No cases found</p>
          </div>
        ) : (
          <div className="cases-list">
            {filtered.map((c, i) => {
              const colors = STATUS_COLORS[c.status] || STATUS_COLORS.open;
              return (
                <motion.div
                  key={c.id}
                  className="case-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  <div className="case-card-left">
                    <div className="case-number">{c.case_number}</div>
                    <h3 className="case-title">{c.title}</h3>
                    {c.description && (
                      <p className="case-desc">{c.description}</p>
                    )}
                    <div className="case-meta">
                      <span>By {c.created_by_name || "Unknown"}</span>
                      {c.assigned_to_name && <span>→ {c.assigned_to_name}</span>}
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      <span>{c.evidence_count} evidence</span>
                    </div>
                  </div>
                  <div className="case-card-right">
                    <span
                      className="case-status"
                      style={{
                        background: colors.bg,
                        color:      colors.text,
                        border:     `1px solid ${colors.border}`,
                      }}
                    >
                      {c.status}
                    </span>
                    <ChevronRight size={20} className="case-chevron" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Create case modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="cases-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="cases-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="cases-modal-header">
                <h2>Create New Case</h2>
                <button className="cases-modal-close" onClick={() => setShowForm(false)}>
                  <X size={20} />
                </button>
              </div>

              {error && <div className="cases-error">{error}</div>}

              <div className="cases-form">
                <div className="cases-form-group">
                  <label>Case Number *</label>
                  <input
                    className="cases-input"
                    placeholder="e.g. CASE-2024-001"
                    value={form.case_number}
                    onChange={e => setForm({ ...form, case_number: e.target.value })}
                  />
                </div>
                <div className="cases-form-group">
                  <label>Title *</label>
                  <input
                    className="cases-input"
                    placeholder="Case title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="cases-form-group">
                  <label>Description</label>
                  <textarea
                    className="cases-input cases-textarea"
                    placeholder="Case description (optional)"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <motion.button
                  className="cases-btn-submit"
                  onClick={handleCreate}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? "Creating..." : "Create Case"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cases;