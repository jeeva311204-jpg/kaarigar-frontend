import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { OfflineBanner } from './components/common/OfflineBanner';

// Pages
import { AuthPage } from './pages/AuthPage';
import { ArtisanDashboard } from './pages/artisan/ArtisanDashboard';
import { AddProductWizard } from './pages/artisan/AddProductWizard';
import { ReviewPublishPage } from './pages/artisan/ReviewPublishPage';
import { InquiriesInboxPage } from './pages/artisan/InquiriesInboxPage';
import { ArtisanProfilePage } from './pages/artisan/ArtisanProfilePage';
import { MarketplaceBrowse } from './pages/buyer/MarketplaceBrowse';
import { ProductDetailPage } from './pages/buyer/ProductDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Smart Home Route based on active role
const SmartHomeRoute: React.FC = () => {
  const { role } = useAuth();
  if (role === 'artisan') {
    return <ArtisanDashboard />;
  }
  return <MarketplaceBrowse />;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper-texture text-indigo-950">
      <OfflineBanner />
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SmartHomeRoute />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Artisan Specific Routes */}
          <Route path="/add-product" element={<AddProductWizard />} />
          <Route path="/review-publish" element={<ReviewPublishPage />} />
          <Route path="/inbox" element={<InquiriesInboxPage />} />
          <Route path="/profile" element={<ArtisanProfilePage />} />

          {/* Marketplace & Discovery Routes */}
          <Route path="/marketplace" element={<MarketplaceBrowse />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
