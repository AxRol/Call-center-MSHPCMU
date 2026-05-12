import db from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ANCIEN CODE — Architecture à responsable unique (superviseur_uid)
//
// L'ancienne version gérait les équipes avec:
//   - Un seul responsable par équipe via la colonne equipes.superviseur_uid
//   - Les membres assignés via la colonne users.equipe_uid (relation 1-N)
//   - Pas de distinction entre rôles superviseur et agent dans l'appartenance
//
// Schéma utilisé: equipes(uid, nom, superviseur_uid, is_active, created_at, updated_at)
// ═══════════════════════════════════════════════════════════════════════════════

// ANCIEN: getAllEquipe — retournait responsable unique + liste des membres
// export const getAllEquipe = async (req, res) => {
//   try {
//     const equipes = await db.query(`
//       SELECT
//         e.uid, e.nom, e.superviseur_uid,
//         u.username AS responsable,
//         e.is_active, e.created_at, e.updated_at,
//         COALESCE(COUNT(m.id)::int, 0) AS nb_membres,
//         COALESCE(
//           json_agg(json_build_object('uid', m.uid, 'username', m.username, 'role', m.role))
//           FILTER (WHERE m.uid IS NOT NULL), '[]'
//         ) AS membres
//       FROM equipes e
//       LEFT JOIN users u ON u.uid = e.superviseur_uid
//       LEFT JOIN users m ON m.equipe_uid = e.uid AND m.is_active = true
//       WHERE e.is_active = true
//       GROUP BY e.uid, e.nom, e.superviseur_uid, u.username, e.is_active, e.created_at, e.updated_at
//       ORDER BY e.created_at DESC
//     `);
//     res.status(200).json({ success: true, data: equipes.rows });
//   } catch (error) {
//     console.error("Erreur getAllEquipe:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la récupération des équipes" });
//   }
// };

// ANCIEN: getOneEquipe — un seul responsable, membres via equipe_uid
// export const getOneEquipe = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const equipe = await db.query(`
//       SELECT
//         e.uid, e.nom, e.superviseur_uid, u.username AS responsable,
//         e.is_active, e.created_at, e.updated_at,
//         COALESCE(
//           json_agg(json_build_object('uid', m.uid, 'username', m.username, 'role', m.role))
//           FILTER (WHERE m.uid IS NOT NULL), '[]'
//         ) AS membres
//       FROM equipes e
//       LEFT JOIN users u ON u.uid = e.superviseur_uid
//       LEFT JOIN users m ON m.equipe_uid = e.uid AND m.is_active = true
//       WHERE e.uid = $1
//       GROUP BY e.uid, e.nom, e.superviseur_uid, u.username, e.is_active, e.created_at, e.updated_at
//     `, [id]);
//     if (equipe.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Équipe non trouvée" });
//     }
//     res.status(200).json({ success: true, data: equipe.rows[0] });
//   } catch (error) {
//     console.error("Erreur getOneEquipe:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'équipe" });
//   }
// };

// ANCIEN: addEquipe — insérait superviseur_uid dans la table equipes
// export const addEquipe = async (req, res) => {
//   const { nom, superviseur_uid, is_active } = req.body;
//   if (!nom) {
//     return res.status(400).json({ success: false, message: "Le nom de l'équipe est requis" });
//   }
//   try {
//     const equipe = await db.query(`
//       INSERT INTO equipes (nom, superviseur_uid, is_active)
//       VALUES ($1, $2, $3)
//       RETURNING uid, nom, superviseur_uid, is_active, created_at, updated_at
//     `, [nom, superviseur_uid || null, is_active ?? true]);
//     res.status(201).json({ success: true, message: "Équipe créée avec succès", data: equipe.rows[0] });
//   } catch (error) {
//     console.error("Erreur addEquipe:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la création de l'équipe" });
//   }
// };

// ANCIEN: updateEquipe — mettait à jour superviseur_uid
// export const updateEquipe = async (req, res) => {
//   const { id } = req.params;
//   const { nom, superviseur_uid, is_active } = req.body;
//   if (!nom) {
//     return res.status(400).json({ success: false, message: "Le nom de l'équipe est requis" });
//   }
//   try {
//     const equipe = await db.query(`
//       UPDATE equipes
//       SET nom = $1, superviseur_uid = $2, is_active = $3, updated_at = NOW()
//       WHERE uid = $4
//       RETURNING uid, nom, superviseur_uid, is_active, created_at, updated_at
//     `, [nom, superviseur_uid || null, is_active ?? true, id]);
//     if (equipe.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Équipe non trouvée" });
//     }
//     res.status(200).json({ success: true, message: "Équipe mise à jour avec succès", data: equipe.rows[0] });
//   } catch (error) {
//     console.error("Erreur updateEquipe:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'équipe" });
//   }
// };

// ANCIEN: archiveEquipe — désactivation simple
// export const archiveEquipe = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const equipe = await db.query(`
//       UPDATE equipes SET is_active = false, updated_at = NOW()
//       WHERE uid = $1
//       RETURNING uid, nom, is_active, created_at, updated_at
//     `, [id]);
//     if (equipe.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Équipe non trouvée" });
//     }
//     res.status(200).json({ success: true, message: "Équipe désactivée avec succès", data: equipe.rows[0] });
//   } catch (error) {
//     console.error("Erreur archiveEquipe:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'équipe" });
//   }
// };
// ─────────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU CODE — Architecture multi-superviseurs et multi-agents
//
// La nouvelle version introduit deux tables de liaison pour des relations N:N:
//   - equipes_superviseurs (equipe_uid, superviseur_uid) : plusieurs superviseurs par équipe
//   - equipes_agents      (equipe_uid, agent_uid)        : plusieurs agents par équipe
//
// Le champ equipes.superviseur_uid reste dans la table pour la compatibilité
// mais n'est plus la source de vérité — les tables de liaison font foi.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: Crée les tables de liaison si elles n'existent pas encore
async function ensureJunctionTables() {
  // NOUVEAU: Garantir que equipes.uid et users.uid ont une contrainte UNIQUE
  // avant de les utiliser comme cible de clé étrangère.
  // PostgreSQL exige une contrainte UNIQUE ou PRIMARY KEY sur la colonne référencée.
  // Les tables ont probablement "id" comme PK et "uid" comme UUID sans contrainte unique.
  // On utilise un bloc DO…END pour éviter l'erreur si la contrainte existe déjà.
  await db.query(`
    DO $$ BEGIN
      ALTER TABLE equipes ADD CONSTRAINT equipes_uid_unique UNIQUE (uid);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);

  await db.query(`
    DO $$ BEGIN
      ALTER TABLE users ADD CONSTRAINT users_uid_unique UNIQUE (uid);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END $$;
  `);

  // Table de liaison equipes <-> superviseurs (relation N:N)
  await db.query(`
    CREATE TABLE IF NOT EXISTS equipes_superviseurs (
      equipe_uid      UUID NOT NULL REFERENCES equipes(uid) ON DELETE CASCADE,
      superviseur_uid UUID NOT NULL REFERENCES users(uid)   ON DELETE CASCADE,
      assigned_at     TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (equipe_uid, superviseur_uid)
    )
  `);

  // Table de liaison equipes <-> agents (relation N:N)
  await db.query(`
    CREATE TABLE IF NOT EXISTS equipes_agents (
      equipe_uid  UUID NOT NULL REFERENCES equipes(uid) ON DELETE CASCADE,
      agent_uid   UUID NOT NULL REFERENCES users(uid)   ON DELETE CASCADE,
      assigned_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (equipe_uid, agent_uid)
    )
  `);
}

// NOUVEAU: Récupérer toutes les équipes actives avec leurs superviseurs et agents agrégés
export const getAllEquipe = async (req, res) => {
  try {
    await ensureJunctionTables();

    const result = await db.query(`
      SELECT
        e.uid,
        e.nom,
        e.is_active,
        e.created_at,
        e.updated_at,
        -- Nombre de superviseurs assignés à cette équipe
        COALESCE(COUNT(DISTINCT es.superviseur_uid)::int, 0) AS nb_superviseurs,
        -- Nombre d'agents assignés à cette équipe
        COALESCE(COUNT(DISTINCT ea.agent_uid)::int, 0) AS nb_agents,
        -- Tableau JSON des superviseurs (uid, username, role)
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('uid', us.uid, 'username', us.username, 'role', us.role))
          FILTER (WHERE us.uid IS NOT NULL),
          '[]'
        ) AS superviseurs,
        -- Tableau JSON des agents (uid, username, role)
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('uid', ua.uid, 'username', ua.username, 'role', ua.role))
          FILTER (WHERE ua.uid IS NOT NULL),
          '[]'
        ) AS agents
      FROM equipes e
      LEFT JOIN equipes_superviseurs es ON e.uid = es.equipe_uid
      LEFT JOIN users us ON us.uid = es.superviseur_uid AND us.is_active = true
      LEFT JOIN equipes_agents ea ON e.uid = ea.equipe_uid
      LEFT JOIN users ua ON ua.uid = ea.agent_uid AND ua.is_active = true
      WHERE e.is_active = true
      GROUP BY e.uid, e.nom, e.is_active, e.created_at, e.updated_at
      ORDER BY e.created_at DESC
    `);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erreur getAllEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des équipes" });
  }
};

// NOUVEAU: Récupérer une équipe par son uid avec ses superviseurs et agents complets
export const getOneEquipe = async (req, res) => {
  const { id } = req.params;
  try {
    await ensureJunctionTables();

    const result = await db.query(`
      SELECT
        e.uid,
        e.nom,
        e.is_active,
        e.created_at,
        e.updated_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('uid', us.uid, 'username', us.username, 'role', us.role))
          FILTER (WHERE us.uid IS NOT NULL),
          '[]'
        ) AS superviseurs,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('uid', ua.uid, 'username', ua.username, 'role', ua.role))
          FILTER (WHERE ua.uid IS NOT NULL),
          '[]'
        ) AS agents
      FROM equipes e
      LEFT JOIN equipes_superviseurs es ON e.uid = es.equipe_uid
      LEFT JOIN users us ON us.uid = es.superviseur_uid AND us.is_active = true
      LEFT JOIN equipes_agents ea ON e.uid = ea.equipe_uid
      LEFT JOIN users ua ON ua.uid = ea.agent_uid AND ua.is_active = true
      WHERE e.uid = $1
      GROUP BY e.uid, e.nom, e.is_active, e.created_at, e.updated_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Équipe non trouvée" });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Erreur getOneEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de l'équipe" });
  }
};

// NOUVEAU: Créer une équipe (superviseurs et agents assignés séparément via les routes dédiées)
export const addEquipe = async (req, res) => {
  const { nom, is_active } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ success: false, message: "Le nom de l'équipe est requis" });
  }

  try {
    await ensureJunctionTables();

    const result = await db.query(`
      INSERT INTO equipes (nom, is_active)
      VALUES ($1, $2)
      RETURNING uid, nom, is_active, created_at, updated_at
    `, [nom.trim(), is_active ?? true]);

    res.status(201).json({
      success: true,
      message: "Équipe créée avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Erreur addEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la création de l'équipe" });
  }
};

// NOUVEAU: Mettre à jour le nom et le statut d'une équipe
export const updateEquipe = async (req, res) => {
  const { id } = req.params;
  const { nom, is_active } = req.body;

  if (!nom || !nom.trim()) {
    return res.status(400).json({ success: false, message: "Le nom de l'équipe est requis" });
  }

  try {
    const result = await db.query(`
      UPDATE equipes
      SET nom = $1, is_active = $2, updated_at = NOW()
      WHERE uid = $3
      RETURNING uid, nom, is_active, created_at, updated_at
    `, [nom.trim(), is_active ?? true, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Équipe non trouvée" });
    }
    res.status(200).json({
      success: true,
      message: "Équipe mise à jour avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Erreur updateEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'équipe" });
  }
};

// NOUVEAU: Archiver (désactiver) une équipe — suppression douce via is_active = false
export const archiveEquipe = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      UPDATE equipes
      SET is_active = false, updated_at = NOW()
      WHERE uid = $1
      RETURNING uid, nom, is_active, created_at, updated_at
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Équipe non trouvée" });
    }
    res.status(200).json({
      success: true,
      message: "Équipe désactivée avec succès",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Erreur archiveEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'équipe" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Gestion des superviseurs par équipe (table equipes_superviseurs)
// Un superviseur (role = 'superviseur' ou 'admin') peut superviser N équipes.
// Une équipe peut avoir N superviseurs.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: Assigner un superviseur à une équipe
export const addSuperviseurToEquipe = async (req, res) => {
  const { equipeId } = req.params;
  const { superviseurId } = req.body;

  if (!equipeId || !superviseurId) {
    return res.status(400).json({ success: false, message: "equipeId et superviseurId sont requis" });
  }

  try {
    await ensureJunctionTables();

    // Vérifier que l'équipe existe et est active
    const equipe = await db.query(
      `SELECT uid FROM equipes WHERE uid = $1 AND is_active = true`,
      [equipeId]
    );
    if (equipe.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Équipe non trouvée ou inactive" });
    }

    // Vérifier que l'utilisateur existe, est actif, et a le rôle approprié
    const user = await db.query(
      `SELECT uid, username, role FROM users WHERE uid = $1 AND is_active = true`,
      [superviseurId]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé ou inactif" });
    }
    if (!['superviseur', 'admin'].includes(user.rows[0].role)) {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur doit avoir le rôle 'superviseur' ou 'admin'"
      });
    }

    // Insérer la relation — ON CONFLICT DO NOTHING évite les doublons sans erreur
    await db.query(`
      INSERT INTO equipes_superviseurs (equipe_uid, superviseur_uid)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [equipeId, superviseurId]);

    res.status(200).json({ success: true, message: "Superviseur assigné avec succès" });
  } catch (error) {
    console.error("Erreur addSuperviseurToEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'assignation du superviseur" });
  }
};

// NOUVEAU: Retirer un superviseur d'une équipe
export const removeSuperviseurFromEquipe = async (req, res) => {
  const { equipeId, superviseurId } = req.params;

  if (!equipeId || !superviseurId) {
    return res.status(400).json({ success: false, message: "equipeId et superviseurId sont requis" });
  }

  try {
    const result = await db.query(`
      DELETE FROM equipes_superviseurs
      WHERE equipe_uid = $1 AND superviseur_uid = $2
      RETURNING equipe_uid, superviseur_uid
    `, [equipeId, superviseurId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Assignation superviseur non trouvée" });
    }
    res.status(200).json({ success: true, message: "Superviseur retiré avec succès" });
  } catch (error) {
    console.error("Erreur removeSuperviseurFromEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait du superviseur" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU: Gestion des agents par équipe (table equipes_agents)
// Un agent (role = 'agent') peut appartenir à N équipes.
// Une équipe peut avoir N agents.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU: Assigner un agent à une équipe
export const addAgentToEquipe = async (req, res) => {
  const { equipeId } = req.params;
  const { agentId } = req.body;

  if (!equipeId || !agentId) {
    return res.status(400).json({ success: false, message: "equipeId et agentId sont requis" });
  }

  try {
    await ensureJunctionTables();

    // Vérifier que l'équipe existe et est active
    const equipe = await db.query(
      `SELECT uid FROM equipes WHERE uid = $1 AND is_active = true`,
      [equipeId]
    );
    if (equipe.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Équipe non trouvée ou inactive" });
    }

    // Vérifier que l'utilisateur existe, est actif, et a le rôle 'agent'
    const user = await db.query(
      `SELECT uid, username, role FROM users WHERE uid = $1 AND is_active = true`,
      [agentId]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé ou inactif" });
    }
    if (user.rows[0].role !== 'agent') {
      return res.status(400).json({
        success: false,
        message: "L'utilisateur doit avoir le rôle 'agent'"
      });
    }

    // Insérer la relation — ON CONFLICT DO NOTHING évite les doublons sans erreur
    await db.query(`
      INSERT INTO equipes_agents (equipe_uid, agent_uid)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [equipeId, agentId]);

    res.status(200).json({ success: true, message: "Agent assigné avec succès" });
  } catch (error) {
    console.error("Erreur addAgentToEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors de l'assignation de l'agent" });
  }
};

// NOUVEAU: Retirer un agent d'une équipe
export const removeAgentFromEquipe = async (req, res) => {
  const { equipeId, agentId } = req.params;

  if (!equipeId || !agentId) {
    return res.status(400).json({ success: false, message: "equipeId et agentId sont requis" });
  }

  try {
    const result = await db.query(`
      DELETE FROM equipes_agents
      WHERE equipe_uid = $1 AND agent_uid = $2
      RETURNING equipe_uid, agent_uid
    `, [equipeId, agentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Assignation agent non trouvée" });
    }
    res.status(200).json({ success: true, message: "Agent retiré avec succès" });
  } catch (error) {
    console.error("Erreur removeAgentFromEquipe:", error);
    res.status(500).json({ success: false, message: "Erreur lors du retrait de l'agent" });
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// NOUVEAU 2026-04-27 — Vue superviseur : agents de ses equipes
//
// ANCIEN comportement : le superviseur voyait TOUTES les données (appels, tickets,
// dashboard) sans restriction d'équipe.
//
// NOUVEAU comportement : on expose un endpoint qui retourne les agents appartenant
// aux équipes dont l'utilisateur connecté est superviseur.
// Le frontend utilise cette liste pour filtrer Dashboard, Appels et Tickets.
// ═══════════════════════════════════════════════════════════════════════════════

// NOUVEAU 2026-04-27: Retourner les agents de toutes les équipes supervisées par l'utilisateur connecté
export const getAgentsDeMesEquipes = async (req, res) => {
  // L'uid du superviseur est extrait du token JWT par le middleware auth (req.user.id)
  const superviseurUid = req.user.id;
  try {
    const result = await db.query(`
      SELECT DISTINCT ua.uid, ua.username
      FROM equipes_superviseurs es
      JOIN equipes         e  ON e.uid  = es.equipe_uid   AND e.is_active = true
      JOIN equipes_agents  ea ON ea.equipe_uid = e.uid
      JOIN users           ua ON ua.uid = ea.agent_uid    AND ua.is_active = true
      WHERE es.superviseur_uid = $1
      ORDER BY ua.username
    `, [superviseurUid]);

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erreur getAgentsDeMesEquipes:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des agents" });
  }
};
