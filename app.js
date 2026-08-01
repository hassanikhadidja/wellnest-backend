const express = require("express");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./config/connectDB");
const seedAdmin = require("./utils/seedAdmin");

const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const ebookRoutes = require("./routes/ebookRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const questionnaireRoutes = require("./routes/questionnaireRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  }),
);
app.options(/.*/, cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let dbReady;
let seeded = false;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Wellnest API is running",
    entities: ["users", "articles", "ebooks", "emails", "questionnaires"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(async (req, res, next) => {
  try {
    if (!dbReady) {
      dbReady = connectDB();
    }
    await dbReady;
    if (!seeded) {
      seeded = true;
      await seedAdmin().catch((err) => {
        console.warn("Admin seed skipped:", err.message);
        seeded = false;
      });
    }
    next();
  } catch (error) {
    dbReady = null;
    return res.status(503).json({
      msg: "Database connection failed",
      error: error.message,
    });
  }
});

const mount = (prefix, router) => {
  app.use(prefix, router);
  app.use("/api" + prefix, router);
};

mount("/user", userRoutes);
mount("/article", articleRoutes);
mount("/ebook", ebookRoutes);
mount("/newsletter", newsletterRoutes);
mount("/email", newsletterRoutes);
mount("/questionnaire", questionnaireRoutes);
mount("/upload", uploadRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ msg: err.message });
  }
  if (err) {
    return res.status(err.status || 500).json({ msg: err.message || "Server error" });
  }
  return next();
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = app;
