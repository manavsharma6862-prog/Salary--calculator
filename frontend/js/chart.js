/**
 * chart.js — SVG Donut chart renderer
 */

/**
 * Render a donut chart into #donut-container
 * @param {Array<{label, value, color}>} segments
 */
export function renderDonut(segments, containerId = "donut-container") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return;

  const SIZE   = 120;
  const CX     = 60;
  const CY     = 60;
  const R      = 46;
  const INNER  = 28;
  const circumference = 2 * Math.PI * R;

  let cumulativePercent = 0;

  const slices = segments.map((seg) => {
    const pct   = seg.value / total;
    const start = cumulativePercent;
    cumulativePercent += pct;

    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle   = cumulativePercent * 2 * Math.PI - Math.PI / 2;

    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);

    const xi1 = CX + INNER * Math.cos(startAngle);
    const yi1 = CY + INNER * Math.sin(startAngle);
    const xi2 = CX + INNER * Math.cos(endAngle);
    const yi2 = CY + INNER * Math.sin(endAngle);

    const largeArc = pct > 0.5 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${INNER} ${INNER} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      "Z",
    ].join(" ");

    return { ...seg, d, pct };
  });

  const svgPaths = slices
    .map((s) => `<path d="${s.d}" fill="${s.color}" opacity="0.9"><title>${s.label}: ₹${Math.round(s.value).toLocaleString("en-IN")}</title></path>`)
    .join("");

  const svgHTML = `
    <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
      ${svgPaths}
      <circle cx="${CX}" cy="${CY}" r="${INNER - 2}" fill="#111118"/>
    </svg>`;

  const legendHTML = segments
    .map(
      (s) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${s.color}"></span>
        <span>${s.label}</span>
        <span>${((s.value / total) * 100).toFixed(1)}%</span>
      </div>`
    )
    .join("");

  container.innerHTML = `
    <div class="donut-wrap">
      ${svgHTML}
      <div class="donut-legend">${legendHTML}</div>
    </div>`;
}
