import db from '../config/db.js';

export const getOneAppel = (id, callback) => {
    const sql = `
        SELECT a.uid, a.telephone, a.civilite, a.nom_appelant, a.prenoms_appelant,
        a.telephone_perso_appelant, a.ville, a.type_appel AS code_type_appel,
        ta.libelle AS libelle_type_appel, tr.libelle AS type_requete,
        a.objet_requetes, a.descriptions_requetes, a.user_id AS created_by,
        u.username AS agent, a.satisfaction, a.ticket, a.raison_ticket,
        a.archive, a.created_at
        FROM appels a
        LEFT JOIN types_requetes tr ON a.type_requetes_code = tr.code
        LEFT JOIN types_appels ta ON a.type_appel::integer = ta.code
        LEFT JOIN users u ON a.user_id = u.uid
        WHERE a.uid = $1 AND a.archive = 0
        ORDER BY a.created_at DESC
    `;
    db.query(sql, [id], callback);
};

export const getAllAppel = (callback) => {
    const sql = `
        SELECT a.uid, a.telephone, a.civilite, a.nom_appelant, a.prenoms_appelant,
        a.telephone_perso_appelant, a.ville, a.type_appel AS code_type_appel,
        ta.libelle AS libelle_type_appel, tr.libelle AS type_requete,
        a.objet_requetes, a.descriptions_requetes, a.user_id AS created_by,
        u.username AS agent, a.satisfaction, a.ticket, a.raison_ticket,
        a.archive, a.created_at
        FROM appels a
        LEFT JOIN types_requetes tr ON a.type_requetes_code = tr.code
        LEFT JOIN types_appels ta ON a.type_appel::integer = ta.code
        LEFT JOIN users u ON a.user_id = u.uid
        WHERE a.archive = 0
        AND DATE_TRUNC('month', a.created_at) = DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY a.created_at DESC
    `;
    db.query(sql, callback);
};

export const getDateAppel = (callback, dateDebut = null, dateFin = null) => {
    const select = `
        SELECT a.uid, a.telephone, a.civilite, a.nom_appelant, a.prenoms_appelant,
        a.telephone_perso_appelant, a.ville, a.type_appel AS code_type_appel,
        ta.libelle AS libelle_type_appel, tr.libelle AS type_requete,
        a.objet_requetes, a.descriptions_requetes, a.user_id AS created_by,
        u.username AS agent, a.satisfaction, a.ticket, a.raison_ticket,
        a.archive, a.created_at
        FROM appels a
        LEFT JOIN types_requetes tr ON a.type_requetes_code = tr.code
        LEFT JOIN types_appels   ta ON a.type_appel::integer = ta.code
        LEFT JOIN users          u  ON a.user_id = u.uid
    `;

    if (!dateDebut && !dateFin) {
        const sql = select + `
            WHERE a.archive = 0
            AND DATE_TRUNC('month', a.created_at) = DATE_TRUNC('month', CURRENT_DATE)
            ORDER BY a.created_at DESC
        `;
        db.query(sql, callback);
        return;
    }

    if (dateDebut && !dateFin) {
        const sql = select + ` WHERE a.archive = 0 AND a.created_at >= $1::date ORDER BY a.created_at DESC`;
        db.query(sql, [dateDebut], callback);
        return;
    }

    if (dateDebut && dateFin) {
        const sql = select + `
            WHERE a.archive = 0
            AND a.created_at >= $1::date
            AND a.created_at < ($2::date + INTERVAL '1 day')
            ORDER BY a.created_at DESC
        `;
        db.query(sql, [dateDebut, dateFin], callback);
        return;
    }
};

export const addAppel = (data, callback) => {
    const sql = `
        INSERT INTO appels (
            telephone, civilite, nom_appelant, prenoms_appelant,
            telephone_perso_appelant, ville, type_appel, type_requetes_code,
            objet_requetes, descriptions_requetes, user_id, satisfaction,
            ticket, raison_ticket
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
    `;
    const values = [
        data.telephone,
        data.civilite,
        data.nom,
        data.prenom,
        data.telephone_perso,
        data.ville,
        data.typeAppel,
        data.typeRequete,
        data.objetRequete,
        data.detailRequete,
        data.userId,
        data.satisfaction,
        data.ticket,
        data.raison_ticket,
    ];
    db.query(sql, values, callback);
};

export const updateAppel = (data, callback) => {
    const { id, ...fields } = data || {};
    if (!id) return callback(new Error("ID manquant pour la mise à jour"));
    if (Object.keys(fields).length === 0) return callback(new Error("Aucun champ à mettre à jour"));

    // Construit dynamiquement "col1 = $1, col2 = $2, ..." en PostgreSQL
    const setClauses = Object.keys(fields).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(fields), id];
    const sql = `UPDATE appels SET ${setClauses} WHERE uid = $${values.length} RETURNING *`;
    db.query(sql, values, callback);
};

export const archiveAppel = (id, callback) => {
    const sql = "UPDATE appels SET archive = 1 WHERE uid = $1";
    db.query(sql, [id], callback);
};
