import express from "express";
import {
  getTypeAppel,
  createTypeAppel,
  getTypeAppelByID,
  editTypeAppel,
  deleteTypeAppel,
} from "../controllers/typeAppelController.js";
import auth, { requireRoles } from "../middleware/auth.js";

const router = express.Router();

// Toutes les routes de type d'appel nécessitent d'être authentifié
router.use(auth);

// Règles sur les rôles :
// - superviseur : CRUD sur types d'appels

// READ : réservé au superviseur
router.get("/", requireRoles("agent", "superviseur", "admin"), getTypeAppel);
router.get("/:id", requireRoles("superviseur"), getTypeAppelByID);

// CREATE / UPDATE / DELETE : réservé au superviseur
router.post("/", requireRoles("superviseur"), createTypeAppel);
router.put("/:id", requireRoles("superviseur"), editTypeAppel);
router.delete("/:id", requireRoles("superviseur"), deleteTypeAppel);

export default router;
