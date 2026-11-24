import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppSidebar } from './components/layout/AppSidebar';
import { AuthModal } from './components/modules/AuthModal';

// Modules
import { LandingPage } from './components/modules/LandingPage';
import { DashboardOverview } from './components/modules/DashboardOverview';
import { DigitalTwinMap } from './components/modules/DigitalTwinMap';
import { GroundwaterModule } from './components/modules/GroundwaterModule';
import { ForecastingModule } from './components/modules/ForecastingModule';
import { RainfallModule } from './components/modules/RainfallModule';
import { WaterQualityModule } from './components/modules/WaterQualityModule';
import { AnomalyModule } from './components/modules/AnomalyModule';
import { RiskPrioritisationModule } from './components/modules/RiskPrioritisationModule';
import { DataConfidenceModule } from './components/modules/DataConfidenceModule';
import { CommunityReportingModule } from './components/modules/CommunityReportingModule';
import { InvestigationModule } from './components/modules/InvestigationModule';
import { RechargeModule } from './components/modules/RechargeModule';
import { AIAssistantModule } from './components/modules/AIAssistantModule';
import { AnalyticsReportingModule } from './components/modules/AnalyticsReportingModule';
import { RoleAccessModule } from './components/modules/RoleAccessModule';
import { AdminAuditModule } from './components/modules/AdminAuditModule';

export function AppContent() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const handleNavigate = (view?: string) => {
    setCurrentView(view || 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderConsoleModule = () => {
    switch (currentView) {
      case 'digital_twin':
        return <DigitalTwinMap onSelectLocation={() => setCurrentView('groundwater')} />;
      case 'groundwater':
        return <GroundwaterModule />;
      case 'forecasting':
        return <ForecastingModule />;
      case 'rainfall':
        return <RainfallModule />;
      case 'water_quality':
        return <WaterQualityModule />;
      case 'anomalies':
        return <AnomalyModule />;
      case 'risk_priority':
        return <RiskPrioritisationModule />;
      case 'confidence':
        return <DataConfidenceModule />;
      case 'community':
        return <CommunityReportingModule />;
      case 'investigations':
        return <InvestigationModule />;
      case 'recharge':
        return <RechargeModule />;
      case 'assistant':
        return <AIAssistantModule />;
      case 'analytics':
        return <AnalyticsReportingModule />;
      case 'role_access':
        return <RoleAccessModule />;
      case 'admin_audit':
        return <AdminAuditModule />;
      case 'dashboard':
      default:
        return <DashboardOverview onSelectModule={handleNavigate} />;
    }
  };

  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-[#061811] text-[#f4f7f5] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {isLanding ? (
        // Public 14-Section Landing Page View
        <main className="flex-1">
          <LandingPage onExplore={handleNavigate} />
          <Footer />
        </main>
      ) : (
        // Authenticated 16-Module Platform Console
        <div className="flex-1 flex overflow-hidden">
          <AppSidebar
            currentModule={currentView}
            onSelectModule={handleNavigate}
            onBackToLanding={() => handleNavigate('landing')}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#04120c]">
            <div className="max-w-7xl mx-auto">
              {renderConsoleModule()}
            </div>
          </main>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => handleNavigate('dashboard')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
