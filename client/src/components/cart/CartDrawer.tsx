import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-950 text-stone-100 shadow-2xl flex flex-col border-l border-stone-800 animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif-display text-lg font-bold text-white">
                  Your Pastry Bag
                </h2>
                <span className="text-xs text-stone-400">
                  {totalItemCount} item{totalItemCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-base font-semibold text-stone-200">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Explore our handcrafted cakes, party bags, and signature viennoiseries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {items.map((item) => {
                  const coverImage = item.product.images?.[0]?.url;
                  const variantEntries = Object.entries(item.selectedVariants || {});

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/80 flex gap-3.5 items-start hover:border-stone-750 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-stone-800 border border-stone-700/60 overflow-hidden shrink-0">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-stone-100 truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variant Chips */}
                        {variantEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-1">
                            {variantEntries.map(([k, v]) => (
                              <span
                                key={k}
                                className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700/60"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-800/60">
                          <div className="text-xs">
                            <span className="font-semibold text-rose-400 font-mono">
                              ${item.unitPrice.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-stone-500 ml-1">
                              ea.
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-lg p-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-semibold text-stone-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-800 bg-stone-950 space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-stone-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-stone-200 font-semibold text-sm">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-stone-500">
                  <span>Fulfillment & Fees</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-stone-500 hover:text-rose-400 transition-colors"
                >
                  Clear Bag
                </button>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
