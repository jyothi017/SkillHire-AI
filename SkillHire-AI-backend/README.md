# SkillHire AI Backend (Starter)

Backend for the existing SkillHire AI HTML, CSS, and JavaScript frontend.

## Stack

- Node.js and Express REST API
- PostgreSQL database
- `pg` for parameterized database queries

## 1. Requirements

Install Node.js and PostgreSQL.

Keep your frontend files (`index.html`, `style.css`, and `script.js`) in a separate frontend folder.

## 2. Create the Database

Open pgAdmin Query Tool or psql and run:

```sql
CREATE DATABASE "SkillHire-AI";
```

Connect to the `SkillHire-AI` database and execute `database/schema.sql` if the tables have not already been created.

## 3. Configure the Backend

Open a terminal in the backend folder and run:

```bash
npm install
```

Copy `.env.example` to `.env` and update `DATABASE_URL` with your PostgreSQL username and password.

Example configuration:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/SkillHire-AI
FRONTEND_ORIGIN=http://127.0.0.1:5500
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

Do not share or commit your `.env` file.

## 4. Start the API

Run:

```bash
npm run dev
```

Open this URL to check the API:

http://localhost:5000/api/health

A successful response indicates that the API and database are connected.

## API Endpoints

- `GET /api/health` — Check server and database status.
- `GET /api/questions?skill=Java&approved=true` — List saved questions.
- `POST /api/questions` — Save a question.
- `PATCH /api/questions/:id/review` — Approve or unapprove a question.
- `POST /api/sessions` — Save an interview session.
- `GET /api/sessions` — List saved sessions.
- `POST /api/sessions/:id/results` — Save a self-score for a session question.

## Example: Save a Question

Send a JSON request to `POST http://localhost:5000/api/questions`.

```json
{
  "role": "Java Developer",
  "skill": "Java",
  "text": "What is the difference between JDK, JRE and JVM?",
  "difficulty": "B",
  "type": "Technical",
  "expectedPoints": [
    "JVM runs bytecode",
    "JDK includes development tools"
  ],
  "source": "Bank",
  "approved": false
}
```

## Important Integration Note

The existing `script.js` uses browser `localStorage` and a built-in question bank.

The frontend will not save data to PostgreSQL until API calls using `fetch()` are integrated into `script.js`.

The backend does not currently connect to a live AI model. Its endpoints save and retrieve questions and interview sessions. An LLM integration can be added later for AI-generated questions.

## Security and Limitations

This starter does not include authentication. Before exposing it publicly or storing real candidate data, add authentication, authorization, rate limiting, input validation, and appropriate privacy controls.

Never commit database passwords, API keys, JWT secrets, or other sensitive credentials.

Human review is required before using generated interview questions in real hiring decisions.