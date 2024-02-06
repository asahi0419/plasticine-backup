import { Router } from 'express';
import * as TopologyController from './api/index.js';

const router = new Router();

router.get(`${process.env.ROOT_ENDPOINT}/topology`, (req, res) => res.send('Application was started'));
router.post(`${process.env.ROOT_ENDPOINT}/topology/build`, TopologyController.build);

export default router;