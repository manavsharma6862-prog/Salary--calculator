require("dotenv").config();
const express = require("express");
const cors = require("cors");

const salaryRoutes = require("./routes/salary.routes");
const aiRoutes = require("./routes/ai.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Salary Calculator API is running 🚀" });
});

app.use("/api/salary", salaryRoutes);
app.use("/api/ai", aiRoutes);

// ── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
