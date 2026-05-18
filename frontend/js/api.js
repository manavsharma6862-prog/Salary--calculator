/**
 * api.js — All backend communication
 * Change BASE_URL to your Render deployment URL in production
 */

const BASE_URL = window.BACKEND_URL || "https://salary-calculator-jm9k.onrender.com";

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  /**
   * Calculate salary breakdown
   * @param {{ ctc, regime, city, rentPaid, age }} params
   */
  calculateSalary: (params) => post("/api/salary/calculate", params),

  /**
   * Compare old vs new regime
   */
  compareRegime: (params) => post("/api/salary/compare-regime", params),

  /**
   * AI explanation of the salary result
   * @param {object} salaryData - full result from calculateSalary
   */
  explainSalary: (salaryData) => post("/api/ai/explain", salaryData),

  /**
   * AI tax saving advice
   * @param {{ ctc, regime, investmentInfo }} params
   */
  getTaxAdvice: (params) => post("/api/ai/advice", params),
};
