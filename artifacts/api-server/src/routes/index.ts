import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whimseyChatRouter from "./whimsey-chat";
import whimseyDiscordRouter from "./whimsey-discord";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whimseyChatRouter);
router.use(whimseyDiscordRouter);

export default router;
