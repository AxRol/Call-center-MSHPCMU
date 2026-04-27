import db from '../config/db.js';

// ── RAPPORT APPELS ──────────────────────────────────────────────────────────
// GET /api/rapport/appels?date_debut=&date_fin=&agent=
export const getRapportAppels = async (req, res) => {
  const { date_debut, date_fin, agent } = req.query;
  const userRole = req.user?.role;
  const userId   = req.user?.id; // UUID depuis le JWT

  const conditions = ['a.archive = 0'];
  const params = [];
  let idx = 1;

  if (userRole === 'agent') {
    conditions.push(`a.user_id = $${idx++}`);
    params.push(userId);
  } else if (agent) {
    conditions.push(`u.username = $${idx++}`);
    params.push(agent);
  }

  if (date_debut) {
    conditions.push(`a.created_at >= $${idx++}`);
    params.push(date_debut);
  }
  if (date_fin) {
    conditions.push(`a.created_at <= $${idx++}`);
    params.push(date_fin + ' 23:59:59');
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const joins = `
    LEFT JOIN types_appels   ta ON a.type_appel::integer = ta.code
    LEFT JOIN types_requetes tr ON a.type_requetes_code = tr.code
    LEFT JOIN users           u ON a.user_id = u.uid`;

  try {
    const [totalR, satisfactionR, typeAppelR, typeRequeteR, localiteR, agentR, parMoisR, avecTicketR] =
      await Promise.all([
        db.query(`SELECT COUNT(*)::int AS total FROM appels a ${joins} ${where}`, params),
        db.query(
          `SELECT COALESCE(a.satisfaction, 'N/A') AS label, COUNT(*)::int AS count
           FROM appels a ${joins} ${where} GROUP BY a.satisfaction ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(ta.libelle, 'N/A') AS label, COUNT(*)::int AS count
           FROM appels a ${joins} ${where} GROUP BY ta.libelle ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(tr.libelle, 'N/A') AS label, COUNT(*)::int AS count
           FROM appels a ${joins} ${where} GROUP BY tr.libelle ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(a.ville, 'N/A') AS label, COUNT(*)::int AS count
           FROM appels a ${joins} ${where} GROUP BY a.ville ORDER BY count DESC LIMIT 10`, params),
        db.query(
          `SELECT COALESCE(u.username, 'N/A') AS label, COUNT(*)::int AS count
           FROM appels a ${joins} ${where} GROUP BY u.username ORDER BY count DESC`, params),
        db.query(
          `SELECT TO_CHAR(a.created_at, 'YYYY-MM') AS mois, COUNT(*)::int AS count
           FROM appels a ${joins} ${where} GROUP BY mois ORDER BY mois ASC`, params),
        db.query(
          `SELECT COUNT(*)::int AS count FROM appels a ${joins} ${where} AND a.ticket = 'true'`, params),
      ]);

    res.json({
      success: true,
      data: {
        total:            totalR.rows[0].total,
        avec_ticket:      avecTicketR.rows[0].count,
        par_satisfaction: satisfactionR.rows,
        par_type_appel:   typeAppelR.rows,
        par_type_requete: typeRequeteR.rows,
        par_localite:     localiteR.rows,
        par_agent:        agentR.rows,
        par_mois:         parMoisR.rows,
      },
    });
  } catch (err) {
    console.error('Erreur rapport appels:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── RAPPORT TICKETS ─────────────────────────────────────────────────────────
// GET /api/rapport/tickets?date_debut=&date_fin=&agent=
export const getRapportTickets = async (req, res) => {
  const { date_debut, date_fin, agent } = req.query;
  const userRole = req.user?.role;
  const userId   = req.user?.id;

  const conditions = ['t.is_active = true'];
  const params = [];
  let idx = 1;

  if (userRole === 'agent') {
    conditions.push(`a.user_id = $${idx++}`);
    params.push(userId);
  } else if (userRole === 'inspecteur') {
    conditions.push(`t.user_assigne_id = $${idx++}`);
    params.push(userId);
  } else if (agent) {
    conditions.push(`u1.username = $${idx++}`);
    params.push(agent);
  }

  if (date_debut) {
    conditions.push(`t.created_at >= $${idx++}`);
    params.push(date_debut);
  }
  if (date_fin) {
    conditions.push(`t.created_at <= $${idx++}`);
    params.push(date_fin + ' 23:59:59');
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const joins = `
    LEFT JOIN appels          a  ON a.uid = t.appel_id
    LEFT JOIN users           u1 ON u1.uid = a.user_id
    LEFT JOIN users           u2 ON u2.uid = t.user_assigne_id
    LEFT JOIN users           u3 ON u3.uid = t.user_traiteur_id
    LEFT JOIN types_requetes  tr ON tr.code = a.type_requetes_code`;

  try {
    const [totalR, statutR, prioriteR, requeteR, createurR, assigneR, parMoisR, delaiR] =
      await Promise.all([
        db.query(`SELECT COUNT(*)::int AS total FROM tickets t ${joins} ${where}`, params),
        db.query(
          `SELECT COALESCE(t.statut, 'N/A') AS label, COUNT(*)::int AS count
           FROM tickets t ${joins} ${where} GROUP BY t.statut ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(t.priorite, 'N/A') AS label, COUNT(*)::int AS count
           FROM tickets t ${joins} ${where} GROUP BY t.priorite ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(tr.libelle, 'N/A') AS label, COUNT(*)::int AS count
           FROM tickets t ${joins} ${where} GROUP BY tr.libelle ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(u1.username, 'N/A') AS label, COUNT(*)::int AS count
           FROM tickets t ${joins} ${where} GROUP BY u1.username ORDER BY count DESC`, params),
        db.query(
          `SELECT COALESCE(u2.username, 'N/A') AS label, COUNT(*)::int AS count
           FROM tickets t ${joins} ${where} GROUP BY u2.username ORDER BY count DESC`, params),
        db.query(
          `SELECT TO_CHAR(t.created_at, 'YYYY-MM') AS mois, COUNT(*)::int AS count
           FROM tickets t ${joins} ${where} GROUP BY mois ORDER BY mois ASC`, params),
        db.query(
          `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (t.date_traitement - t.created_at)) / 3600)::numeric, 1) AS delai
           FROM tickets t ${joins}
           ${where} AND t.statut = 'clos' AND t.date_traitement IS NOT NULL`, params),
      ]);

    const statutMap = Object.fromEntries(statutR.rows.map(r => [r.label, r.count]));

    res.json({
      success: true,
      data: {
        total:       totalR.rows[0].total,
        ouverts:     statutMap['ouvert']     || 0,
        en_attente:  statutMap['en attente'] || 0,
        clos:        statutMap['clos']       || 0,
        delai_moyen: delaiR.rows[0]?.delai   ?? null,
        par_statut:   statutR.rows,
        par_priorite: prioriteR.rows,
        par_requete:  requeteR.rows,
        par_createur: createurR.rows,
        par_assigne:  assigneR.rows,
        par_mois:     parMoisR.rows,
      },
    });
  } catch (err) {
    console.error('Erreur rapport tickets:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
