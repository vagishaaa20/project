import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";

const TYPE_COLORS = {
  success: "#10b981",
  warning: "#f59e0b",
  error:   "#ef4444",
  info:    "#6366f1",
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread,        setUnread]         = useState(0);
  const [open,          setOpen]           = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5001/auth/notifications",
        { withCredentials: true }
      );
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5001/auth/notifications/${id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.patch(
        "http://localhost:5001/auth/notifications/read-all",
        {},
        { withCredentials: true }
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5001/auth/notifications/${id}`,
        { withCredentials: true }
      );
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <div className="notif-wrap" ref={menuRef}>
      <motion.button
   className={`notif-bell ${unread > 0 ? "has-unread" : ""}`}
  onClick={() => setOpen(o => !o)}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
  animate={unread > 0 ? {
    rotate: [0, -15, 15, -10, 10, -5, 5, 0],
  } : {}}
  transition={unread > 0 ? {
    duration: 0.6,
    repeat: Infinity,
    repeatDelay: 3,
  } : {}}
>
  <Bell
    size={20}
    style={{ color: unread > 0 ? "#f59e0b" : "#94a3b8" }}
    fill={unread > 0 ? "rgba(245,158,11,0.2)" : "none"}
  />
  {unread > 0 && (
    <motion.span
      className="notif-badge"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500 }}
    >
      {unread > 9 ? "9+" : unread}
    </motion.span>
  )}
</motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="notif-header">
              <span>Notifications {unread > 0 && <span className="notif-count">{unread} new</span>}</span>
              {unread > 0 && (
                <button className="notif-mark-all" onClick={markAllRead}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="notif-list">
              {notifications.length === 0 ? (
                <div className="notif-empty">No notifications yet</div>
              ) : (
                notifications.map(n => (
                  <motion.div
                    key={n.id}
                    className={`notif-item ${n.read ? "read" : "unread"}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div
                      className="notif-dot"
                      style={{ background: TYPE_COLORS[n.type] || "#6366f1" }}
                    />
                    <div className="notif-content" onClick={() => !n.read && markRead(n.id)}>
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="notif-actions">
                      {!n.read && (
                        <button className="notif-action-btn" onClick={() => markRead(n.id)} title="Mark read">
                          <Check size={13} />
                        </button>
                      )}
                      <button className="notif-action-btn delete" onClick={() => deleteNotif(n.id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;