const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are SalaryGuru, an expert Indian payroll and tax advisor.
You help salaried employees understand their CTC, in-hand salary, tax obligations, and savings under Indian tax laws (FY 2024-25).
Always be concise, friendly, and use Indian Rupee (₹) with proper formatting (lakhs/crores).
Give practical, actionable advice. Keep responses under 200 words unless asked for detailed breakdown.
Never give generic disclaimers — be direct and helpful like a knowledgeable friend.`;

/**
 * Generate AI explanation for a salary calculation result
 */
async function explainSalary(salaryData) {
  const { ctc, inHand, tax, comparison, effectiveTaxRate, regime } = salaryData;

  const userMessage = `
My CTC is ₹${(ctc / 100000).toFixed(2)} LPA.
Under ${regime} tax regime:
- Monthly in-hand: ₹${inHand.monthly.toLocaleString("en-IN")}
- Annual in-hand: ₹${inHand.annual.toLocaleString("en-IN")}
- Total tax (TDS): ₹${tax.totalTax.toLocaleString("en-IN")}
- Effective tax rate: ${effectiveTaxRate}%
- Better regime: ${comparison.betterRegime} (saves ₹${comparison.savings.toLocaleString("en-IN")})

Please explain my salary breakdown simply and tell me if I'm on the better tax regime. Give me 2-3 quick tips to save more tax.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || "Unable to generate explanation.";
}

/**
 * AI tax saving advice based on user's profile
 */
async function getTaxAdvice({ ctc, regime, investmentInfo }) {
  const userMessage = `
My annual CTC is ₹${(ctc / 100000).toFixed(2)} LPA. I'm on the ${regime} tax regime.
Additional info: ${investmentInfo || "No investments declared yet."}

Give me a personalized Indian tax saving strategy for FY 2024-25.
Cover: 80C, 80D, HRA, NPS, and any other applicable sections.
Be specific with amounts I should invest in each instrument.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  return completion.choices[0]?.message?.content || "Unable to generate advice.";
}

module.exports = { explainSalary, getTaxAdvice };
