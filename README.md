# 💍 Tamil Muslim Nikkah - Matrimonial Platform (MERN Stack)

A full-stack Islamic matrimonial web application tailored for the Tamil-speaking Muslim community across Tamil Nadu and worldwide.

---

## 📁 Project Architecture & Directory Structure

```text
Matrimony/
├── backend/                        # Express.js & MongoDB API
│   ├── config/                     # Database connection (Mongoose & Atlas)
│   ├── controllers/                # Business logic (Auth, Profiles, Admin, Payment, Support)
│   ├── middleware/                 # JWT Auth, KYC upload (Multer), view-limits, Admin guards
│   ├── models/                     # Mongoose schemas (User, Profile, SupportTicket)
│   ├── routes/                     # API route declarations
│   ├── services/                   # Email (Nodemailer) & Razorpay integrations
│   ├── uploads/                    # Protected KYC document & profile uploads
│   ├── utils/                      # Seed data script & Tamil Nadu districts constants
│   ├── .env                        # Environment configurations (Port, Mongo URI, Secrets)
│   ├── package.json                # Backend dependencies & scripts
│   ├── server.js                   # Express application entry point
│   └── test_integration.js         # Automated end-to-end integration test suite
│
├── frontend/                       # React.js + Vite + Tailwind CSS
│   ├── public/                     # Static assets & icons
│   ├── src/
│   │   ├── assets/                 # Brand assets
│   │   ├── components/             # Reusable UI components:
│   │   │   ├── AdminDashboard.jsx  # KYC approval & user management
│   │   │   ├── FilterBox.jsx       # 38 Tamil Nadu districts & criteria filter
│   │   │   ├── Navbar.jsx          # Header with user status & quick navigation
│   │   │   ├── PaymentModal.jsx    # Razorpay checkout & subscription upgrades
│   │   │   ├── ProfileCard.jsx     # Profile display & Islamic etiquette badge
│   │   │   ├── SupportModal.jsx    # Helpdesk ticketing interface
│   │   │   ├── TamilInput.jsx      # Tamil virtual keyboard & phonetics
│   │   │   └── TamilVirtualKeyboard.jsx # On-screen Tamil Unicode character grid
│   │   ├── utils/
│   │   │   ├── districts.js        # 38 Districts of Tamil Nadu (English & Tamil)
│   │   │   └── tamilTransliterate.js # Real-time English-to-Tamil phonetic engine
│   │   ├── App.jsx                 # Multi-step registration, routing & state
│   │   ├── App.css                 # Custom glassmorphism, animations & styling
│   │   ├── index.css               # Tailwind CSS directives
│   │   └── main.jsx                # React DOM mounting
│   ├── index.html                  # HTML5 entry with Islamic green/gold theme
│   ├── package.json                # Frontend dependencies & Vite configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS theme extension
│   └── vite.config.js              # Vite server & API reverse proxy
│
├── package.json                    # Root orchestration (concurrently runner)
├── .gitignore                      # Git ignore rules for MERN layout
└── README.md                       # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Root Orchestration (Run Both Tiers)
From the root directory (`Matrimony/`):

```bash
# Install root orchestrator dependencies
npm install

# Run BOTH backend and frontend concurrently with live reloading
npm run dev
```

### 2. Running Services Individually

#### Backend (API Server)
```bash
# Navigate to backend or run via npm prefix:
npm run server

# Or run directly in backend/:
cd backend
npm run dev      # Starts on http://localhost:5000 with Node --watch
```

#### Frontend (Vite Dev Server)
```bash
# Run via npm prefix:
npm run client

# Or run directly in frontend/:
cd frontend
npm run dev      # Starts on http://localhost:5173
```

---

## 🧪 Testing & Data Seeding

- **Seed Sample Matrimonial Profiles**:
  ```bash
  npm run seed
  ```
- **Run Backend Integration Tests**:
  ```bash
  # Ensure backend server is running on http://localhost:5000, then:
  npm run test:backend
  ```

---

## 🔒 Environment Configuration (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Express server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas or Local connection string |
| `JWT_SECRET` | Secret key for JSON Web Tokens |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Merchant Key Secret |
| `SMTP_HOST` / `SMTP_PORT` | SMTP Email server credentials |
