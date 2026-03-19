import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import { startScheduler } from "./services/matchScheduler.js";
import { seedCoins } from "./models/Coin.js";
import authRoutes from "./routes/auth.js";
import matchRoutes from "./routes/matches.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import { openApiSpec } from "./openapi.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();

// Connect to MongoDB then start scheduler and seed initial data
connectDB().then(async () => {
  startScheduler();
  await seedCoins(); // seed default coins if DB is empty
});

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins (reflects requesting origin back)
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────
//  AI AGENT ENDPOINTS
// ─────────────────────────────────────────

// 1. OpenAPI JSON schema — consumed by AI agents, LangChain, GPT Actions, etc.
app.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(openApiSpec);
});

// 2. Interactive Swagger UI — human-readable API docs
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: "Zyph Nex API Docs",
    customCss: `
      .swagger-ui .topbar { background: #1a1a2e; }
      .swagger-ui .topbar-wrapper img { display: none; }
      .swagger-ui .topbar-wrapper::before {
        content: "⚡ Zyph Nex API";
        color: #00f0ff;
        font-size: 1.5rem;
        font-weight: bold;
      }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
  }),
);

// 3. Skill .md file — AI agent discovery (Moltx / Claude / custom agents)
app.get("/zyph-nex.md", (req, res) => {
  try {
    const mdPath = join(__dirname, "zyph-nex.md");
    const content = readFileSync(mdPath, "utf-8");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(content);
  } catch {
    res.status(404).send("Skill file not found");
  }
});

// 4. /.well-known/ai-agent.json — standard agent discovery endpoint
//    AI frameworks look here automatically (similar to robots.txt)
app.get("/.well-known/ai-agent.json", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    name: "Zyph Nex Competition API",
    description:
      "Crypto fantasy trading competition — pick 10 tokens and compete for prizes",
    version: "1.0.0",
    api_type: "openapi",
    openapi_url: "http://localhost:5000/openapi.json",
    skill_url: "http://localhost:5000/zyph-nex.md",
    docs_url: "http://localhost:5000/docs",
    auth: {
      type: "bearer",
      obtain_at: "POST http://localhost:5000/api/auth/wallet",
      description: "Send your wallet address, receive a JWT token",
    },
    capabilities: [
      "discover-open-matches",
      "join-match",
      "submit-portfolio",
      "track-leaderboard",
      "view-history",
    ],
  });
});

// ─────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    agent_endpoints: {
      skill_file: "http://localhost:5000/zyph-nex.md",
      openapi_schema: "http://localhost:5000/openapi.json",
      swagger_ui: "http://localhost:5000/docs",
      agent_discovery: "http://localhost:5000/.well-known/ai-agent.json",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Zyph Nex server running on http://localhost:${PORT}`);
  console.log(`\n🤖 AI Agent Endpoints:`);
  console.log(`   📄 Skill file:     http://localhost:${PORT}/zyph-nex.md`);
  console.log(`   📋 OpenAPI schema: http://localhost:${PORT}/openapi.json`);
  console.log(`   📚 Swagger UI:     http://localhost:${PORT}/docs`);
  console.log(
    `   🔍 Agent discovery:http://localhost:${PORT}/.well-known/ai-agent.json`,
  );
  console.log(`\n📡 API Routes:`);
  console.log(`   POST /api/auth/wallet  — authenticate with wallet`);
  console.log(`   GET  /api/matches      — list open matches`);
  console.log(`   POST /api/matches/:id/join     — join a match`);
  console.log(`   POST /api/matches/:id/portfolio — submit tokens`);
  console.log(`   GET  /api/matches/:id/leaderboard — live rankings\n`);
});
