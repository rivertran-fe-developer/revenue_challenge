import express from "express";
import { getCurrRevenue, getPrevRevenue } from "../controllers/evenueControllers.js";

const router = express.Router();

router.get("/current", getCurrRevenue);
router.get("/previous", getPrevRevenue);

export default router;