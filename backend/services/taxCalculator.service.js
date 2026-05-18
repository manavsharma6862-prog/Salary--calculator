/**
 * Indian Salary & Tax Calculation Service
 * Based on FY 2024-25 / AY 2025-26 rules
 */

// ── Constants ────────────────────────────────────────────────────────────────

const EPF_RATE = 0.12;           // Employee 12%
const EPF_EMPLOYER_RATE = 0.12;  // Employer 12%
const EPF_CEILING = 15000;       // EPF wage ceiling

const PROFESSIONAL_TAX = {      // State-wise (Maharashtra default)
  annual: 2400,
  monthly: 200,
};

// Old Regime slabs (FY 2024-25)
const OLD_REGIME_SLABS = [
  { min: 0,       max: 250000,  rate: 0 },
  { min: 250001,  max: 500000,  rate: 0.05 },
  { min: 500001,  max: 1000000, rate: 0.20 },
  { min: 1000001, max: Infinity, rate: 0.30 },
];

// New Regime slabs (FY 2024-25, post-Budget)
const NEW_REGIME_SLABS = [
  { min: 0,       max: 300000,  rate: 0 },
  { min: 300001,  max: 700000,  rate: 0.05 },
  { min: 700001,  max: 1000000, rate: 0.10 },
  { min: 1000001, max: 1200000, rate: 0.15 },
  { min: 1200001, max: 1500000, rate: 0.20 },
  { min: 1500001, max: Infinity, rate: 0.30 },
];

const SURCHARGE_RATES = [
  { min: 5000000,  max: 10000000, rate: 0.10 },
  { min: 10000001, max: 20000000, rate: 0.15 },
  { min: 20000001, max: 50000000, rate: 0.25 },
  { min: 50000001, max: Infinity, rate: 0.37 }, // capped at 25% under new regime
];

const HEALTH_EDU_CESS = 0.04;

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeSlabTax(income, slabs) {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.min) break;
    const taxable = Math.min(income, slab.max) - slab.min;
    tax += taxable * slab.rate;
  }
  return Math.round(tax);
}

function computeSurcharge(tax, income) {
  for (const s of SURCHARGE_RATES) {
    if (income >= s.min && income <= s.max) {
      return Math.round(tax * s.rate);
    }
  }
  return 0;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// ── Salary Breakdown ─────────────────────────────────────────────────────────

function buildSalaryComponents(ctc, city = "metro") {
  const monthly = ctc / 12;

  // Standard structure (typical Indian corporate)
  const basic          = round2(monthly * 0.40);
  const hra            = round2(basic   * (city === "metro" ? 0.50 : 0.40));
  const da             = round2(basic   * 0.00);  // 0 for private sector
  const lta            = round2(monthly * 0.05);
  const medicalAllow   = round2(monthly * 0.02);
  const specialAllow   = round2(monthly - basic - hra - lta - medicalAllow);

  // EPF (Employee)
  const epfBase        = Math.min(basic + da, EPF_CEILING);
  const epfEmployee    = round2(epfBase * EPF_RATE);
  const epfEmployer    = round2(epfBase * EPF_EMPLOYER_RATE);

  // Gross (before deductions)
  const grossMonthly   = round2(basic + hra + da + lta + medicalAllow + specialAllow);
  const grossAnnual    = round2(grossMonthly * 12);

  return {
    monthly: {
      basic, hra, da, lta,
      medicalAllow, specialAllow,
      gross: grossMonthly,
    },
    annual: {
      basic:        round2(basic * 12),
      hra:          round2(hra * 12),
      da:           round2(da * 12),
      lta:          round2(lta * 12),
      medicalAllow: round2(medicalAllow * 12),
      specialAllow: round2(specialAllow * 12),
      gross:        grossAnnual,
    },
    epf: {
      employee: epfEmployee,
      employer: epfEmployer,
      annualEmployee: round2(epfEmployee * 12),
      annualEmployer: round2(epfEmployer * 12),
    },
  };
}

// ── HRA Exemption (Old Regime only) ─────────────────────────────────────────

function hraExemption(hra, basic, rentPaid, city) {
  if (!rentPaid || rentPaid === 0) return 0;
  const actual        = hra;
  const fiftyForty    = basic * (city === "metro" ? 0.50 : 0.40);
  const excessRent    = Math.max(rentPaid - basic * 0.10, 0);
  return Math.round(Math.min(actual, fiftyForty, excessRent));
}

// ── Old Regime Tax ───────────────────────────────────────────────────────────

function calcOldRegimeTax(gross, components, rentPaid, city, age = "below60") {
  // Deductions
  const stdDeduction    = 50000;
  const sec80C          = Math.min(components.epf.annualEmployee + 0, 150000); // EPF + user investments (capped)
  const hraExempt       = hraExemption(
    components.annual.hra,
    components.annual.basic,
    rentPaid * 12,
    city
  );
  const sec80D          = 25000; // basic health insurance premium
  const npsDeduction    = 0;     // optional – not added by default

  const totalDeductions = stdDeduction + sec80C + hraExempt + sec80D + npsDeduction;
  const taxableIncome   = Math.max(0, gross - totalDeductions);

  // Rebate u/s 87A (if taxable income ≤ 5L)
  let tax = computeSlabTax(taxableIncome, OLD_REGIME_SLABS);
  const rebate87A = taxableIncome <= 500000 ? Math.min(tax, 12500) : 0;
  tax = Math.max(0, tax - rebate87A);

  const surcharge = computeSurcharge(tax, taxableIncome);
  const cess      = Math.round((tax + surcharge) * HEALTH_EDU_CESS);
  const totalTax  = tax + surcharge + cess;

  return {
    taxableIncome,
    deductions: { stdDeduction, sec80C, hraExempt, sec80D, total: totalDeductions },
    slabTax: tax + rebate87A,
    rebate87A,
    taxAfterRebate: tax,
    surcharge,
    cess,
    totalTax,
  };
}

// ── New Regime Tax ───────────────────────────────────────────────────────────

function calcNewRegimeTax(gross) {
  const stdDeduction  = 75000; // enhanced std deduction under new regime (Budget 2024)
  const taxableIncome = Math.max(0, gross - stdDeduction);

  let tax = computeSlabTax(taxableIncome, NEW_REGIME_SLABS);

  // Rebate u/s 87A (if taxable income ≤ 7L under new regime)
  const rebate87A = taxableIncome <= 700000 ? Math.min(tax, 25000) : 0;
  tax = Math.max(0, tax - rebate87A);

  const surcharge = computeSurcharge(tax, taxableIncome);
  // Surcharge capped at 25% for new regime (>5Cr case)
  const cappedSurcharge = Math.min(surcharge, tax * 0.25);
  const cess      = Math.round((tax + cappedSurcharge) * HEALTH_EDU_CESS);
  const totalTax  = tax + cappedSurcharge + cess;

  return {
    taxableIncome,
    deductions: { stdDeduction, total: stdDeduction },
    slabTax: tax + rebate87A,
    rebate87A,
    taxAfterRebate: tax,
    surcharge: cappedSurcharge,
    cess,
    totalTax,
  };
}

// ── In-Hand Calculator ───────────────────────────────────────────────────────

function calculateInHand({ ctc, regime = "new", city = "metro", rentPaid = 0, age = "below60" }) {
  if (!ctc || ctc < 0) throw new Error("Invalid CTC value");

  const components = buildSalaryComponents(ctc, city);
  const grossAnnual = components.annual.gross;

  const oldTax = calcOldRegimeTax(grossAnnual, components, rentPaid, city, age);
  const newTax = calcNewRegimeTax(grossAnnual);

  const activeTax = regime === "old" ? oldTax : newTax;

  const annualEPF  = components.epf.annualEmployee;
  const annualPT   = PROFESSIONAL_TAX.annual;
  const annualTDS  = activeTax.totalTax;

  const totalDeductionAnnual = annualEPF + annualPT + annualTDS;
  const inHandAnnual  = round2(grossAnnual - totalDeductionAnnual);
  const inHandMonthly = round2(inHandAnnual / 12);

  const effectiveTaxRate = grossAnnual > 0
    ? round2((annualTDS / grossAnnual) * 100)
    : 0;

  return {
    ctc,
    regime,
    city,
    components,
    tax: activeTax,
    deductions: {
      epf:            annualEPF,
      professionalTax: annualPT,
      tds:            annualTDS,
      total:          totalDeductionAnnual,
    },
    inHand: {
      annual:  inHandAnnual,
      monthly: inHandMonthly,
    },
    effectiveTaxRate,
    comparison: {
      old: {
        totalTax:      oldTax.totalTax,
        taxableIncome: oldTax.taxableIncome,
        inHandMonthly: round2((grossAnnual - annualEPF - annualPT - oldTax.totalTax) / 12),
      },
      new: {
        totalTax:      newTax.totalTax,
        taxableIncome: newTax.taxableIncome,
        inHandMonthly: round2((grossAnnual - annualEPF - annualPT - newTax.totalTax) / 12),
      },
      betterRegime: oldTax.totalTax <= newTax.totalTax ? "old" : "new",
      savings: Math.abs(oldTax.totalTax - newTax.totalTax),
    },
  };
}

module.exports = { calculateInHand };
