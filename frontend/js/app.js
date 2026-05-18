/**
 * app.js — Main application logic
 */

import { api }            from "./api.js";
import { parseCTC }       from "./formatter.js";
import { renderResult, showToast, setCalculating, setAIOutput } from "./ui.js";

// ── State ────────────────────────────────────────────────────────────────────
let lastResult = null;
let selectedRegime = "new";

// ── DOM refs ─────────────────────────────────────────────────────────────────
const ctcInput      = document.getElementById("ctc-input");
const citySelect    = document.getElementById("city-select");
const rentInput     = document.getElementById("rent-input");
const ageSelect     = document.getElementById("age-select");
const calculateBtn  = document.getElementById("btn-calculate");
const explainBtn    = document.getElementById("btn-explain");
const adviceBtn     = document.getElementById("btn-advice");
const regimeBtns    = document.querySelectorAll(".regime-btn");

// ── Regime Toggle ─────────────────────────────────────────────────────────────
regimeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedRegime = btn.dataset.regime;
    regimeBtns.forEach((b) => b.classList.toggle("active", b === btn));

    // Recalculate if we already have a result
    if (lastResult) handleCalculate();
  });
});

// ── Calculate ─────────────────────────────────────────────────────────────────
calculateBtn.addEventListener("click", handleCalculate);

ctcInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleCalculate();
});

async function handleCalculate() {
  const rawCTC = ctcInput.value.trim();
  if (!rawCTC) {
    showToast("Please enter your CTC first", "error");
    ctcInput.focus();
    return;
  }

  const ctc = parseCTC(rawCTC);
  if (isNaN(ctc) || ctc <= 0) {
    showToast("Enter a valid CTC (e.g. 12L, 1200000)", "error");
    return;
  }
  if (ctc < 100000) {
    showToast("CTC seems too low. Enter annual CTC in ₹", "error");
    return;
  }

  setCalculating(true);

  try {
    const params = {
      ctc,
      regime:   selectedRegime,
      city:     citySelect.value,
      rentPaid: parseFloat(rentInput.value) || 0,
      age:      ageSelect.value,
    };

    const { data } = await api.calculateSalary(params);
    lastResult = data;

    renderResult(data);
    explainBtn.disabled = false;
    adviceBtn.disabled  = false;

    // Reset AI output
    setAIOutput("", false);
    document.getElementById("ai-output").innerHTML =
      '<span class="ai-placeholder">Click a button below to get AI-powered insights about your salary.</span>';

    showToast("Calculation complete!", "success");
  } catch (err) {
    showToast(err.message || "Calculation failed. Is the backend running?", "error");
    console.error(err);
  } finally {
    setCalculating(false);
  }
}

// ── AI Explain ────────────────────────────────────────────────────────────────
explainBtn.addEventListener("click", async () => {
  if (!lastResult) return;
  explainBtn.disabled = true;
  setAIOutput("", true);

  try {
    const { explanation } = await api.explainSalary(lastResult);
    setAIOutput(explanation);
  } catch (err) {
    setAIOutput("⚠ Could not get AI explanation. Check your Groq API key.");
    showToast("AI error: " + err.message, "error");
  } finally {
    explainBtn.disabled = false;
  }
});

// ── AI Advice ─────────────────────────────────────────────────────────────────
adviceBtn.addEventListener("click", async () => {
  if (!lastResult) return;
  adviceBtn.disabled = true;
  setAIOutput("", true);

  try {
    const { advice } = await api.getTaxAdvice({
      ctc:    lastResult.ctc,
      regime: selectedRegime,
      investmentInfo: "",
    });
    setAIOutput(advice);
  } catch (err) {
    setAIOutput("⚠ Could not get AI advice. Check your Groq API key.");
    showToast("AI error: " + err.message, "error");
  } finally {
    adviceBtn.disabled = false;
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Set default regime button
  document.querySelector('[data-regime="new"]').classList.add("active");

  // Hint: support "12L" style input
  ctcInput.placeholder = "e.g. 12L or 1200000";
});
