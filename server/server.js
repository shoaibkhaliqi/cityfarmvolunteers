import express from "express";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";

const { Pool } = pkg;

const app = express();

const SECRET_KEY = "shoaibkhaliqi";

app.use(express.json());

const corsOptions = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "x-access-token, content-type");
  next();
};
app.use(corsOptions);

const pool = new Pool({
  user: "shoaib",
  host: "localhost",
  database: "cityfarm",
  password: "shoaib",
  port: 5432,
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await pool.query(
      "SELECT * FROM volunteers WHERE username = $1",
      [username]
    );
    if (user.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "This user name is already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO volunteers (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM volunteers WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, SECRET_KEY, {
      expiresIn: "24h",
    });
    res.cookie("auth-token", token, { httpOnly: true });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/sessions", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM sessions WHERE volunteer_id IS NULL FOR UPDATE"
    );

    return res
      .status(200)
      .json({ message: "The sessions have been listed", data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/sessions/:id/claim", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const client = await pool.connect();
    await client.query("BEGIN");
    const volunteerId = req.body.volunteerId;

    const session = await client.query(
      "SELECT * FROM sessions WHERE id = $1 AND volunteer_id IS NULL FOR UPDATE",
      [id]
    );

    if (session.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "The session is not available" });
    }

    await client.query("UPDATE sessions SET volunteer_id = $1 WHERE id = $2", [
      volunteerId,
      id,
    ]);

    await client.query("COMMIT");

    return res.status(200).json({ message: "The session has been claimed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/sessions/:id/cancel", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const client = await pool.connect();
    await client.query("BEGIN");
    const volunteerId = req.body.volunteerId;

    const session = await client.query(
      "SELECT * FROM sessions WHERE id = $1 AND volunteer_id = $2 FOR UPDATE",
      [id, volunteerId]
    );

    if (session.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "The session is not found or already canceled" });
    }

    await client.query(
      "UPDATE sessions SET volunteer_id = NULL WHERE id = $1",
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({ message: "The session has been canceled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/mysessions/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the route parameters

    const rows = await pool.query(
      "SELECT * FROM sessions WHERE volunteer_id = $1",
      [userId]
    );
    return res
      .status(200)
      .json({ message: "The sessions have been listed", data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
