const { explainSalary, getTaxAdvice } = require("../services/groqAI.service");

/**
 * POST /api/ai/explain
 * Body: salary result object from /api/salary/calculate
 */
async function explain(req, res, next) {
  try {
    const salaryData = req.body;

    if (!salaryData || !salaryData.ctc) {
      return res.status(400).json({ error: "Please provide salary calculation data." });
    }

    const explanation = await explainSalary(salaryData);
    res.json({ success: true, explanation });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/advice
 * Body: { ctc, regime, investmentInfo }
 */
async function advice(req, res, next) {
  try {
    const { ctc, regime = "new", investmentInfo = "" } = req.body;

    if (!ctc || isNaN(ctc)) {
      return res.status(400).json({ error: "Please provide a valid CTC." });
    }

    const adviceText = await getTaxAdvice({ ctc: Number(ctc), regime, investmentInfo });
    res.json({ success: true, advice: adviceText });
  } catch (err) {
    next(err);
  }
}

module.exports = { explain, advice };
