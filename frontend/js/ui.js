/**
 * ui.js — DOM rendering helpers
 */

import { formatINR, toShorthand } from "./formatter.js";
import { renderDonut } from "./chart.js";

/**
 * Show toast notification
 */
export function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/**
 * Populate the full result section from API response
 */
export function renderResult(data) {
  const { ctc, inHand, tax, deductions, components, effectiveTaxRate, comparison, regime } = data;

  // Hero
  document.getElementById("result-monthly").textContent = formatINR(inHand.monthly);
  document.getElementById("result-annual").textContent  = `${formatINR(inHand.annual)} / year`;
  document.getElementById("result-section").classList.remove("hidden");

  // Salary components
  renderBreakdownList("components-list", [
    { name: "Basic Salary",         value: components.annual.basic,        type: "positive" },
    { name: "HRA",                  value: components.annual.hra,          type: "positive" },
    { name: "LTA",                  value: components.annual.lta,          type: "positive" },
    { name: "Medical Allowance",    value: components.annual.medicalAllow, type: "positive" },
    { name: "Special Allowance",    value: components.annual.specialAllow, type: "positive" },
    { name: "Gross Annual",         value: components.annual.gross,        type: "neutral", bold: true },
  ]);

  // Deductions
  renderBreakdownList("deductions-list", [
    { name: "EPF (Employee 12%)",   value: deductions.epf,            type: "negative" },
    { name: "Professional Tax",     value: deductions.professionalTax, type: "negative" },
    { name: `TDS (${regime === "old" ? "Old" : "New"} Regime)`, value: deductions.tds, type: "negative" },
    { name: "Effective Tax Rate",   value: `${effectiveTaxRate}%`,    type: "neutral", raw: true },
    { name: "Total Deductions",     value: deductions.total,          type: "negative", bold: true },
  ]);

  // Regime comparison
  renderComparison(comparison);

  // Donut
  const gross = components.annual.gross;
  renderDonut([
    { label: "In-Hand",   value: inHand.annual,        color: "#e8b84b" },
    { label: "Tax (TDS)", value: deductions.tds,        color: "#e74c5e" },
    { label: "EPF",       value: deductions.epf,        color: "#4fa3ff" },
    { label: "Prof. Tax", value: deductions.professionalTax, color: "#2ecc80" },
  ], "donut-container");
}

function renderBreakdownList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = items
    .map(
      (item) => `
      <li class="breakdown-item" ${item.bold ? 'style="font-weight:600;border-top:1px solid var(--border);margin-top:0.25rem;padding-top:0.75rem"' : ""}>
        <span class="name">${item.name}</span>
        <span class="value ${item.type === "neutral" ? "" : item.type}">
          ${item.raw ? item.value : formatINR(item.value)}
        </span>
      </li>`
    )
    .join("");
}

function renderComparison(comparison) {
  const oldCard = document.getElementById("compare-old");
  const newCard = document.getElementById("compare-new");
  if (!oldCard || !newCard) return;

  const better = comparison.betterRegime;

  oldCard.classList.toggle("winner", better === "old");
  newCard.classList.toggle("winner", better === "new");

  oldCard.innerHTML = `
    <div class="regime-label">Old Regime</div>
    <div class="regime-amount">${formatINR(comparison.old.inHandMonthly)}<span style="font-size:0.7rem;color:var(--muted)">/mo</span></div>
    <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);margin-top:0.3rem">Tax: ${formatINR(comparison.old.totalTax)}</div>
    ${better === "old" ? '<div class="winner-badge">✓ Better</div>' : ""}
  `;

  newCard.innerHTML = `
    <div class="regime-label">New Regime</div>
    <div class="regime-amount">${formatINR(comparison.new.inHandMonthly)}<span style="font-size:0.7rem;color:var(--muted)">/mo</span></div>
    <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--muted);margin-top:0.3rem">Tax: ${formatINR(comparison.new.totalTax)}</div>
    ${better === "new" ? '<div class="winner-badge">✓ Better</div>' : ""}
  `;

  document.getElementById("savings-note").textContent =
    `Switch to ${better} regime to save ${formatINR(comparison.savings)} annually`;
}

/**
 * Show / hide loading state on calculate button
 */
export function setCalculating(loading) {
  const btn = document.getElementById("btn-calculate");
  btn.disabled  = loading;
  btn.textContent = loading ? "Calculating…" : "Calculate In-Hand ↗";
}

/**
 * Update AI output area
 */
export function setAIOutput(text, loading = false) {
  const el = document.getElementById("ai-output");
  el.classList.toggle("loading", loading);
  if (loading) {
    el.innerHTML = '<span class="ai-placeholder">SalaryGuru is thinking…</span>';
  } else {
    el.textContent = text;
  }
}
