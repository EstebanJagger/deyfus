import { Router } from 'express';
import { 
  getProducts, 
  autoAssignProductImages,
  getProductById,
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateInventory
} from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getProducts);
router.post('/images/auto', authMiddleware, autoAssignProductImages);
router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.post('/:id/inventory', authMiddleware, updateInventory);

export default router;