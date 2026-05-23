require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const MONGO_URI  = process.env.MONGO_URI;
const PORT       = process.env.PORT || 3000;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env");
  process.exit(1);
}

// ✅ CORS — allow your Netlify frontend
app.use(cors({
  origin: [
    "https://jobtidalplatform.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* ================= DB CONNECTION ================= */
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });

/* ================= ERROR HANDLER ================= */
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
}

/* ================= AUTH MIDDLEWARE ================= */
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

/* ================= MODELS ================= */
const jobSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  company:  { type: String, required: true },
  location: { type: String, required: true },
  salary:   { type: String, default: "Negotiable" },
  type:     { type: String, default: "Full-time" },
  exp:      { type: String, default: "" },
  skills:   [String],
  desc:     { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  applications: [
    {
      name:   String,
      email:  String,
      resume: String,
      note:   String,
      date:   { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "company", "admin"], default: "user" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

/* ================= VALIDATION ================= */
function validateRegister({ username, password }) {
  if (!username || username.length < 3) return "Username must be at least 3 characters";
  if (!password || password.length < 5) return "Password must be at least 5 characters";
  return null;
}

/* ================= ROUTES ================= */

// Health check
app.get("/", (req, res) => {
  res.json({ message: "JobTidal Backend Running 🚀", status: "ok" });
});

/* --- AUTH --- */
app.post("/register", async (req, res, next) => {
  try {
    const error = validateRegister(req.body);
    if (error) return res.status(400).json({ message: error });

    const { username, password, role } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ message: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    await new User({ username, password: hashed, role: role || "user" }).save();
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) { next(err); }
});

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, role: user.role });
  } catch (err) { next(err); }
});

/* --- JOBS --- */
app.get("/jobs", async (req, res, next) => {
  try {
    const jobs = await Job.find().select("-applications").sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { next(err); }
});

app.post("/jobs", authMiddleware, roleMiddleware("company", "admin"), async (req, res, next) => {
  try {
    const { title, company, location, salary, type, exp, skills, desc } = req.body;
    if (!title || !company || !location)
      return res.status(400).json({ message: "title, company, location are required" });

    await new Job({ title, company, location, salary, type, exp, skills, desc, createdBy: req.user.id }).save();
    res.status(201).json({ message: "Job posted successfully" });
  } catch (err) { next(err); }
});

/* --- APPLY --- */
app.post("/apply/:id", authMiddleware, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "name and email are required" });

    job.applications.push(req.body);
    await job.save();
    res.json({ message: "Applied successfully" });
  } catch (err) { next(err); }
});

/* --- VIEW APPLICATIONS (admin only) --- */
app.get("/applications/:id", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job.applications);
  } catch (err) { next(err); }
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});