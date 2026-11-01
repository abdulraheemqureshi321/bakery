import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';
import { FloatingPetals } from '../common/FloatingPetals';
import { CartDrawer } from '../cart/CartDrawer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text)] font-sans-body antialiased selection:bg-[var(--color-blush)] selection:text-[var(--color-cocoa)] relative overflow-x-hidden">
      <FloatingPetals />
      <Navbar />
      <main className="flex-1 relative z-20">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsAppButton />
    </div>
  );
};
