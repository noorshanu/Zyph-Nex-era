import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createMatch,
  updateMatch,
  deleteMatch,
  getDashboardStats,
  getMatchParticipants,
  getMatchLeaderboard,
  getAdminMatchHistory,
  getCoins,
  addCoin,
  updateCoin,
  removeCoin,
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Match management
router.post("/matches", createMatch);
router.put("/matches/:id", updateMatch);
router.delete("/matches/:id", deleteMatch);

// Match viewer (participants + leaderboard)
router.get("/matches/:id/participants", getMatchParticipants);
router.get("/matches/:id/leaderboard", getMatchLeaderboard);

// Match history
router.get("/match-history", getAdminMatchHistory);

// Coin management
router.get("/coins", getCoins);
router.post("/coins", addCoin);
router.put("/coins/:id", updateCoin);
router.delete("/coins/:id", removeCoin);

export default router;
