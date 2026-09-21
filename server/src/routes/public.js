import { Router } from 'express';
import { cartSession } from '../middleware/cartSession.js';
import * as pub from '../controllers/publicController.js';
import * as orders from '../controllers/orderController.js';

const router = Router();

router.get('/themes', pub.listThemes);
router.get('/themes/:slug', pub.getTheme);
router.get('/categories', pub.listCategories);
router.get('/categories/:slug', pub.getCategoryProducts);
router.get('/colors', pub.listColors);
router.get('/colors/:slug', pub.getColorProducts);
router.get('/products', pub.listProducts);
router.get('/products/:slug', pub.getProduct);
router.get('/search', pub.search);
router.get('/settings', pub.getSettings);

router.use('/cart', cartSession);
router.get('/cart', pub.getCart);
router.post('/cart/add-set', pub.addSet);
router.post('/cart/items', pub.addItem);
router.patch('/cart/items/:id', pub.updateItem);
router.delete('/cart/items/:id', pub.deleteItem);
router.patch('/cart/set/:setGroupId', pub.updateSet);
router.delete('/cart/set/:setGroupId', pub.deleteSet);
router.delete('/cart', pub.clearCart);

router.use('/orders', cartSession);
router.post('/orders', orders.createOrder);
router.get('/orders/:orderNumber', orders.getOrder);

export default router;
