import express from 'express';
import auth, { requireRoles } from '../middleware/auth.js';
import { getRapportAppels, getRapportTickets } from '../controllers/RapportController.js';

const router = express.Router();

router.use(auth);

router.get('/appels',  requireRoles('admin', 'superviseur', 'agent'), getRapportAppels);
router.get('/tickets', requireRoles('admin', 'superviseur', 'agent', 'inspecteur'), getRapportTickets);

export default router;
