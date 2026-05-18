const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");

// POST /api/ai/explain
router.post("/explain", aiController.explain);

// POST /api/ai/advice
router.post("/advice", aiController.advice);

module.exports = router;
