## Mental Ability Accelerator – Backend

Production-ready backend foundation for the **Mental Ability Accelerator** Micro‑SaaS.

### Tech Stack

- **Runtime**: Node.js (Express)
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt password hashing
- **Architecture**: MVC-style with clear separation of routes, controllers, models, middleware, and utils

### Folder Structure

- `server/` – server bootstrap and Express app
- `routes/` – route definitions (auth, tests, etc.)
- `controllers/` – request handlers and business logic orchestration
- `models/` – database access for each domain entity
- `middleware/` – auth, subscription, and error handling middlewares
- `utils/` – helpers for JWT, passwords, and error types
- `config/` – database configuration and schema definition

### Environment Setup

1. **Install dependencies**

```bash
npm install
```

2. **Create and configure `.env`**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Key variables:

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – strong secret for signing JWTs
- `JWT_EXPIRES_IN` – token lifetime (e.g. `7d`)
- `TRIAL_DAYS` – length of free trial for new users

3. **Create database schema**

Run the SQL in `config/schema.sql` against your PostgreSQL database (e.g. via `psql`, a GUI client, or a migration tool of your choice).

### Running the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API will listen on `http://localhost:PORT` (default `4000`).

### Core API Endpoints

#### Health Check

- **GET** `/health` – simple service status check.

#### Auth

- **POST** `/api/auth/register`
  - Body: `{ "name": string, "email": string, "password": string }`
  - Creates a new user, hashes password with bcrypt, returns user and JWT.

- **POST** `/api/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Verifies credentials and returns user and JWT.

#### Diagnostic Test

All diagnostic test endpoints require a valid `Authorization: Bearer <token>` header.

- **GET** `/api/tests/diagnostic/questions`
  - Returns **20 random questions** (id, text, options, topic, difficulty).
  - Answer keys and solutions are not exposed in this response.

- **POST** `/api/tests/diagnostic/submit`
  - Middlewares: `auth`, `subscription` (trial or active subscription required).
  - Body example:

```json
{
  "answers": [
    { "questionId": 1, "selectedOption": "A", "timeSpent": 12 },
    { "questionId": 2, "selectedOption": "C", "timeSpent": 18 }
  ]
}
```

  - Persists a `tests` record and related `user_answers`.
  - Calculates and returns:
    - Total score
    - Overall accuracy
    - Total time
    - **Topic-wise accuracy** based on the underlying question topics.

### Subscription & Trial Logic

- Every user gets a **7‑day trial** (configurable via `TRIAL_DAYS`) starting from `users.created_at`.
- After trial expiry, access to premium routes (like diagnostic submission) requires an **active subscription** in the `subscriptions` table (`status = 'active'` and `expiry_date` in the future).
- If no active subscription is found and the trial has expired, the subscription middleware responds with HTTP **402** and a message prompting subscription.

You can now build additional premium endpoints by reusing the same `auth` and `subscription` middlewares.

