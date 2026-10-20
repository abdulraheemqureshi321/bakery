import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import * as categoryController from '../controllers/categoryController';
import * as productController from '../controllers/productController';
import * as referralController from '../controllers/referralController';

const router = Router();

// Public settings (store info, WhatsApp number, brand)
router.get('/settings', settingsController.getPublic);

// Referral validation
router.get('/referrals/validate/:code', referralController.validateReferralCode);

// Public categories
router.get('/categories', categoryController.getAllCategories);

// Public products (filtering, sorting, pagination)
router.get('/products', productController.getProducts);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products/:slug', productController.getProductBySlug);

export default router;
