import express from "express";
import {
  getTypeRequete,
  createTypeRequete,
  getTypeRequeteByID,
  editTypeRequete,
  deleteTypeRequete,
} from "../controllers/typeRequeteController.js";
import auth, { requireRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(auth);

router.get("/", getTypeRequete);
router.get("/:id", getTypeRequeteByID);
router.post("/", createTypeRequete);
router.put("/:id", editTypeRequete);
router.delete("/:id", deleteTypeRequete);

export default router;