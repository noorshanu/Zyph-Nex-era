import express from "express";
import {
  getMatches,
  getMatch,
  getPrices,
  joinMatch,
  submitPortfolio,
  lockPortfolio,
  getLeaderboard,
  getUserPortfolio,
  getAssets,
} from "../controllers/matchController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getMatches);
router.get("/assets", getAssets);
router.get("/prices", getPrices);
router.get("/:id", getMatch);
router.get("/:id/leaderboard", getLeaderboard);

// Protected routes
router.post("/:id/join", authMiddleware, joinMatch);
router.post("/:id/portfolio", authMiddleware, submitPortfolio);
router.post("/:id/portfolio/lock", authMiddleware, lockPortfolio);
router.get("/:id/my-portfolio", authMiddleware, getUserPortfolio);

export default router;
