import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';
import * as crud from '../controllers/adminCrudController.js';

const router = Router();

router.post('/login', admin.login);

router.use(requireAdmin);

router.get('/me', admin.me);
router.get('/stats', admin.stats);
router.post('/upload', admin.upload.single('file'), admin.uploadFile);

router.get('/themes', crud.listThemes);
router.post('/themes', crud.createTheme);
router.get('/themes/:id', crud.getTheme);
router.patch('/themes/:id', crud.updateTheme);
router.delete('/themes/:id', crud.deleteTheme);
router.get('/themes/:id/products', crud.getThemeProducts);
router.post('/themes/:id/products', crud.assignThemeProduct);
router.patch('/themes/:id/products/reorder', crud.reorderThemeProducts);
router.delete('/themes/:id/products/:productId', crud.removeThemeProduct);

router.get('/products', crud.listProducts);
router.post('/products', crud.createProduct);
router.get('/products/:id', crud.getProduct);
router.patch('/products/:id', crud.updateProduct);
router.delete('/products/:id', crud.deleteProduct);

router.get('/categories', crud.listCategories);
router.post('/categories', crud.createCategory);
router.patch('/categories/:id', crud.updateCategory);
router.delete('/categories/:id', crud.deleteCategory);

router.get('/colors', crud.listColors);
router.post('/colors', crud.createColor);
router.patch('/colors/:id', crud.updateColor);
router.delete('/colors/:id', crud.deleteColor);

router.get('/orders', crud.listOrders);
router.get('/orders/:id', crud.getOrder);
router.patch('/orders/:id', crud.updateOrder);

router.get('/settings', crud.listSettings);
router.patch('/settings', crud.updateSettings);

export default router;
