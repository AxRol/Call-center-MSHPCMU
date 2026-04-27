import db from "../config/db.js";
import bcrypt from "bcryptjs";

export const getAllUser = async (req, res) => {
  try {
    const users = await db.query(
      "SELECT uid, username, role, equipe_uid, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json({success: true, message: "Utilisateurs récupérés avec succès", data: users.rows});
  } catch (err) {
    res.status(500).json({message: "Erreur lors de la récupération des utilisateurs", error: "Erreur serveur"});
  }
};

export const getOneUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.query( "SELECT uid, username, role, equipe_uid FROM users WHERE uid = $1 AND is_active = true", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    res.status(200).json({success: true, message: "Utilisateur récupéré avec succès", data: user.rows[0]});
  } catch (err) {
    res.status(500).json({message: "Erreur lors de la récupération de l'utilisateur", error: "Erreur serveur"});
  }
};

export const addUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
  }
  try {
    const existing = await db.query("SELECT uid FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "Ce nom d'utilisateur existe déjà" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING uid, username, role, created_at",
      [username, password_hash, role]
    );
    res.status(201).json({success: true, message: "Utilisateur créé avec succès", data: user.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: "Erreur serveur" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  if (!username || !role) {
    return res.status(400).json({ success: false, message: "Le nom d'utilisateur et le rôle sont requis" });
  }
  try {
    let query, params;
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query = "UPDATE users SET username = $1, password = $2, role = $3 WHERE uid = $4 RETURNING uid, username, role";
      params = [username, password_hash, role, id];
    } else {
      query = "UPDATE users SET username = $1, role = $2 WHERE uid = $3 RETURNING uid, username, role";
      params = [username, role, id];
    }
    const user = await db.query(query, params);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    res.status(200).json({success: true, message: "Utilisateur mis à jour avec succès", data: user.rows[0]});
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: "Erreur serveur" });
  }
};

export const assignEquipe = async (req, res) => {
  const { id } = req.params;
  const { equipe_uid } = req.body;
  try {
    const user = await db.query(
      "UPDATE users SET equipe_uid = $1, updated_at = NOW() WHERE uid = $2 RETURNING uid, username, role, equipe_uid",
      [equipe_uid || null, id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ success: true, message: "Équipe assignée avec succès", data: user.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'assignation de l'équipe", error: "Erreur serveur" });
  }
};

export const archiveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await db.query(
      "UPDATE users SET is_active = false WHERE uid = $1 RETURNING uid, username", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    res.status(200).json({success: true, message: "Utilisateur archivé avec succès", data: user.rows[0]});
  } catch (err) {
    res.status(500).json({message: "Erreur lors de l'archivage de l'utilisateur", error: "Erreur serveur"});
  }
};