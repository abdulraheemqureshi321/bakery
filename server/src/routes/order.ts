import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as orderController from '../controllers/orderController';
import { createOrderSchema, previewOrderSchema } from '../validators/schemas';

const router = Router();

// Preview order / cart calculation (supports optional auth for vouchers & points)
router.post('/preview', optionalAuth, validate(previewOrderSchema), orderController.previewOrder);

// All subsequent order creation and retrieval endpoints require authentication
router.post('/', authenticate, validate(createOrderSchema), orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getMyOrder);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

export default router;
