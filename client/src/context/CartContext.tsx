import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    selectedVariants?: Record<string, string>,
    customizationNotes?: string
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'soultalk_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addItem = (
    product: Product,
    quantity: number = 1,
    selectedVariants: Record<string, string> = {},
    customizationNotes?: string
  ) => {
    // Calculate variant price modifier
    let variantPriceModifier = 0;
    if (product.variants && product.variants.length > 0) {
      for (const [varName, selectedOpt] of Object.entries(selectedVariants)) {
        const variantDef = product.variants.find((v) => v.name === varName);
        if (variantDef) {
          const optIdx = variantDef.options.indexOf(selectedOpt);
          if (optIdx !== -1 && variantDef.priceModifiers && variantDef.priceModifiers[optIdx]) {
            variantPriceModifier += Number(variantDef.priceModifiers[optIdx]) || 0;
          }
        }
      }
    }

    const unitPrice = product.price + variantPriceModifier;
    const sortedVariantKeys = Object.keys(selectedVariants).sort();
    const variantKey = sortedVariantKeys.map((k) => `${k}:${selectedVariants[k]}`).join('|');
    const itemId = `${product._id}_${variantKey}`;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === itemId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: itemId,
          productId: product._id,
          product,
          quantity,
          selectedVariants,
          variantPriceModifier,
          customizationNotes,
          unitPrice,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const subtotal = Math.round(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100
  ) / 100;

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
