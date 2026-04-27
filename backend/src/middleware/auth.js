import jwt from "jsonwebtoken";

// Middleware de base qui vérifie la présence et la validité du JWT
export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401); // pas de token -> non autorisé

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Le payload du token doit contenir au moins : { id, role }
    req.user = decoded;
    next();
  } catch (err) {
    // token invalide ou expiré
    res.sendStatus(403);
  }
}

// Vérifie que l'utilisateur a AU MOINS un des rôles autorisés
// Exemple d'utilisation : requireRoles("utilisateur", "superviseur")
export function requireRoles(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) return res.sendStatus(401); // pas connecté

    const role = req.user.role;
    if (!rolesAutorises.includes(role)) {
      // rôle non autorisé pour cette ressource
      return res.sendStatus(403);
    }

    next();
  };
}

// Helper précédent conservé si tu en as déjà l'usage ailleurs
export function requireRole(role) {
  return requireRoles(role);
}