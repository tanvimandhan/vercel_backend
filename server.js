const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS setup (fixed)
const allowedOrigins = [
  "http://localhost:5173",
  "https://vercel-frontend-alpha-pearl.vercel.app"
];

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/upload', express.static('upload'));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
