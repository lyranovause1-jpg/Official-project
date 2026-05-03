import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whimseyChatRouter from "./whimsey-chat";
import whimseyDiscordRouter from "./whimsey-discord";
import whimseyAuthRouter from "./whimsey-auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whimseyAuthRouter);
router.use(whimseyChatRouter);
router.use(whimseyDiscordRouter);

export default router;
