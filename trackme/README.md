# Dôti — AI Accountability Platform

> Built by **S / Y A N** · Daily learning logs, AI restructuring, mentor sign-off flow.

---

## What it does

1. **Mentee writes** their daily learning log (free-form)
2. **Groq AI restructures** it into a professional, titled, topic-tagged log
3. **Mentee picks a difficulty** → AI generates a single verification question
4. **If they pass** → option to edit the log or send it to mentor
5. **Mentor receives** a beautifully formatted email with a one-click sign button
6. **Mentee gets notified** the moment it's signed

Plus: streak counter, projects, mentor/mentee relationships, notifications, dark mode.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Urbanist font |
| Backend | FastAPI + Python |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Groq (llama-3.3-70b-versatile) |
| Email | Resend |
| Styling | CSS custom properties (no framework) |

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Copy your **Project URL**, **anon key**, and **service role key**

### 2. Resend

1. Sign up at [resend.com](https://resend.com)
2. Verify a sending domain or use their sandbox
3. Copy your API key

### 3. Groq

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key

---

## Running the Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env
# Edit .env with your Supabase, Groq, and Resend keys

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be at `http://localhost:8000`  
Docs at `http://localhost:8000/docs`

---

## Running the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and fill environment variables
cp .env.example .env
# Edit .env — add your Supabase URL and anon key

# Start dev server
npm run dev
```

App will be at `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-key
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=Dôti@yourdomain.com
APP_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
SECRET_KEY=change-this-in-production
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/logs/create` | Submit raw log → AI restructures |
| POST | `/api/logs/generate-question` | Pick difficulty → get question |
| POST | `/api/logs/verify-answer` | Submit answer → AI evaluates |
| PUT | `/api/logs/edit` | Edit structured log |
| POST | `/api/logs/send-to-mentor` | Send log via email |
| GET | `/api/logs/my-logs` | List all logs |
| GET | `/api/logs/streak` | Get streak data |
| GET | `/sign/{token}` | Mentor sign page (from email) |
| POST | `/sign/{token}/confirm` | Mentor confirms signing |
| POST | `/api/projects/create` | Create a project |
| GET | `/api/projects/my-projects` | List projects |
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/{id}/read` | Mark notification read |
| GET | `/api/profile` | Get profile + streak |
| PUT | `/api/profile` | Update profile |
| POST | `/api/mentor/request` | Mentee requests mentor |
| POST | `/api/mentor/respond` | Mentor accepts/declines |
| GET | `/api/mentor/my-mentor` | Get my active mentor |

---

## Deployment

### Backend → Railway / Render

```bash
# Set all environment variables in your hosting dashboard
# Start command:
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Frontend → Vercel

```bash
# Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL in Vercel dashboard
npm run build
# Deploy dist/ folder
```

### After deploying

Update `APP_URL` in backend `.env` to your Vercel URL so signing email links point correctly.

---

## Project Structure

```
Dôti/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoadingScreen.jsx    # Azure-inspired loading animation
│   │   │   ├── AuthPage.jsx         # Login + Signup
│   │   │   ├── Sidebar.jsx          # Left nav with theme toggle
│   │   │   ├── Home.jsx             # Dashboard with 5 cards
│   │   │   ├── Chat.jsx             # Full AI log flow (5 stages)
│   │   │   ├── Notifications.jsx    # Real-time notif feed
│   │   │   ├── Profile.jsx          # User profile + stats
│   │   │   └── modals/
│   │   │       ├── CreateProjectModal.jsx
│   │   │       ├── AddMentorModal.jsx
│   │   │       └── BecomeMentorModal.jsx
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx     # Light/dark theme
│   │   │   └── AuthContext.jsx      # Supabase auth
│   │   ├── hooks/useToast.jsx
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   └── api.js              # All backend API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Full design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py                     # FastAPI app
│   ├── config.py                   # Settings from .env
│   ├── models.py                   # Pydantic schemas
│   ├── dependencies.py             # Auth middleware
│   ├── routes/
│   │   ├── logs.py                 # Core AI flow
│   │   ├── sign.py                 # Mentor signing page
│   │   ├── projects.py             # Projects CRUD
│   │   └── notifications.py        # Notifications + profile + mentor
│   ├── services/
│   │   ├── groq_service.py         # AI: restructure, question, evaluate
│   │   ├── supabase_service.py     # DB operations + streak logic
│   │   └── resend_service.py       # Email templates
│   └── requirements.txt
├── supabase/
│   └── schema.sql                  # Full DB schema with RLS
└── README.md
```

---

Built with ♟ by Adetu Siyan · Dôti v1.0
