import pool from './config/db.js'; // Assurez-vous que le chemin est correct

async function checkConnection() {
  try {
    // On tente d'exécuter une requête simple
    const res = await pool.query('SELECT NOW() as now, version()');
    
    console.log('--- 🛡️ Rapport de Connexion Sysgesroom ---');
    console.log('✅ Statut : Connecté avec succès');
    console.log('🕒 Heure du serveur BD :', res.rows[0].now);
    console.log('📦 Version :', res.rows[0].version);
    console.log('-----------------------------------------');

  } catch (err) {
    console.error('❌ Échec de la connexion à la base de données :');
    console.error('Message :', err.message);
    console.error('Code d\'erreur :', err.code); // Très utile pour débugger (ex: 28P01 pour mauvais mot de passe)
  } finally {
    // Fermer le pool après le test pour libérer le terminal
    await pool.end();
  }
}

checkConnection();