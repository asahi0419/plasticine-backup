import { Router } from 'express';
import { checkHealth } from './controller/controller.js';

const router = new Router();

router.get('/', (req, res) => res.send('Application was started'));
router.get('/health', checkHealth);


export default router;