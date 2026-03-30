import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticateGuest } from "../middleware/authenticateGuest";

const router = Router();

router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
router.post("/logout", authenticateGuest, authController.logoutController);
router.get("/me", authenticateGuest, authController.getMeController);

export default router;
