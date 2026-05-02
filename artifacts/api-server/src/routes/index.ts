import { Router, type IRouter } from "express";
import healthRouter from "./health";
import whimseyChatRouter from "./whimsey-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(whimseyChatRouter);

export default router;
