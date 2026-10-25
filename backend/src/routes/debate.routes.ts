import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import {
  startDebateSchema,
  respondSchema,
  evaluateDebateSchema,
} from '../validators/debate.validator';
import * as debateController from '../controllers/debate.controller';

const router = Router();

router.post('/topic', requireAuth, debateController.getTopic);
router.post('/session', requireAuth, validate(startDebateSchema), debateController.startSession);
router.post('/respond', requireAuth, validate(respondSchema), debateController.respond);
router.post('/evaluate', requireAuth, validate(evaluateDebateSchema), debateController.evaluate);
router.get('/history', requireAuth, debateController.getHistory);
router.get('/:id', requireAuth, debateController.getById);

export default router;
