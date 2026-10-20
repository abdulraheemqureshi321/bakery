import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as settingsController from '../controllers/settingsController';
import * as uploadController from '../controllers/uploadController';
import * as categoryController from '../controllers/categoryController';
import * as productController from '../controllers/productController';
import * as orderController from '../controllers/orderController';
import * as memberController from '../controllers/memberController';
import * as pointsController from '../controllers/pointsController';
import * as voucherController from '../controllers/voucherController';
import * as referralController from '../controllers/referralController';
import {
  updateSettingSchema,
  bulkUpdateSettingsSchema,
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  updateOrderStatusSchema,
  adminCreateMemberSchema,
  adminUpdateMemberSchema,
  createVoucherSchema,
  updateVoucherSchema,
  issueVoucherSchema,
  adminAdjustPointsSchema,
} from '../validators/schemas';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// Settings
router.get('/settings', settingsController.getAll);
router.put('/settings/:key', validate(updateSettingSchema), settingsController.update);
router.put('/settings', validate(bulkUpdateSettingsSchema), settingsController.bulkUpdate);

// Categories
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategory);
router.post('/categories', validate(createCategorySchema), categoryController.createCategory);
router.put('/categories/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Products
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', validate(createProductSchema), productController.createProduct);
router.put('/products/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Orders
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getAdminOrder);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

// Members Management (Phase 4)
router.get('/members', memberController.getAdminMembers);
router.get('/members/:id', memberController.getAdminMember);
router.post('/members', validate(adminCreateMemberSchema), memberController.createAdminMember);
router.put('/members/:id', validate(adminUpdateMemberSchema), memberController.updateAdminMember);

// Member Bulk Import (Phase 4)
router.post(
  '/members/import/preview',
  memberController.uploadSpreadsheetMiddleware,
  memberController.previewImport
);
router.post(
  '/members/import/execute',
  memberController.uploadSpreadsheetMiddleware,
  memberController.executeImport
);
router.post('/members/import/download-errors', memberController.downloadErrorCsv);

// Points Management (Phase 5)
router.post('/points/adjust', validate(adminAdjustPointsSchema), pointsController.adminAdjustPoints);
router.get('/members/:memberId/points/history', pointsController.getAdminMemberPointsHistory);

// Vouchers Management (Phase 5)
router.get('/vouchers', voucherController.getAllVouchers);
router.post('/vouchers', validate(createVoucherSchema), voucherController.createVoucher);
router.put('/vouchers/:id', validate(updateVoucherSchema), voucherController.updateVoucher);
router.post('/vouchers/issue', validate(issueVoucherSchema), voucherController.issueVoucher);
router.post('/vouchers/:id/issue', validate(issueVoucherSchema), voucherController.issueVoucher);

// Referral Management (Phase 6)
router.get('/referrals', referralController.getAdminReferrals);
router.get('/referrals/stats', referralController.getAdminReferralStats);

// Uploads
router.post('/uploads', uploadController.uploadMiddleware, uploadController.uploadImage);
router.delete('/uploads/:publicId(*)', uploadController.deleteImage);

export default router;

