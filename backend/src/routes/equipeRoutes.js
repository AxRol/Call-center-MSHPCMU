import express from "express";
import auth, { requireRoles } from "../middleware/auth.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ANCIEN CODE — Imports sans les routes de gestion des superviseurs/agents
//
// import {
//   getEquipe,
//   getEquipeByID,
//   createEquipe,
//   editEquipe,
//   deleteEquipe
// } from "../controllers/equipeController.js";
// ─────────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU CODE — Imports avec tous les controleurs multi-roles
// ═══════════════════════════════════════════════════════════════════════════════
import {
  getEquipe,
  getEquipeByID,
  createEquipe,
  editEquipe,
  deleteEquipe,
  // NOUVEAU: controleurs superviseurs
  assignSuperviseurToEquipe,
  unassignSuperviseurFromEquipe,
  // NOUVEAU: controleurs agents
  assignAgentToEquipe,
  unassignAgentFromEquipe,
  // NOUVEAU 2026-04-27: vue superviseur — agents de ses equipes
  getMesAgents
} from "../controllers/equipeController.js";

const router = express.Router();

// Toutes les routes du module equipe requierent une authentification JWT
router.use(auth);


// ─────────────────────────────────────────────────────────────────────────────
// ANCIEN CODE — Routes CRUD basiques (equipes avec un seul responsable)
//
// router.get("/",    requireRoles("agent", "superviseur", "admin"), getEquipe);
// router.get("/:id", requireRoles("agent", "superviseur", "admin"), getEquipeByID);
// router.post("/",   requireRoles("superviseur", "admin"), createEquipe);
// router.put("/:id", requireRoles("superviseur", "admin"), editEquipe);
// router.delete("/:id", requireRoles("superviseur", "admin"), deleteEquipe);
// ─────────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Routes CRUD equipes
// Lecture: tout utilisateur authentifie du back-office peut consulter les equipes
// Ecriture: reserve aux profils de gestion (superviseur, admin)
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: GET / — liste toutes les equipes actives avec superviseurs et agents
router.get(
  "/",
  requireRoles("agent", "inspecteur", "superviseur", "admin"),
  getEquipe
);

// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU 2026-04-27 — Route vue superviseur
//
// ANCIEN: aucune route dédiée; le superviseur recevait toutes les données sans filtre.
// NOUVEAU: GET /mes-agents retourne les agents des équipes dont l'utilisateur
//          est superviseur. Utilisé par Dashboard, Appels et Tickets pour filtrer.
//
// IMPORTANT: cette route doit être déclarée AVANT GET /:id pour ne pas être
//            capturée comme un paramètre d'ID par Express.
// ═══════════════════════════════════════════════════════════════════════════════
router.get(
  "/mes-agents",
  requireRoles("superviseur"),
  getMesAgents
);

// NOUVEAU: GET /:id — detail d'une equipe avec ses superviseurs et agents
router.get(
  "/:id",
  requireRoles("agent", "inspecteur", "superviseur", "admin"),
  getEquipeByID
);

// NOUVEAU: POST / — creer une equipe (superviseurs/agents assignes ensuite via routes dediees)
router.post(
  "/",
  requireRoles("superviseur", "admin"),
  createEquipe
);

// NOUVEAU: PUT /:id — modifier nom et statut d'une equipe
router.put(
  "/:id",
  requireRoles("superviseur", "admin"),
  editEquipe
);

// NOUVEAU: DELETE /:id — archiver une equipe (desactivation douce)
router.delete(
  "/:id",
  requireRoles("superviseur", "admin"),
  deleteEquipe
);


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Routes de gestion des superviseurs par equipe
// Un superviseur (role = superviseur ou admin) peut superviser plusieurs equipes.
// Une equipe peut avoir plusieurs superviseurs.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: POST /:equipeId/superviseurs — assigner un superviseur a une equipe
// Body attendu: { superviseurId: string (uuid) }
router.post(
  "/:equipeId/superviseurs",
  requireRoles("superviseur", "admin"),
  assignSuperviseurToEquipe
);

// NOUVEAU: DELETE /:equipeId/superviseurs/:superviseurId — retirer un superviseur d'une equipe
router.delete(
  "/:equipeId/superviseurs/:superviseurId",
  requireRoles("superviseur", "admin"),
  unassignSuperviseurFromEquipe
);


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Routes de gestion des agents par equipe
// Un agent (role = agent) peut appartenir a plusieurs equipes.
// Une equipe peut avoir plusieurs agents.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: POST /:equipeId/agents — assigner un agent a une equipe
// Body attendu: { agentId: string (uuid) }
router.post(
  "/:equipeId/agents",
  requireRoles("superviseur", "admin"),
  assignAgentToEquipe
);

// NOUVEAU: DELETE /:equipeId/agents/:agentId — retirer un agent d'une equipe
router.delete(
  "/:equipeId/agents/:agentId",
  requireRoles("superviseur", "admin"),
  unassignAgentFromEquipe
);


export default router;
