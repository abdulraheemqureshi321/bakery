import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';
import { CartDrawer } from '../cart/CartDrawer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsAppButton />
    </div>
  );
};
