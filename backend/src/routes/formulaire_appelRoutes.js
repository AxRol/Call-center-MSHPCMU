import express from "express";
import auth, { requireRoles } from "../middleware/auth.js";
import {
  getAppelByID, getAppel, getAppelByDate, createAppel, editAppel, deleteAppel } from "../controllers/formulaire_appelController.js";

const router = express.Router();

// Toutes les routes d'appel nécessitent d'être authentifié
router.use(auth);


router.get("/", getAppel);
router.get("/date", getAppelByDate);
router.get("/:id", getAppelByID);
router.post("/", createAppel);
router.put("/:id",  editAppel);
router.delete("/:id", deleteAppel);
//router.delete("/:id", requireRoles("superviseur", "admin"), deleteAppel);

export default router;
