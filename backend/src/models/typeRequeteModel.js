import db from "../config/db.js";

export const getAllTypeRequete = async (req, res) => {
    try {
        const typeRequete = await db.query("SELECT * FROM types_requetes");
        res.status(200).json({ success: true, data: typeRequete.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération des types de requête" });
    }   
};

export const getOneTypeRequete = async (req, res) => {
    const { id } = req.params;
    try {
        const typeRequete = await db.query("SELECT * FROM types_requetes WHERE uid = $1", [id]);
        if (typeRequete.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Type de requête non trouvé" });
        }
        res.status(200).json({ success: true, data: typeRequete.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la récupération du type de requête" });
    }   
};

export const addTypeRequete = async (req, res) => {
    const { code, libelle } = req.body;
    try {  
        const typeRequete = await db.query( "INSERT INTO types_requetes (code, libelle) VALUES ($1, $2) RETURNING *", [code, libelle]
        );
        res.status(201).json({ success: true, data: typeRequete.rows[0], message: "Type de requête créé avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la création du type de requête" });
    }  
};

export const updateTypeRequete = async (req, res) => {
    const { id } = req.params;
    const { code, libelle } = req.body;
    try {
        const typeRequete = await db.query(
            "UPDATE types_requetes SET code = $1, libelle = $2 WHERE id = $3 RETURNING *",
            [code, libelle, id]
        );     
        if (typeRequete.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Type de requête non trouvé" });
        }
        res.status(200).json({ success: true, data: typeRequete.rows[0], message: "Type de requête mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du type de requête" });
    }
};

export const archiveTypeRequete = async (req, res) => {
    const { id } = req.params;
    try {
        const typeRequete = await db.query(
            "DELETE FROM types_requetes WHERE uid = $1 RETURNING *",
            [id]
        );      
        if (typeRequete.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Type de requête non trouvé" });
        }
        res.status(200).json({ success: true, data: typeRequete.rows[0], message: "Type de requête supprimé avec succès" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression du type de requête" });
    }
};

