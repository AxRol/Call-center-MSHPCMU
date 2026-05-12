// ═══════════════════════════════════════════════════════════════════════════════
// ANCIEN CODE — Imports sans gestion des superviseurs/agents multiples
//
// import {
//   getAllEquipe,
//   getOneEquipe,
//   addEquipe,
//   updateEquipe,
//   archiveEquipe
// } from "../models/equipeModel.js";
// ─────────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU CODE — Imports avec gestion multi-superviseurs et multi-agents
// ═══════════════════════════════════════════════════════════════════════════════
import {
  getAllEquipe,
  getOneEquipe,
  addEquipe,
  updateEquipe,
  archiveEquipe,
  // NOUVEAU: fonctions de liaison superviseurs
  addSuperviseurToEquipe,
  removeSuperviseurFromEquipe,
  // NOUVEAU: fonctions de liaison agents
  addAgentToEquipe,
  removeAgentFromEquipe,
  // NOUVEAU 2026-04-27: agents des equipes du superviseur connecte
  getAgentsDeMesEquipes
} from "../models/equipeModel.js";


// ─────────────────────────────────────────────────────────────────────────────
// CRUD équipes — inchangé dans l'interface, logique mise à jour dans le modèle
// ─────────────────────────────────────────────────────────────────────────────

export const getEquipe = async (req, res) => {
  await getAllEquipe(req, res);
};

export const getEquipeByID = async (req, res) => {
  await getOneEquipe(req, res);
};

export const createEquipe = async (req, res) => {
  await addEquipe(req, res);
};

export const editEquipe = async (req, res) => {
  await updateEquipe(req, res);
};

export const deleteEquipe = async (req, res) => {
  await archiveEquipe(req, res);
};


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Controleurs pour la gestion des superviseurs par equipe
// Un superviseur (role superviseur ou admin) peut etre assigne a plusieurs equipes.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: Assigner un superviseur a une equipe
export const assignSuperviseurToEquipe = async (req, res) => {
  await addSuperviseurToEquipe(req, res);
};

// NOUVEAU: Retirer un superviseur d'une equipe
export const unassignSuperviseurFromEquipe = async (req, res) => {
  await removeSuperviseurFromEquipe(req, res);
};


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Controleurs pour la gestion des agents par equipe
// Un agent (role agent) peut appartenir a plusieurs equipes.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: Assigner un agent a une equipe
export const assignAgentToEquipe = async (req, res) => {
  await addAgentToEquipe(req, res);
};

// NOUVEAU: Retirer un agent d'une equipe
export const unassignAgentFromEquipe = async (req, res) => {
  await removeAgentFromEquipe(req, res);
};


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU 2026-04-27 — Controleur vue superviseur
//
// ANCIEN: aucun endpoint dédié; le superviseur recevait toutes les données.
// NOUVEAU: ce controleur expose les agents de ses equipes pour que le frontend
//          puisse filtrer Dashboard, Appels et Tickets en conséquence.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU 2026-04-27: Agents des équipes supervisées par l'utilisateur connecté
export const getMesAgents = async (req, res) => {
  await getAgentsDeMesEquipes(req, res);
};
