import { Router } from "express";
import * as guestController from "../controllers/guestController";

const router = Router();

router.patch("/profile", guestController.updateProfileController);
router.patch("/password", guestController.changePasswordController);
router.delete("/account", guestController.deleteAccountController);

export default router;
