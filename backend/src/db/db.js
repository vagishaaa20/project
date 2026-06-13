const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

// const pool = new Pool({
//   host: "localhost",
//   user: "postgres",
//   password: "vvss",
//   database: "admin",
//   port: 5432,
// });

pool.connect()
  .then(() => {
     console.log("PostgreSQL Connected");
  })
  .catch(err => {
     console.error("DB Connection Error", err);
  });

module.exports = pool;