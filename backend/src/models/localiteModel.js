import db from "../config/db.js";

export const getAllLocalite = async (req, res) => {
  try {
    const r = await db.query(
      "SELECT id, uid, libelle, is_active, created_at, updated_at FROM localites WHERE is_active = true ORDER BY libelle ASC"
    );
    res.status(200).json({ success: true, data: r.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des localités" });
  }
};

export const getOneLocalite = async (req, res) => {
  const { id } = req.params;
  try {
    const r = await db.query(
      "SELECT id, uid, libelle, is_active, created_at, updated_at FROM localites WHERE uid = $1",
      [id]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Localité non trouvée" });
    }
    res.status(200).json({ success: true, data: r.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération de la localité" });
  }
};

export const addLocalite = async (req, res) => {
  const { libelle } = req.body;
  if (!libelle) {
    return res.status(400).json({ success: false, message: "Le libellé est requis" });
  }
  try {
    const r = await db.query(
      "INSERT INTO localites (libelle) VALUES ($1) RETURNING id, uid, libelle, is_active, created_at, updated_at",
      [String(libelle).trim()]
    );
    res.status(201).json({ success: true, data: r.rows[0], message: "Localité créée avec succès" });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Ce libellé de localité existe déjà" });
    }
    res.status(500).json({ success: false, message: "Erreur lors de la création de la localité" });
  }
};

export const updateLocalite = async (req, res) => {
  const { id } = req.params;
  const { libelle } = req.body;
  if (!libelle) {
    return res.status(400).json({ success: false, message: "Le libellé est requis" });
  }
  try {
    const r = await db.query(
      `UPDATE localites SET libelle = $1, updated_at = now()
       WHERE uid = $2 AND is_active = true RETURNING id, uid, libelle, is_active, created_at, updated_at`,
      [String(libelle).trim(), id]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Localité non trouvée" });
    }
    res.status(200).json({ success: true, data: r.rows[0], message: "Localité mise à jour avec succès" });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Ce libellé de localité existe déjà" });
    }
    res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de la localité" });
  }
};

export const archiveLocalite = async (req, res) => {
  const { id } = req.params;
  try {
    const r = await db.query(
      "UPDATE localites SET is_active = false, updated_at = now() WHERE uid = $1 AND is_active = true RETURNING id, uid, libelle, is_active, created_at, updated_at",
      [id]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Localité non trouvée" });
    }
    res.status(200).json({ success: true, data: r.rows[0], message: "Localité désactivée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la désactivation de la localité" });
  }
};
