import React from 'react';
import { Link } from 'react-router-dom';
import { Cake, ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full soultalk-card p-8 sm:p-10 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card)] space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[var(--color-surface-soft)] text-[var(--color-secondary-dark)] border border-[var(--color-border)] flex items-center justify-center mx-auto shadow-xs">
          <Cake className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="space-y-1">
          <span className="font-script text-2xl text-[var(--color-secondary-dark)] font-semibold block">
            心聊甜香 • 404
          </span>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-[var(--color-text)]">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed pt-1">
            The pastry or page you were seeking might have been enjoyed already, moved, or never existed in our bakery.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link to="/" className="btn-primary text-xs !min-h-[44px]">
            <Home className="w-4 h-4 stroke-[2]" />
            <span>Return to Home</span>
          </Link>

          <Link to="/products" className="btn-secondary text-xs !min-h-[44px]">
            <ShoppingBag className="w-4 h-4 stroke-[2]" />
            <span>Browse Fresh Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
