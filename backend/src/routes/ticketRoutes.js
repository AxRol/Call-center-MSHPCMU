import express from "express";
import {getOneTicket, getAllTicket, getDateTicket, addTicket, updateTicket, archiveTicket} from "../models/ticketModel.js";
import auth, { requireRoles } from "../middleware/auth.js";

const router = express.Router();


router.use(auth);

router.get("/", getAllTicket);
router.get("/date", getDateTicket);
router.get("/:id", getOneTicket);
router.post("/", addTicket);
router.put("/:id", updateTicket);
router.delete("/:id", archiveTicket);

export default router;