import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import * as productController from '../controllers/product.controller';
import multer from 'multer';
import uploadConfig from '../config/multer';

const router = Router();
const upload = multer(uploadConfig);

router.use(protect);

// 'image' Nome do campo que o frontend deve usar no FormData
router.post('/upload', authorize(['admin', 'seller']), upload.single('image'), productController.uploadProductImage)

// GET: Aberta para todos os papéis logados
router.get('/', productController.getProducts);

// POST: Permitido para 'admin', 'seller' e 'stocker'
router.post('/', authorize(['admin', 'seller', 'stocker']), productController.createProduct);

// PUT: Permitido para 'admin', 'stocker' - manipulam estoque/preços
router.put('/:id', authorize(['admin', 'stocker']), productController.updateProduct);

// DELETE: Permitido para 'admin'
router.delete('/:id', authorize(['admin']), productController.deleteProduct);

export default router;