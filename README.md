# 🥦 NutriAi — AI-Powered Nutrition Tracker

A full-stack calorie and macro tracking web app inspired by CalAI. Log meals, track daily nutrition goals, and get AI-predicted calorie targets based on your body stats and fitness goal.

---

## ✨ Features

- **User Auth** — Signup, login, email verification, forgot/reset password (via Resend)
- **Onboarding** — 5-step profile setup (gender, body stats, goal, activity level, target weight)
- **ML-Predicted Targets** — Python ML service predicts your daily calories & macros using a trained model (with Mifflin-St Jeor fallback)
- **Food Search** — Search any dish by name and get instant nutrition data
- **Image Classification** — Upload a food photo and EfficientNet classifies it + returns nutrition
- **Dashboard** — Calorie ring, macro progress bars, weekly strip, meal log
- **Persistent Sessions** — JWT cookie-based auth, session restored on page refresh
- **PostgreSQL on Neon** — Cloud-hosted Postgres with a proper relational schema
- **Light / Dark Theme** — Toggle between green (light) and orange (dark) themes

---

## 🗂 Project Structure

```
├── backend/
│   ├── controllers/
│   │   ├── auth-controller.js
│   │   ├── profile-controller.js
│   │   ├── nutrition-controller.js
│   │   └── foodLog-controller.js
│   ├── database/
│   │   ├── connectionToDatabase.js   # pg Pool
│   │   └── schema.sql                # Run once to create tables
│   ├── middleware/
│   │   ├── verifyToken.js
│   │   └── requireOnboarding.js
│   ├── model/
│   │   ├── user.js                   # pg User query helpers
│   │   └── foodLog.js                # pg FoodLog query helpers
│   ├── routes/
│   │   ├── auth-route.js
│   │   ├── profile-route.js
│   │   ├── nutrition-route.js
│   │   └── foodLog-route.js
│   ├── resend/
│   │   ├── config.js
│   │   ├── email.js
│   │   └── email-template.js
│   ├── utils/
│   │   ├── generateJWTToken.js
│   │   └── generateVerificationToken.js
│   └── index.js
├── frontend/
│   └── src/
│       └── App.jsx                   # Single-file React app
├── ml-service/
│   ├── main.py                       # FastAPI server
│   ├── classifier.py                 # EfficientNet image classifier
│   ├── nutrition.py                  # Nutrition lookup
│   └── nutrition_db.py               # Nutrition database
├── .env                              # Environment variables (never commit)
└── package.json
```

---

## 🗄 Database Schema

Two tables with a 1-to-many relationship:

```
users (1) ──────────────── (many) food_logs
  id (UUID, PK)                     id (UUID, PK)
  name                              user_id (FK → users.id CASCADE)
  email (unique)                    dish_name
  password (bcrypt)                 meal_type
  is_verified                       calories
  age, height_cm, weight_kg         protein_g
  gender, goal, activity_level      carbs_g
  target_weight_kg                  fat_g
  is_onboarded                      portion_g
  target_calories                   logged_via
  target_protein_g                  image_url
  target_carbs_g                    log_date
  target_fat_g                      created_at
  created_at, updated_at
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- A [Neon](https://neon.tech) account (free tier works)
- A [Resend](https://resend.com) account for emails

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/nutriai.git
cd nutriai
```

### 2. Install dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..

# ML service
cd ml-service && pip install -r requirements.txt && cd ..
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL (Neon connection string)
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

### 4. Set up the database

Go to your [Neon dashboard](https://console.neon.tech) → SQL Editor, paste the contents of `backend/database/schema.sql` and click **Run**.

This creates both tables, enums, indexes, and the foreign key relationship.

### 5. Run the app

```bash
# Terminal 1 — Backend (from root)
npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — ML service
cd ml-service && uvicorn main:app --reload
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Create account |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| POST | `/verify-email` | Verify email with 6-digit code |
| POST | `/forgot-password` | Send reset link |
| POST | `/reset-password/:token` | Reset password |
| GET | `/check-auth` | Check session (restore on refresh) |

### Profile — `/api/profile`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/setup` | Complete onboarding |
| GET | `/` | Get profile + daily targets |
| PUT | `/update` | Update profile (recalculates targets) |

### Nutrition — `/api/nutrition`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/search` | Search nutrition by dish name |
| POST | `/classify` | Classify food from image upload |

### Food Log — `/api/food-log`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Log a meal |
| GET | `/dashboard?date=YYYY-MM-DD` | Daily dashboard data |
| GET | `/history` | Paginated meal history |
| GET | `/weekly` | Last 7 days summary |
| DELETE | `/:id` | Delete a log entry |

---

## 🧠 ML Service

The Python FastAPI service runs on port `8000` and exposes:

- `POST /predict` — Predicts daily calorie & macro targets from user profile using a trained ML model
- `POST /nutrition` — Returns nutrition data for a dish name
- `POST /classify` — Classifies a food image using EfficientNet and returns nutrition

If the ML service is down, the backend automatically falls back to a Mifflin-St Jeor BMR calculation.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), vanilla CSS-in-JS |
| Backend | Node.js, Express |
| Database | PostgreSQL (Neon) |
| ORM | Raw `pg` queries (Prisma migration planned) |
| Auth | JWT (httpOnly cookies) + bcrypt |
| Email | Resend |
| ML Service | Python, FastAPI, EfficientNet |

---

## 📌 Roadmap

- [ ] Load today's meals from DB on dashboard mount
- [ ] Meal type selector (breakfast / lunch / dinner / snack)
- [ ] Weekly progress charts
- [ ] Migrate from raw `pg` to Prisma
- [ ] Google OAuth
- [ ] Mobile app (React Native)

---

## 📄 License

MIT
