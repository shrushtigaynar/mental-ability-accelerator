# Mental Ability Accelerator

**A full-stack aptitude training platform with adaptive recommendations, cognitive profiling, and real-time collaboration.**

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios, Socket.io-client |
| **Backend** | Node.js, Express 4, Socket.io 4, JWT, bcryptjs, Nodemailer, Morgan |
| **Database** | PostgreSQL |

---

## Features

- **Training Modes** — Memory, Logic, Speed Training, and daily Focus Sessions
- **Adaptive Recommendations** — questions selected based on weak topics and cognitive level
- **Cognitive Profile** — tracks avg speed, accuracy, guessing index, and overthinking index per user
- **Real-Time Collaboration** — shared sessions via invite code with live leaderboard and in-session chat (Socket.io)
- **Friend Streaks & Leaderboard** — friend-based social layer with streak tracking
- **Test History & Analytics** — per-session and per-topic performance breakdown
- **Auth & Subscriptions** — JWT authentication with a 7-day trial and subscription middleware

---

## Project Structure

```
mental-ability-accelerator/
├── backend/
│   ├── config/           # DB connection, schema, migrations
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, error handler, subscription guard
│   ├── models/           # SQL queries
│   ├── routes/           # Express routers
│   ├── server/           # app.js, server.js, collaborationSocket.js
│   ├── services/         # cognitiveService, recommendationService, weakTopicService
│   ├── seeds/            # Question seeder
│   └── utils/            # JWT, password, ApiError helpers
└── maa-frontend/
    └── src/
        ├── api/          # Axios modules (auth, dashboard, practice)
        ├── components/   # Navbar, Sidebar, Hero, Features, Footer
        ├── pages/        # All route-level page components
        └── utils/        # Auth token helpers
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/mental-ability-accelerator.git

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../maa-frontend && npm install
```

### Environment Setup

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:

```env
PORT=4000
DATABASE_URL=postgres://username:password@localhost:5432/maa_db
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
TRIAL_DAYS=7
BCRYPT_SALT_ROUNDS=10
```

### Database Setup

```bash
# Run base schema
psql -U postgres -d maa_db -f backend/config/schema.sql

# Run advanced features migration
psql -U postgres -d maa_db -f backend/config/migrations/001_advanced_features.sql

# Or restore from the included backup
psql -U postgres -d maa_db -f maa_backup.sql

# Optional: seed questions
node backend/seeds/seedMoreQuestions.js
```

### Run

```bash
# Backend (http://localhost:4000)
cd backend
npm run dev

# Frontend (http://localhost:5173)
cd maa-frontend
npm run dev
```

---

## API Routes

| Prefix | Description |
|--------|-------------|
| `/api/auth` | Register, Login |
| `/api/tests` | Fetch questions, submit test |
| `/api/practice` | Practice modes and submission |
| `/api/analytics` | Performance analytics and cognitive profile |
| `/api/recommendations` | AI-personalised question feed |
| `/api/dashboard` | Streak, focus, and session stats |
| `/api/collaboration` | Create/join sessions, send invites |
| `/api/leaderboard` | Global leaderboard |
| `/api/friends` | Friend requests and streaks |

All protected routes require: `Authorization: Bearer <token>`

### WebSocket Events

| Emit | Receive | Description |
|------|---------|-------------|
| `join-session` | `participant-joined` | Join a collaboration session |
| `sync-question` | `question-display` | Sync question to all participants |
| `sync-answer` | `answer-update`, `leaderboard-update` | Broadcast answer and scores |
| `chat` | `chat-message` | In-session group chat |
| `leave-session` | `participant-left` | Leave session |

---

## License

MIT
