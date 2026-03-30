import { Router } from "express";
import authRouter from "./authRouter";
import guestRouter from "./guestRouter";
import { authenticateGuest } from "../middleware/authenticateGuest";

const router = Router();

router.use("/api/v1/auth", authRouter);
router.use("/api/v1/guest", authenticateGuest, guestRouter);

export default router;
