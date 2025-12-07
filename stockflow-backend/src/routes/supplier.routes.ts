import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import * as supplierController from '../controllers/supplier.controller';

const router = Router();

// Todas as rotas de fornecedores requerem autenticação
router.use(protect);

// GET: Todos podem ver a lista de fornecedores
router.get('/', supplierController.getSuppliers);

// POST, PUT, DELETE: Apenas 'admin' pode manipular (criar, editar, deletar)
router.post('/', authorize(['admin']), supplierController.createSupplier);
router.put('/:id', authorize(['admin']), supplierController.updateSupplier);
router.delete('/:id', authorize(['admin']), supplierController.deleteSupplier);

export default router;