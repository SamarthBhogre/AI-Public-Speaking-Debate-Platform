require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const topics = [
  "Should artificial intelligence replace traditional classroom teaching?",
  "Is technology making us more connected or more alone?",
  "Can sustainable cities become the new normal?",
];
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "SpeakWell API" }),
);
app.post("/api/speaking/topic", (req, res) =>
  res.json({ topic: topics[Math.floor(Math.random() * topics.length)] }),
);
app.post("/api/speaking/evaluate", (req, res) =>
  res.json({
    overallScore: 82,
    fluency: 78,
    clarity: 85,
    vocabulary: 80,
    contentRelevance: 84,
    strengths: ["Clear explanation", "Good topic relevance"],
    improvements: ["Reduce pauses", "Use stronger examples"],
    feedback:
      "A thoughtful response with a clear central idea. Keep building your confidence.",
  }),
);
app.post("/api/debate/respond", (req, res) =>
  res.json({
    response:
      "That is a compelling point. However, access to technology should complement human guidance rather than replace the relationships that make learning meaningful.",
  }),
);
app.listen(process.env.PORT || 4000, () =>
  console.log("SpeakWell API running on port " + (process.env.PORT || 4000)),
);
