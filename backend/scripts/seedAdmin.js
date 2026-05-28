require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const pool   = require("../src/db/db");

async function seed() {
  const hash = await bcrypt.hash("changeme123", 12);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name       VARCHAR(100)  NOT NULL,
      email      VARCHAR(150)  UNIQUE NOT NULL,
      password   VARCHAR(255)  NOT NULL,
      role       VARCHAR(20)   NOT NULL DEFAULT 'viewer'
                               CHECK (role IN ('admin','officer','viewer')),
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ   DEFAULT NOW()
    )
  `);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING email, role`,
    ["Admin", "admin@trustvault.local", hash, "admin"]
  );

  if (result.rows.length > 0) {
    console.log("✓ Admin user created:", result.rows[0]);
    console.log("  Email:    admin@trustvault.local");
    console.log("  Password: changeme123  ← change this immediately");
  } else {
    console.log("⚠ Admin already exists, skipping");
  }

  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });