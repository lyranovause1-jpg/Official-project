import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whimseyChatRouter from "./whimsey-chat";
import whimseyDiscordRouter from "./whimsey-discord";
import sessionsRouter from "./sessions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whimseyChatRouter);
router.use(whimseyDiscordRouter);
router.use(sessionsRouter);

export default router;
