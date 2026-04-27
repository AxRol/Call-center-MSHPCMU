import db from "../config/db.js";

export const getAllTicket = async (req, res) => {
    let sql = `
        SELECT t.uid, t.code, t.appel_id, t.numero_appellant, t.type_requetes_code AS code_requete, tr.libelle AS requete, u1.username AS créé_par, t.statut, t.priorite, t.raison, 
	   u2.username AS assigne_a, u3.username AS traite_par, t.resolution, a.created_at AS date_enreig_appel, t.created_at AS date_creation, t.updated_at AS date_traitement 
        FROM tickets t
        LEFT JOIN appels a ON a.uid = t.appel_id
        LEFT JOIN users u1 ON u1.uid = a.user_id
		LEFT JOIN users u2 ON u2.uid = t.user_assigne_id
		LEFT JOIN users u3 ON u3.uid = t.user_traiteur_id
        LEFT JOIN types_requetes tr ON tr.code = a.type_requetes_code
		WHERE t.is_active = true
        AND DATE_TRUNC('month', a.created_at) = DATE_TRUNC('month', CURRENT_DATE)
		ORDER BY t.created_at DESC
    `;
    try {
        let tickets = await db.query(sql);
        res.status(200).json({ success: true, message: "Tickets récupérés avec succès", data: tickets.rows });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des tickets", error: "Erreur serveur" });
    } 
};

export const getOneTicket = async (req, res) => {
    let { id } = req.params;
    let sql =  `
        SELECT t.uid, t.code, t.appel_id, t.numero_appellant, t.type_requetes_code AS code_requete, tr.libelle AS requete, u1.username AS créé_par, t.statut, t.priorite, t.raison, 
	    u2.username AS assigne_a, u3.username AS traite_par, t.resolution, a.created_at AS date_enreig_appel, t.created_at AS date_creation, t.updated_at AS date_traitement 
        FROM tickets t
        LEFT JOIN appels a ON a.uid = t.appel_id
        LEFT JOIN users u1 ON u1.uid = a.user_id
		LEFT JOIN users u2 ON u2.uid = t.user_assigne_id
		LEFT JOIN users u3 ON u3.uid = t.user_traiteur_id
        LEFT JOIN types_requetes tr ON tr.code = a.type_requetes_code
		WHERE t.is_active = true
		ORDER BY t.created_at DESC
        WHERE t.uid = $1 and t.is_active = true
    `; 
    try {
        let ticket = await db.query(sql, [id]);
        if (ticket.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Ticket non trouvé" });
        } 
        res.status(200).json({ success: true, message: "Ticket récupéré avec succès", data: ticket.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération du ticket", error: "Erreur serveur" });
    }   
};

export const getDateTicket = async (req, res) => {
    const { dateDebut, dateFin } = req.query

    const select = `
        SELECT t.uid, t.code, t.appel_id, t.numero_appellant, t.type_requetes_code AS code_requete, tr.libelle AS requete, u1.username AS créé_par, t.statut, t.priorite, t.raison,
	    u2.username AS assigne_a, u3.username AS traite_par, t.resolution, a.created_at AS date_enreig_appel, t.created_at AS date_creation, t.updated_at AS date_traitement
        FROM tickets t
        LEFT JOIN appels a ON a.uid = t.appel_id
        LEFT JOIN users u1 ON u1.uid = a.user_id
		LEFT JOIN users u2 ON u2.uid = t.user_assigne_id
		LEFT JOIN users u3 ON u3.uid = t.user_traiteur_id
        LEFT JOIN types_requetes tr ON tr.code = a.type_requetes_code
    `

    let sql, params
    if (!dateDebut && !dateFin) {
        sql = select + `
            WHERE t.is_active = true
            AND DATE_TRUNC('month', t.created_at) = DATE_TRUNC('month', CURRENT_DATE)
            ORDER BY t.created_at DESC
        `
        params = []
    } else if (dateDebut && !dateFin) {
        sql = select + ` WHERE t.is_active = true AND t.created_at >= $1::date ORDER BY t.created_at DESC`
        params = [dateDebut]
    } else {
        sql = select + `
            WHERE t.is_active = true
            AND t.created_at >= $1::date
            AND t.created_at < ($2::date + INTERVAL '1 day')
            ORDER BY t.created_at DESC
        `
        params = [dateDebut, dateFin]
    }

    try {
        const result = await db.query(sql, params)
        res.status(200).json({ success: true, message: "Tickets récupérés avec succès", data: result.rows })
    } catch (err) {
        console.error('Erreur getDateTicket:', err)
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des tickets" })
    }
}

export const addTicket = async (req, res) => {
  let { appel_uid, numero_appellant, type_requetes_code, user_uid, raison } = req.body

  // VALIDATION

  if (!appel_uid || !numero_appellant || !type_requetes_code || !user_uid || !raison) {
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis' })
  }

  let code = `T-${type_requetes_code}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

  let sql = `
    INSERT INTO tickets (code, appel_id, numero_appellant, type_requetes_code, user_uid, raison)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `

  try {
    let result = await db.query(sql, [code, appel_uid, numero_appellant, type_requetes_code, user_uid, raison])
    return res.status(201).json({ success: true, message: 'Ticket créé avec succès', data: result.rows[0] })
  } catch (err) {
    console.error('Erreur création ticket:', err)
    return res.status(500).json({ success: false, message: 'Erreur lors de la création du ticket' })
  }
}

export const updateTicket = async (req, res) => {
    let { id } = req.params;
    let { statut, priorite, resolution, date_traitement, traite_par_id, user_assigne_id, action  } = req.body;
     if (action == 'assignation') {
        let sql = "UPDATE tickets SET priorite = $1, user_assigne_id = $2 WHERE uid = $3 RETURNING *";
        try {
            let ticket = await db.query(sql, [priorite, user_assigne_id, id]);
            if (ticket.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Ticket non trouvé" });
            }   
            res.status(200).json({ success: true, message: "Ticket mis à jour avec succès", data: ticket.rows[0] });
        } catch (err) {
            res.status(500).json({ message: "Erreur lors de la mise à jour du ticket", error: "Erreur serveur" });
        }
     } else if (action == 'creation/modification') {
        let sql = "UPDATE tickets SET statut = $1, priorite = $2, resolution = $3, date_traitement = $4, user_traiteur_id = $5 WHERE uid = $6 RETURNING *";
        try {
            let ticket = await db.query(sql, [statut, priorite, resolution, date_traitement, traite_par_id, id]);
            if (ticket.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Ticket non trouvé" });
            }   
            res.status(200).json({ success: true, message: "Ticket mis à jour avec succès", data: ticket.rows[0] });
        } catch (err) {
            res.status(500).json({ message: "Erreur lors de la mise à jour du ticket", error: "Erreur serveur" });
        }
     } else if (action == 'termine') {
        let sql = "UPDATE tickets SET statut = $1 WHERE uid = $2 RETURNING *"; 
        try {
            let ticket = await db.query(sql, [statut, id]);   
            if (ticket.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Ticket non trouvé" });
            }
            res.status(200).json({ success: true, message: "Ticket terminé avec succès", data: ticket.rows[0] });
        } catch (err) {
            res.status(500).json({ message: "Erreur lors de la clôture du ticket", error: "Erreur serveur" });
        }
     };
       
};

export const archiveTicket = async (req, res) => {
    let { id } = req.params;
    let sql = "UPDATE tickets SET is_active = false WHERE uid = $1 RETURNING *";
    try {
        let ticket = await db.query(sql, [id]);  
        if (ticket.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Ticket non trouvé" });
        }
        res.status(200).json({ success: true, message: "Ticket archivé avec succès", data: ticket.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'archivage du ticket", error: "Erreur serveur" });
    }
};