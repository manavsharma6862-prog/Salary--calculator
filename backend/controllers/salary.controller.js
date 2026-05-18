const { calculateInHand } = require("../services/taxCalculator.service");

/**
 * POST /api/salary/calculate
 * Body: { ctc, regime, city, rentPaid, age }
 */
async function calculate(req, res, next) {
  try {
    const { ctc, regime = "new", city = "metro", rentPaid = 0, age = "below60" } = req.body;

    if (!ctc || isNaN(ctc) || Number(ctc) <= 0) {
      return res.status(400).json({ error: "Please provide a valid CTC (annual, in INR)." });
    }

    const result = calculateInHand({
      ctc: Number(ctc),
      regime,
      city,
      rentPaid: Number(rentPaid) || 0,
      age,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/salary/compare-regime
 * Body: { ctc, city, rentPaid, age }
 */
async function compareRegime(req, res, next) {
  try {
    const { ctc, city = "metro", rentPaid = 0, age = "below60" } = req.body;

    if (!ctc || isNaN(ctc) || Number(ctc) <= 0) {
      return res.status(400).json({ error: "Please provide a valid CTC." });
    }

    const oldResult = calculateInHand({ ctc: Number(ctc), regime: "old", city, rentPaid: Number(rentPaid), age });
    const newResult = calculateInHand({ ctc: Number(ctc), regime: "new", city, rentPaid: Number(rentPaid), age });

    res.json({
      success: true,
      data: {
        old: {
          totalTax:      oldResult.tax.totalTax,
          inHandMonthly: oldResult.inHand.monthly,
          inHandAnnual:  oldResult.inHand.annual,
          taxableIncome: oldResult.tax.taxableIncome,
        },
        new: {
          totalTax:      newResult.tax.totalTax,
          inHandMonthly: newResult.inHand.monthly,
          inHandAnnual:  newResult.inHand.annual,
          taxableIncome: newResult.tax.taxableIncome,
        },
        recommendation: oldResult.comparison.betterRegime,
        annualSavings:  oldResult.comparison.savings,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { calculate, compareRegime };
