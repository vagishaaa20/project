require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const multer       = require("multer");
const path         = require("path");
const fs           = require("fs");
const crypto       = require("crypto");
const axios        = require("axios");
const FormData     = require("form-data");

const pool       = require("./db/db");
const authRoutes = require("./routes/auth.route");
const { verifyToken, requireRole } = require("./middleware/auth.middleware");

const app       = express();
const PYSERVICE = process.env.PYSERVICE_URL || "http://localhost:8000";

/* ── Core middleware ───────────────────── */
app.set("trust proxy", true);

app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* ── Auth routes ───────────────────────── */
app.use("/auth", authRoutes);

/* ── Case routes ───────────────────────── */
const caseRoutes = require("./routes/case.route");
app.use("/cases", caseRoutes);

/* ── File upload setup ─────────────────── */
const upload = multer({ dest: "uploads/" });

const renameUploadedFile = (oldPath, caseId, evidenceId, originalName) => {
  const ext         = path.extname(originalName) || ".mp4";
  const newFileName = `${caseId}_${evidenceId}${ext}`;
  const newPath     = path.join("uploads", newFileName);
  fs.renameSync(oldPath, newPath);
  return newPath;
};

const generateVideoHash = (filePath) =>
  new Promise((resolve, reject) => {
    const hash   = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data",  (chunk) => hash.update(chunk));
    stream.on("end",   ()      => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });

const getCleanIp = (req) => {
  const raw =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    "UNKNOWN";
  return raw.replace("::ffff:", "");
};

const auditLog = async (userId, action, entity, entityId, detail, ip) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [userId, action, entity, entityId, detail, ip]
    );
  } catch (err) {
    console.error("[audit]", err.message);
  }
};

/* ── POST /upload ──────────────────────────────────────────
   Who: admin, officer                                       */
app.post(
  "/upload",
  verifyToken,
  requireRole("admin", "officer"),
  upload.single("video"),
  async (req, res) => {
    const { caseId, evidenceId } = req.body;
    const ip = getCleanIp(req);

    if (!req.file)              return res.status(400).json({ success: false, error: "No video file provided" });
    if (!caseId || !evidenceId) return res.status(400).json({ success: false, error: "Missing caseId or evidenceId" });

    const videoPath = renameUploadedFile(req.file.path, caseId, evidenceId, req.file.originalname);

    try {
      const videoHash = await generateVideoHash(videoPath);

      /* ── Save to PostgreSQL ── */
      try {
        await pool.query(
          `INSERT INTO evidence_metadata
             (case_id, evidence_id, file_path, file_hash, uploaded_by)
           VALUES ($1,$2,$3,$4,$5)`,
          [caseId, evidenceId, videoPath, videoHash, req.user.id]
        );
      } catch (err) {
        if (err.code === "23505") {
          await auditLog(req.user.id, "UPLOAD_DUPLICATE", "evidence", evidenceId,
            `Duplicate upload attempt for case ${caseId}`, ip);
          return res.status(400).json({ success: false, message: "This evidence has already been uploaded" });
        }
        throw err;
      }

      /* ── Call FastAPI blockchain service ── */
      try {
        const bcRes = await axios.post(`${PYSERVICE}/blockchain/store`, {
          caseId,
          evidenceId,
          fileHash: videoHash,
        });

        await auditLog(req.user.id, "UPLOAD_EVIDENCE", "evidence", evidenceId,
          `Case: ${caseId} | Hash: ${videoHash} | Tx: ${bcRes.data.transaction_hash}`, ip);

        return res.json({
          success:     true,
          videoHash,
          txHash:      bcRes.data.transaction_hash,
          blockNumber: bcRes.data.block_number,
          uploadedBy:  req.user.name,
        });

      } catch (bcErr) {
        if (bcErr.response?.status === 409) {
          return res.status(409).json({ success: false, message: "Evidence already exists in blockchain" });
        }
        console.error("Blockchain error:", bcErr.response?.data || bcErr.message);
        return res.status(500).json({ success: false, message: "Blockchain transaction failed" });
      }

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/* ── POST /verify ──────────────────────────────────────────
   Who: all authenticated users                              */
app.post(
  "/verify",
  verifyToken,
  upload.single("video"),
  async (req, res) => {
    const { evidenceId } = req.body;
    const ip = getCleanIp(req);

    if (!req.file)   return res.status(400).json({ error: "No video file provided", tampered: null });
    if (!evidenceId) return res.status(400).json({ error: "Missing evidenceId",     tampered: null });

    const videoPath = req.file.path;

    try {
      const videoHash = await generateVideoHash(videoPath);

      try {
        const bcRes = await axios.post(`${PYSERVICE}/blockchain/verify`, {
          evidenceId,
          fileHash: videoHash,
        });

        await auditLog(req.user.id, "VERIFY_EVIDENCE", "evidence", evidenceId,
          `Status: ${bcRes.data.status}`, ip);

        return res.json({
          tampered: bcRes.data.tampered,
          status:   bcRes.data.status,
          videoHash,
        });

      } catch (bcErr) {
        console.error("Verify blockchain error:", bcErr.response?.data || bcErr.message);
        return res.status(500).json({ error: "Verification failed", tampered: null });
      }

    } catch (error) {
      console.error("Verify error:", error);
      res.status(500).json({ error: error.message, tampered: null });
    } finally {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
    }
  }
);

/* ── GET /evidence ─────────────────────────────────────────
   Who: all authenticated users                              */
app.get("/evidence", verifyToken, async (req, res) => {
  try {
    const bcRes = await axios.get(`${PYSERVICE}/blockchain/evidence`);
    return res.json({ success: true, records: bcRes.data.records });
  } catch (err) {
    console.error("Evidence fetch error:", err.response?.data || err.message);
    res.status(500).json({ success: false, records: [], error: "Failed to fetch evidence" });
  }
});

/* ── POST /analyze ─────────────────────────────────────────
   Who: admin, officer                                       */
app.post(
  "/analyze",
  verifyToken,
  requireRole("admin", "officer"),
  upload.single("video"),
  async (req, res) => {
    const { caseId, evidenceId } = req.body;
    const ip = getCleanIp(req);

    if (!req.file)              return res.status(400).json({ success: false, error: "No video file provided" });
    if (!caseId || !evidenceId) return res.status(400).json({ success: false, error: "Missing caseId or evidenceId" });

    try {
      const form = new FormData();
      form.append("video",      fs.createReadStream(req.file.path), req.file.originalname || "video.mp4");
      form.append("caseId",     caseId);
      form.append("evidenceId", evidenceId);

      const pyRes = await axios.post(`${PYSERVICE}/deepfake/analyze`, form, {
        headers: form.getHeaders(),
        timeout: 5 * 60 * 1000,
      });

      const { avg_probability, prediction, frames_analyzed } = pyRes.data;

      /* ── Save result to PostgreSQL ── */
      await pool.query(
        `UPDATE evidence_metadata
         SET avg_probability = $1, prediction = $2, deepfake_analyzed_at = NOW()
         WHERE case_id = $3 AND evidence_id = $4`,
        [avg_probability, prediction, caseId, evidenceId]
      );

      await auditLog(req.user.id, "DEEPFAKE_ANALYSIS", "evidence", evidenceId,
        `Prediction: ${prediction} | Score: ${avg_probability}`, ip);

      return res.json({
        success: true,
        avg_probability,
        prediction,
        frames_analyzed,
      });

    } catch (err) {
      console.error("Deepfake analysis error:", err.response?.data || err.message);
      res.status(500).json({ success: false, error: "Deepfake analysis failed" });
    } finally {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
    }
  }
);

/* ── GET /records ──────────────────────────────────────────
   Who: all authenticated users                              */
app.get("/records", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        em.case_id,
        em.evidence_id,
        em.file_path,
        em.avg_probability,
        em.prediction,
        em.deepfake_analyzed_at,
        u.name AS uploaded_by_name
      FROM evidence_metadata em
      LEFT JOIN users u ON u.id = em.uploaded_by
      ORDER BY em.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

/* ── GET /health ───────────────────────────────────────────
   Public                                                    */
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

module.exports = app;