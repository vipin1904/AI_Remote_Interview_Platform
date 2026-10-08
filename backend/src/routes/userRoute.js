import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getMe, updateRole } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.patch("/role", protectRoute, updateRole);

export default router;
