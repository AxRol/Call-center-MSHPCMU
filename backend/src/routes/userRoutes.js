import express from "express";
import {
  getUser,
  getUserByID,
  createUser,
  editUser,
  deleteUser,
  assignUserEquipe,
} from "../controllers/userController.js";
import auth, { requireRoles } from "../middleware/auth.js";

const router = express.Router();

// Toutes les routes utilisateurs nécessitent d'être authentifié
router.use(auth);

// On considère que seule une personne avec un rôle "superviseur"
// peut gérer les comptes utilisateurs (gestion des rôles, etc.)

router.get("/",    getUser);
router.get("/:id", getUserByID);
router.post("/",         requireRoles("admin", "superviseur"), createUser);
router.put("/:id",       requireRoles("admin", "superviseur"), editUser);
router.patch("/:id/equipe", requireRoles("admin", "superviseur"), assignUserEquipe);
router.delete("/:id",    requireRoles("admin"), deleteUser);

export default router;