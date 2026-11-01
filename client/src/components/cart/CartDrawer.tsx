import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getOptimizedImageUrl, getProductDisplayImage } from '../../utils/image';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalItemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    navigate('/products');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      {/* Warm Backdrop */}
      <div
        className="fixed inset-0 bg-[#4A362F]/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-3 sm:pl-10">
        <div className="w-screen max-w-md bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--shadow-floating)] flex flex-col border-l border-[var(--color-border)] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-soft)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-sage)] text-[var(--color-primary-dark)] flex items-center justify-center border border-[var(--color-primary)]/20 shadow-xs">
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h2 className="font-serif-heading text-lg font-semibold text-[var(--color-text)] leading-tight">
                  Your Pastry Bag
                </h2>
                <span className="font-script text-sm text-[var(--color-secondary-dark)]">
                  {totalItemCount} delicious creation{totalItemCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]/50 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-border)] flex items-center justify-center mx-auto text-[var(--color-text-muted)]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <p className="font-serif-heading text-lg font-semibold text-[var(--color-text)]">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-xs mx-auto">
                    Treat yourself or someone special to freshly baked artisanal cakes, cups, and celebratory treats.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="btn-primary text-xs !min-h-[42px]"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item) => {
                  const imgUrl = item.product?.images?.[0]?.url || '/products/strawberry-love-cake.png';

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-[var(--color-background)] border border-[var(--color-border)] flex gap-3.5 items-center shadow-xs"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={getProductDisplayImage(item.product?.slug || imgUrl)}
                        alt={item.product?.name || 'Pastry'}
                        className="w-16 h-16 rounded-xl object-contain p-1 border border-[var(--color-border)] shrink-0 bg-[var(--color-surface)]"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif-heading text-sm font-semibold text-[var(--color-text)] truncate">
                          {item.product?.name}
                        </h4>

                        {/* Variants summary */}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
                            {Object.entries(item.selectedVariants)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </p>
                        )}

                        {item.customizationNotes && (
                          <p className="text-[10px] text-[var(--color-secondary-dark)] italic truncate mt-0.5">
                            Note: "{item.customizationNotes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-serif-heading font-semibold text-xs text-[var(--color-primary-dark)]">
                            RM {(item.unitPrice * item.quantity).toFixed(2)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-[var(--color-surface)] rounded-full border border-[var(--color-border)] px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 stroke-[2]" />
                            </button>
                            <span className="text-xs font-bold w-4 text-center text-[var(--color-text)]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 stroke-[2]" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors self-start"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.8]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-surface-soft)] space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span className="font-serif-heading font-semibold text-base text-[var(--color-text)]">
                  RM {subtotal.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-[var(--color-text-muted)] text-center">
                Delivery and voucher discounts are calculated at checkout.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="btn-primary w-full shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleContinueShopping}
                    className="text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline underline-offset-2"
                  >
                    Continue Browsing
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                  >
                    Empty Bag
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
