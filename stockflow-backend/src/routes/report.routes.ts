import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import * as reportController from '../reports/report.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(protect);

// Relatório de estoque crítico: admin e estoquista podem ver
router.get('/critical-stock', authorize(['admin', 'stocker']), reportController.getCriticalStockReport);

// Relatório de lucro mensal: admin
router.get('/monthly-profit', authorize(['admin']), reportController.getMonthlyProfitReport);


export default router;