
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN.split(",").map((x) => x.trim())
      : true,
  })
);
app.use(express.json({ limit: "1mb" }));

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

if (pool) {
  pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL pool error:", error.message);
  });
}

function requireDatabase(req, res, next) {
  if (!pool) {
    return res.status(503).json({
      error: "Database is not configured. Check DATABASE_URL in .env.",
    });
  }
  next();
}

function handleError(error, req, res, next) {
  console.error("API error:", error.message);
  console.error("PostgreSQL error code:", error.code || "N/A");

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: "Unexpected server error.",
    ...(process.env.NODE_ENV !== "production"
      ? { detail: error.message, code: error.code || null }
      : {}),
  });
}

app.get("/", (req, res) => {
  res.json({
    name: "SkillHire AI API",
    status: "running",
    endpoints: [
      "GET /api/health",
      "GET /api/questions",
      "POST /api/questions",
      "PATCH /api/questions/:id/review",
      "POST /api/sessions",
      "GET /api/sessions",
      "POST /api/sessions/:id/results",
    ],
  });
});

// Check connection, database name, and expected tables.
app.get("/api/health", async (req, res) => {
  if (!pool) {
    return res.status(503).json({
      api: "ok",
      database: "not configured",
    });
  }

  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        to_regclass('public.questions') AS questions_table,
        to_regclass('public.interview_sessions') AS sessions_table,
        to_regclass('public.session_questions') AS session_questions_table,
        to_regclass('public.session_results') AS results_table
    `);

    const info = result.rows[0];
    const tablesExist = Boolean(
      info.questions_table &&
      info.sessions_table &&
      info.session_questions_table &&
      info.results_table
    );

    res.status(tablesExist ? 200 : 503).json({
      api: "ok",
      database: tablesExist ? "connected" : "connected, but tables are missing",
      ...info,
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(503).json({
      api: "ok",
      database: "error",
      message: error.message,
    });
  }
});

// List saved questions. Optional filters: ?skill=Java&approved=true
app.get("/api/questions", requireDatabase, async (req, res, next) => {
  try {
    const values = [];
    const conditions = [];

    if (req.query.skill) {
      values.push(String(req.query.skill));
      conditions.push(`skill = $${values.length}`);
    }

    if (
      req.query.approved === "true" ||
      req.query.approved === "false"
    ) {
      values.push(req.query.approved === "true");
      conditions.push(`approved = $${values.length}`);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT id, role, skill, question_text, difficulty, question_type,
              expected_points, source, approved, created_at
       FROM public.questions
       ${where}
       ORDER BY created_at DESC`,
      values
    );

    res.json({
      count: result.rowCount,
      questions: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Save a question.
app.post("/api/questions", requireDatabase, async (req, res, next) => {
  try {
    const {
      role,
      skill,
      text,
      difficulty = "I",
      type = "Technical",
      expectedPoints = [],
      source = "User",
      approved = false,
    } = req.body || {};

    if (
      !String(role || "").trim() ||
      !String(skill || "").trim() ||
      !String(text || "").trim()
    ) {
      return res.status(400).json({
        error: "role, skill, and text are required.",
      });
    }

    if (!["B", "I", "A"].includes(difficulty)) {
      return res.status(400).json({
        error: "difficulty must be B, I, or A.",
      });
    }

    if (
      !Array.isArray(expectedPoints) ||
      expectedPoints.some((p) => typeof p !== "string")
    ) {
      return res.status(400).json({
        error: "expectedPoints must be an array of strings.",
      });
    }

    const result = await pool.query(
      `INSERT INTO public.questions
       (role, skill, question_text, difficulty, question_type,
        expected_points, source, approved)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, role, skill, question_text, difficulty,
                 question_type, expected_points, source, approved, created_at`,
      [
        role.trim(),
        skill.trim(),
        text.trim(),
        difficulty,
        type,
        expectedPoints,
        source,
        Boolean(approved),
      ]
    );

    res.status(201).json({ question: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Approve or unapprove a question.
app.patch(
  "/api/questions/:id/review",
  requireDatabase,
  async (req, res, next) => {
    try {
      const { approved } = req.body || {};

      if (typeof approved !== "boolean") {
        return res.status(400).json({
          error: "approved must be true or false.",
        });
      }

      const result = await pool.query(
        `UPDATE public.questions
         SET approved = $1
         WHERE id = $2
         RETURNING id, role, skill, question_text, difficulty,
                   question_type, expected_points, source, approved, created_at`,
        [approved, req.params.id]
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: "Question not found." });
      }

      res.json({ question: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
);

// Save a session and its questions in one transaction.
app.post("/api/sessions", requireDatabase, async (req, res, next) => {
  let client;

  try {
    const {
      role,
      level = "F",
      skills = [],
      questions = [],
    } = req.body || {};

    if (!String(role || "").trim()) {
      return res.status(400).json({ error: "role is required." });
    }

    if (!Array.isArray(skills) || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "skills and questions must be arrays.",
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const saved = await client.query(
      `INSERT INTO public.interview_sessions
       (role, experience_level, skills)
       VALUES ($1, $2, $3)
       RETURNING id, role, experience_level, skills, created_at`,
      [role.trim(), level, skills]
    );

    const session = saved.rows[0];
    let savedQuestionCount = 0;

    for (const q of questions) {
      if (
        !q ||
        !String(q.text || "").trim() ||
        !String(q.skill || "").trim()
      ) {
        continue;
      }

      await client.query(
        `INSERT INTO public.session_questions
         (session_id, question_text, skill, difficulty,
          question_type, expected_points)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          session.id,
          String(q.text).trim(),
          String(q.skill).trim(),
          ["B", "I", "A"].includes(q.difficulty) ? q.difficulty : "I",
          q.type || "Technical",
          Array.isArray(q.expectedPoints) ? q.expectedPoints : [],
        ]
      );

      savedQuestionCount++;
    }

    await client.query("COMMIT");

    res.status(201).json({
      session,
      savedQuestionCount,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }
    next(error);
  } finally {
    if (client) client.release();
  }
});

// List sessions with question counts.
app.get("/api/sessions", requireDatabase, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.role, s.experience_level, s.skills, s.created_at,
              COUNT(q.id)::int AS question_count
       FROM public.interview_sessions s
       LEFT JOIN public.session_questions q ON q.session_id = s.id
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );

    res.json({ sessions: result.rows });
  } catch (error) {
    next(error);
  }
});

// Save a candidate's score for a question in a session.
app.post(
  "/api/sessions/:id/results",
  requireDatabase,
  async (req, res, next) => {
    try {
      const { questionId, score, answer = "" } = req.body || {};

      if (
        !questionId ||
        !Number.isInteger(score) ||
        score < 1 ||
        score > 5
      ) {
        return res.status(400).json({
          error: "questionId and integer score from 1 to 5 are required.",
        });
      }

      const result = await pool.query(
        `INSERT INTO public.session_results
         (session_id, session_question_id, answer_text, score)
         SELECT $1, q.id, $3, $4
         FROM public.session_questions q
         WHERE q.id = $2 AND q.session_id = $1
         RETURNING id, session_id, session_question_id,
                   answer_text, score, created_at`,
        [req.params.id, questionId, String(answer), score]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          error: "Session or question not found in that session.",
        });
      }

      res.status(201).json({ result: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.use(handleError);

const server = app.listen(PORT, () => {
  console.log(`SkillHire AI API running at http://localhost:${PORT}`);
});

async function shutdown() {
  console.log("Shutting down SkillHire AI API...");
  server.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
