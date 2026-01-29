import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import * as saleController from '../controllers/sale.controller';

const router = Router();

// Todas as rotas de venda requerem autenticação
router.use(protect);

// POST: Criar venda (Admin e Seller, Customer)
router.post('/', authorize(['admin', 'seller', 'customer']), saleController.createSale);

router.get('/report', authorize(['admin']), saleController.getSalesReport);
router.get('/', authorize(['admin', 'customer', 'seller', 'stocker']), saleController.getSales);




export default router;