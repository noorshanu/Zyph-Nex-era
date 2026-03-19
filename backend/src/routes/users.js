import express from "express";
import {
  getProfile,
  updateProfile,
  completeOnboarding,
  completePractice,
  getMatchHistory,
  getStats,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/onboarding/complete", completeOnboarding);
router.post("/practice/complete", completePractice);
router.get("/history", getMatchHistory);
router.get("/stats", getStats);

export default router;
