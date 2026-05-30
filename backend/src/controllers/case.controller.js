const pool = require("../db/db");

/* ── POST /cases ───────────────────────────────────────────
   Create a new case                                         */
const createCase = async (req, res) => {
  const { case_number, title, description, assigned_to } = req.body;

  if (!case_number || !title) {
    return res.status(400).json({ success: false, error: "case_number and title are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cases (case_number, title, description, status, created_by, assigned_to)
       VALUES ($1, $2, $3, 'open', $4, $5)
       RETURNING *`,
      [case_number, title, description || null, req.user.id, assigned_to || null]
    );

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, "CREATE_CASE", "case", result.rows[0].id,
       `Case ${case_number}: ${title}`, req.ip]
    );

    return res.status(201).json({ success: true, case: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, error: "Case number already exists" });
    }
    console.error("[createCase]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── GET /cases ────────────────────────────────────────────
   List all cases with evidence count                        */
const listCases = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        u1.name  AS created_by_name,
        u2.name  AS assigned_to_name,
        COUNT(em.id) AS evidence_count
      FROM cases c
      LEFT JOIN users u1 ON u1.id = c.created_by
      LEFT JOIN users u2 ON u2.id = c.assigned_to
      LEFT JOIN evidence_metadata em ON em.case_id = c.case_number
      GROUP BY c.id, u1.name, u2.name
      ORDER BY c.created_at DESC
    `);
    return res.json({ success: true, cases: result.rows });
  } catch (err) {
    console.error("[listCases]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── GET /cases/:id ────────────────────────────────────────
   Get single case with all linked evidence                  */
const getCase = async (req, res) => {
  const { id } = req.params;
  try {
    const caseResult = await pool.query(`
      SELECT
        c.*,
        u1.name AS created_by_name,
        u2.name AS assigned_to_name
      FROM cases c
      LEFT JOIN users u1 ON u1.id = c.created_by
      LEFT JOIN users u2 ON u2.id = c.assigned_to
      WHERE c.id = $1
    `, [id]);

    if (caseResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Case not found" });
    }

    const evidenceResult = await pool.query(`
      SELECT
        em.*,
        u.name AS uploaded_by_name
      FROM evidence_metadata em
      LEFT JOIN users u ON u.id = em.uploaded_by
      WHERE em.case_id = $1
      ORDER BY em.created_at DESC
    `, [caseResult.rows[0].case_number]);

    return res.json({
      success:  true,
      case:     caseResult.rows[0],
      evidence: evidenceResult.rows,
    });
  } catch (err) {
    console.error("[getCase]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── PATCH /cases/:id ──────────────────────────────────────
   Update case status or assignment                          */
const updateCase = async (req, res) => {
  const { id }                           = req.params;
  const { status, assigned_to, title, description } = req.body;

  const VALID_STATUSES = ["open", "closed", "pending"];
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status" });
  }

  try {
    const result = await pool.query(`
      UPDATE cases
      SET
        status      = COALESCE($1, status),
        assigned_to = COALESCE($2, assigned_to),
        title       = COALESCE($3, title),
        description = COALESCE($4, description),
        updated_at  = NOW()
      WHERE id = $5
      RETURNING *
    `, [status, assigned_to, title, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Case not found" });
    }

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, "UPDATE_CASE", "case", id,
       `Updated: ${JSON.stringify(req.body)}`, req.ip]
    );

    return res.json({ success: true, case: result.rows[0] });
  } catch (err) {
    console.error("[updateCase]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── DELETE /cases/:id ─────────────────────────────────────
   Admin only                                                */
const deleteCase = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM cases WHERE id = $1 RETURNING id, case_number",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Case not found" });
    }

    await pool.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, detail, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.id, "DELETE_CASE", "case", id,
       `Deleted case ${result.rows[0].case_number}`, req.ip]
    );

    return res.json({ success: true, message: "Case deleted" });
  } catch (err) {
    console.error("[deleteCase]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

/* ── GET /cases/:id/timeline ───────────────────────────────
   Full chain of custody for a case                          */
const getCaseTimeline = async (req, res) => {
  const { id } = req.params;
  try {
    const caseResult = await pool.query(
      "SELECT * FROM cases WHERE id = $1", [id]
    );
    if (caseResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Case not found" });
    }

    const caseNumber = caseResult.rows[0].case_number;

    const timeline = await pool.query(`
      SELECT
        al.action,
        al.detail,
        al.ip_address,
        al.created_at,
        al.entity,
        al.entity_id,
        u.name  AS user_name,
        u.role  AS user_role
      FROM audit_log al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE
        (al.entity = 'case'     AND al.entity_id = $1)
        OR
        (al.entity = 'evidence' AND al.detail ILIKE $2)
      ORDER BY al.created_at ASC
    `, [id, `%${caseNumber}%`]);

    return res.json({
      success:  true,
      case:     caseResult.rows[0],
      timeline: timeline.rows,
    });
  } catch (err) {
    console.error("[getCaseTimeline]", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = { createCase, listCases, getCase, updateCase, deleteCase, getCaseTimeline };