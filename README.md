# 🏦 SalaryGuru — Indian In-Hand Salary Calculator

> Calculate exact monthly take-home salary under Indian tax regime (FY 2024-25), compare Old vs New regime, and get AI-powered insights via Groq + Llama 3.1.

---

## 📁 Project Structure

```
salary-calculator/
├── frontend/                  ← Deployed on Vercel
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js             ← Main app logic (entry point)
│       ├── api.js             ← All backend API calls
│       ├── ui.js              ← DOM rendering helpers
│       ├── chart.js           ← SVG donut chart
│       └── formatter.js       ← ₹ formatting utilities
│
├── backend/                   ← Deployed on Render
│   ├── server.js              ← Express entry point
│   ├── routes/
│   │   ├── salary.routes.js
│   │   └── ai.routes.js
│   ├── controllers/
│   │   ├── salary.controller.js
│   │   └── ai.controller.js
│   ├── services/
│   │   ├── taxCalculator.service.js   ← Core Indian tax logic
│   │   └── groqAI.service.js          ← Groq/Llama integration
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── package.json
│   └── .env.example
│
├── vercel.json                ← Vercel deployment config
└── README.md
```

---

## 🚀 Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in GROQ_API_KEY in .env
npm run dev
```

Backend runs at: `http://localhost:3001`

### 2. Frontend

Open `frontend/index.html` with any local server:

```bash
# Using VS Code Live Server, or:
npx serve frontend
```

> Make sure `window.BACKEND_URL` in `index.html` points to `http://localhost:3001` for local dev.

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build command**: `npm install`
4. Set **Start command**: `node server.js`
5. Add environment variables:
   - `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)
   - `FRONTEND_URL` = your Vercel URL (e.g. `https://salary-guru.vercel.app`)
6. Deploy → copy the Render URL (e.g. `https://salary-guru-api.onrender.com`)

### Frontend → Vercel

1. Update `window.BACKEND_URL` in `frontend/index.html` with your Render URL
2. Push entire project to GitHub
3. Import on [vercel.com](https://vercel.com) → it auto-detects `vercel.json`
4. Deploy!

---

## 🧮 Tax Calculation Features

| Feature | Details |
|---|---|
| **CTC Parsing** | Supports `12L`, `1200000`, `1.2Cr` |
| **Salary Breakdown** | Basic, HRA, DA, LTA, Medical, Special Allowance |
| **EPF** | 12% employee + 12% employer on ₹15,000 ceiling |
| **HRA Exemption** | Metro/non-metro, actual rent, 50%/40% of basic |
| **Old Regime** | 80C (₹1.5L), 80D (₹25K), HRA, Std ₹50K |
| **New Regime** | Std deduction ₹75K (Budget 2024), rebate up to ₹7L |
| **Surcharge** | 10%–37% (25% cap under new regime) |
| **Health & Edu Cess** | 4% on total tax |
| **Section 87A Rebate** | ₹12,500 (old) / ₹25,000 (new) |
| **Professional Tax** | ₹2,400/year (Maharashtra default) |

---

## 🤖 AI Features (Groq + Llama 3.1)

- **Explain My Salary** — Plain-English breakdown of your CTC → in-hand
- **Tax Saving Tips** — Personalized 80C, 80D, NPS advice

Get your free API key at: [console.groq.com](https://console.groq.com)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/salary/calculate` | Full salary calculation |
| POST | `/api/salary/compare-regime` | Old vs New regime comparison |
| POST | `/api/ai/explain` | AI explanation of result |
| POST | `/api/ai/advice` | AI tax saving advice |

### Sample Request

```json
POST /api/salary/calculate
{
  "ctc": 1200000,
  "regime": "new",
  "city": "metro",
  "rentPaid": 25000,
  "age": "below60"
}
```

---

## ⚠️ Disclaimer

This calculator is for informational purposes only. For exact tax computation, consult a qualified CA or use the official Income Tax portal.
