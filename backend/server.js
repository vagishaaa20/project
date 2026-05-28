const app  = require("./src/app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Backend running on http://0.0.0.0:${PORT}`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://192.168.1.24:${PORT}`);
});