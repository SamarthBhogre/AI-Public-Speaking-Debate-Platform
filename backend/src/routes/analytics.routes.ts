import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.get('/overview', requireAuth, analyticsController.getOverview);
router.get('/speaking', requireAuth, analyticsController.getSpeaking);
router.get('/debate', requireAuth, analyticsController.getDebate);
router.get('/streak', requireAuth, analyticsController.getStreak);

export default router;
