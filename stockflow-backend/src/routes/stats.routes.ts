import { Router } from 'express';
import { getDashboardSummary, getLowStockAlerts, getSalesChartData } from '../controllers/stats.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/summary', protect, getDashboardSummary);
router.get('/chart', protect, getSalesChartData);
router.get('/low-stock', protect, getLowStockAlerts);

export default router;