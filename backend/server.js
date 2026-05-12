import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import session from "express-session";
import authRoutes from "./src/routes/authRoutes.js";
import formulaire_appelRoutes from "./src/routes/formulaire_appelRoutes.js";
import typeAppelRoutes from "./src/routes/typeAppelRoutes.js";
import typeRequeteRoutes from "./src/routes/typeRequeteRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import rapportRoutes from "./src/routes/rapportRoutes.js";
import equipeRoutes from "./src/routes/equipeRoutes.js";
//import dashboardRoutes from "./src/routes/dashboardRoutes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

//Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'mshpcmu_callcenter_2026_ultra_secure_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 1000 * 60 * 60, // 1 heure
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  }));

 /*  app.use(session({
    secret: process.env.SESSION_SECRET || 'mshpcmu_callcenter_2026_ultra_secure_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
}));
 */
app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    try {
      req.rawBody = buf.toString(encoding || 'utf8');
    } catch (e) {
      req.rawBody = '';
    }
  }
}));
app.use(bodyParser.urlencoded({ extended: true }));
// Log raw body for requests claiming JSON to help debug parse errors
app.use((req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    if (req.rawBody === undefined); //console.warn('rawBody undefined for JSON request');
    else if (req.rawBody.length === 0) console.warn('empty JSON body received');
  }
  next();
});
// Liste des origines autorisées: dev local + URL Vercel en production
// Remplacer VOTRE_URL_VERCEL par l'URL fournie par Vercel après déploiement
// Exemple: https://gestion-des-appels.vercel.app
const allowedOrigins = [
  'http://localhost:5173',
  'https://call-center-mshpcmu.vercel.app',
 'https://call-center-mshpcmu.onrender.com'
  //process.env.FRONTEND_URL,         // Variable à définir sur Render
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`CORS bloqué: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parse error:', err);
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

app.get("/", (req,res)=>{
    res.json({message:"API Call Center OK"})
})

app.use("/api/auth", authRoutes)
app.use("/api/appel", formulaire_appelRoutes)
app.use("/api/ticket", ticketRoutes)
app.use("/api/typeAppel", typeAppelRoutes)
app.use("/api/user", userRoutes)
app.use("/api/rapport", rapportRoutes)
app.use("/api/equipe", equipeRoutes)
//app.use("/api/dashbord", dashboardRoutes)
app.use("/api/typeRequete", typeRequeteRoutes)

const PORT = process.env.PORT || 5170;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => console.log(`✅ Serveur démarré sur ${HOST}:${PORT}`));