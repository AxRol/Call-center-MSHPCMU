import db from "../config/db.js";

export const getAllTypeAppel = async (req, res) => {
    const sql = "SELECT code, libelle FROM types_appels WHERE is_active = true";
    try {
        const typeAppel = await db.query(sql);
        res.status(200).json({ success: true, message: "Types d'appels récupérés avec succès", data: typeAppel.rows });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération des types d'appels", error: "Erreur serveur" });
    }
};

export const getOneTypeAppel = async (req, res) => {
    const { id } = req.params;
    const sql = "SELECT code, libelleFROM types_appels WHERE uid = $1";
    try {
        const typeAppel = await db.query(sql, [id]);
        if (typeAppel.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Type d'appel non trouvé" });
        }      
        res.status(200).json({ success: true, message: "Type d'appel récupéré avec succès", data: typeAppel.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération du type d'appel", error: "Erreur serveur" });
    }
};

export const addTypeAppel = async (req, res) => {
    const { code, libelle } = req.body; 
    if (!code || !libelle) {
        return res.status(400).json({ success: false, message: "Le code et le libellé du type d'appel sont requis" });
    }   
    const sql = "INSERT INTO types_appels (code, libelle) VALUES ($1, $2) RETURNING *";
    try {
        const typeAppel = await db.query(sql, [code, libelle]);
        res.status(201).json({ success: true, message: "Type d'appel créé avec succès", data: typeAppel.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la création du type d'appel", error: "Erreur serveur" });
    }   
};

export const updateTypeAppel = async (req, res) => { 
    const { id } = req.params;
    const { code, libelle } = req.body; 
    if (!code || !libelle) {
        return res.status(400).json({ success: false, message: "Le code et le libellé du type d'appel sont requis" });
    }
    const sql = "UPDATE types_appels SET code = $1, libelle = $2 WHERE uid = $3 RETURNING *";
    try {
        const typeAppel = await db.query(sql, [code, libelle, id]);
        if (typeAppel.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Type d'appel non trouvé" });
        }
        res.status(200).json({ success: true, message: "Type d'appel mis à jour avec succès", data: typeAppel.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du type d'appel", error: "Erreur serveur" });
    }
};

export const archiveTypeAppel = async (req, res) => { 
    const { id } = req.params;
    const sql = "UPDATE types_appels SET is_active = false WHERE uid = $1 RETURNING *";
    try {
        const typeAppel = await db.query(sql, [id]);
        if (typeAppel.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Type d'appel non trouvé" });
        }
        res.status(200).json({ success: true, message: "Type d'appel supprimé avec succès", data: typeAppel.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la suppression du type d'appel", error: "Erreur serveur" });
    }
};