const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salary.controller");

// POST /api/salary/calculate
router.post("/calculate", salaryController.calculate);

// POST /api/salary/compare-regime
router.post("/compare-regime", salaryController.compareRegime);

module.exports = router;
