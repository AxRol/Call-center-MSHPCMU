import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users(username, password, role) VALUES($1, $2, $3) RETURNING *",
      [username, password_hash, role]
    );
    res.status(201).json({ ...result.rows[0], success: true, message: "Inscription réussie" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;


    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Nom utilisateur et mot de passe requis' });
    }
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Nom utilisateur ou mot de passe incorrect' });
    }

    const passwordHash = user.password;
    if (!passwordHash) {
      return res.status(500).json({ success: false, message: 'Compte invalide (hash manquant)' });
    }

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Nom utilisateur ou mot de passe incorrect' });
    }
    // Création du Token
    const token = jwt.sign({ id: user.uid, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ success: true, token: token, user: { id: user.uid, username: user.username, role: user.role }, message: 'Connexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur lors de la connexion" });
  }
};

export const logout = (req, res) => {
  res.status(200).json({ success: true, message: "Déconnexion réussie" });
};