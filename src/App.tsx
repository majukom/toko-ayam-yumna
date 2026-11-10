/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BuyerStorefront } from './components/BuyerStorefront';
import { Footer } from './components/Footer';
import { SellerDashboard } from './components/SellerDashboard';
import { BuyerAuthModal } from './components/BuyerAuthModal';
import { SellerAuthModal } from './components/SellerAuthModal';
import { CartDrawer } from './components/CartDrawer';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DemoRoleSwitcher } from './components/DemoRoleSwitcher';

const AppContent: React.FC = () => {
  const { role } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      {/* Role-based main view */}
      {role === 'PENJUAL' ? (
        <SellerDashboard />
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <BuyerStorefront />
          </main>
          <Footer />
        </div>
      )}

      {/* Global Interactive Modals & Drawers */}
      <BuyerAuthModal />
      <SellerAuthModal />
      <CartDrawer />
      <DigitalReceiptModal />
      <OfflineIndicator />
      <DemoRoleSwitcher />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
