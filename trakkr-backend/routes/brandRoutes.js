// routes\brandRoutes.js
import express from 'express';
import { analyzeBrand, saveBrand, getUserBrands } from '../controllers/brandController.js';

const router = express.Router();

router.post('/analyze', analyzeBrand);
router.post('/save', saveBrand);
router.get('/user/:user_email', getUserBrands);

export default router;