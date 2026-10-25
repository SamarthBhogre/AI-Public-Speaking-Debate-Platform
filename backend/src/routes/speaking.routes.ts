import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { evaluateSchema, topicSchema } from '../validators/speaking.validator';
import * as speakingController from '../controllers/speaking.controller';

const router = Router();

router.post('/topic', requireAuth, validate(topicSchema), speakingController.getTopic);
router.post('/session', requireAuth, validate(evaluateSchema), speakingController.createSession);
router.post('/evaluate', requireAuth, validate(evaluateSchema), speakingController.createSession);
router.get('/history', requireAuth, speakingController.getHistory);
router.get('/:id', requireAuth, speakingController.getById);

export default router;
