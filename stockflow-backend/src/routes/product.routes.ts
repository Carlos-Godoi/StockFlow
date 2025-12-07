import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import * as productController from '../controllers/product.controller';

const router = Router();

router.use(protect);

// GET: Aberta para todos os papéis logados
router.get('/', productController.getProducts);

// POST: Permitido para 'admin', 'seller' e 'stocker'
router.post('/', authorize(['admin', 'seller', 'stocker']), productController.createProduct);

// PUT: Permitido para 'admin', 'stocker' - manipulam estoque/preços
router.put('/:id', authorize(['admin', 'stocker']), productController.updateProduct);

// DELETE: Permitido para 'admin'
router.delete('/:id', authorize(['admin']), productController.deleteProduct);

export default router;