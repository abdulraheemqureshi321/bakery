import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

// Core entry storefront page loaded eagerly
import { HomePage } from './pages/HomePage';

// Lazy-loaded storefront pages for code-splitting & fast mobile load
const CatalogPage = lazy(() => import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const OtpLoginPage = lazy(() => import('./pages/OtpLoginPage').then((m) => ({ default: m.OtpLoginPage })));
const SetPasswordPage = lazy(() => import('./pages/SetPasswordPage').then((m) => ({ default: m.SetPasswordPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const ReferralRedirectPage = lazy(() => import('./pages/ReferralRedirectPage').then((m) => ({ default: m.ReferralRedirectPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-loaded admin portal pages
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminMembersPage = lazy(() => import('./pages/admin/AdminMembersPage').then((m) => ({ default: m.AdminMembersPage })));
const AdminMemberImportPage = lazy(() => import('./pages/admin/AdminMemberImportPage').then((m) => ({ default: m.AdminMemberImportPage })));
const AdminVouchersPage = lazy(() => import('./pages/admin/AdminVouchersPage').then((m) => ({ default: m.AdminVouchersPage })));
const AdminReferralsPage = lazy(() => import('./pages/admin/AdminReferralsPage').then((m) => ({ default: m.AdminReferralsPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));

const PageLoadingFallback: React.FC = () => (
  <div style={{
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #fef3c7',
      borderTopColor: '#d97706',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: '0.875rem', color: '#78716c', fontWeight: 500 }}>
      Loading SoulTalk Pastry...
    </span>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Storefront Layout */}
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<CatalogPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route
                      path="/orders/confirmation/:id"
                      element={
                        <ProtectedRoute>
                          <OrderConfirmationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/otp-login" element={<OtpLoginPage />} />
                    <Route
                      path="/set-password"
                      element={
                        <ProtectedRoute>
                          <SetPasswordPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <AccountPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={<Navigate to="/account" replace />}
                    />
                  </Route>

                  {/* Admin Portal Layout (Protected by AdminRoute) */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/orders" replace />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/new" element={<AdminProductFormPage />} />
                    <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="members" element={<AdminMembersPage />} />
                    <Route path="members/import" element={<AdminMemberImportPage />} />
                    <Route path="vouchers" element={<AdminVouchersPage />} />
                    <Route path="referrals" element={<AdminReferralsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* Direct Referral Short Link */}
                  <Route path="/r/:code" element={<ReferralRedirectPage />} />

                  {/* 404 Not Found Page */}
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default App;
