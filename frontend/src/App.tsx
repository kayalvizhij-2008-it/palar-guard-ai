import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppSidebar } from './components/layout/AppSidebar';
import { AuthModal } from './components/modules/AuthModal';
import { PresentationModeModal } from './components/modules/PresentationModeModal';
import { PremiumCursor } from './components/effects/PremiumCursor';
import { GlobalParticleBackground } from './components/effects/GlobalParticleBackground';

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
import { AnalysisWorkflowsModule } from './components/modules/AnalysisWorkflowsModule';

export function AppContent() {
  const getInitialView = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.includes('/app') || hash.includes('#app') || hash.includes('#dashboard')) {
      return 'dashboard';
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<string>(getInitialView);
  const [selectedLocationId, setSelectedLocationId] = useState<number>(1);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [presentationOpen, setPresentationOpen] = useState<boolean>(false);

  // Global 'P' shortcut to toggle Jury Presentation Walkthrough
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'p' || e.key === 'P') {
        setPresentationOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view?: string, locationId?: number) => {
    if (locationId) setSelectedLocationId(locationId);
    setCurrentView(view || 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderConsoleModule = () => {
    switch (currentView) {
      case 'digital_twin':
        return <DigitalTwinMap onSelectLocation={(locId) => handleNavigate('groundwater', locId)} />;
      case 'groundwater':
        return <GroundwaterModule initialLocationId={selectedLocationId} />;
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
      case 'workflows':
      case 'analyses':
        return <AnalysisWorkflowsModule />;
      case 'role_access':
        return <RoleAccessModule />;
      case 'admin_audit':
        return <AdminAuditModule />;
      case 'dashboard':
      default:
        return (
          <DashboardOverview 
            onSelectModule={handleNavigate} 
            onSelectLocation={(locId) => setSelectedLocationId(locId)} 
          />
        );
    }
  };

  const isLanding = currentView === 'landing';

  return (
    <div className="min-h-screen bg-[#061811] text-[#f4f7f5] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Premium Desktop Custom Cursor */}
      <PremiumCursor />

      {/* Top Sticky Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPresentation={() => setPresentationOpen(true)}
      />

      {isLanding ? (
        // Public 14-Section Landing Page View
        <main className="flex-1">
          <LandingPage 
            onExplore={handleNavigate} 
            onOpenPresentation={() => setPresentationOpen(true)} 
          />
          <Footer />
        </main>
      ) : (
        // Authenticated 16-Module Platform Console with Global Falling Particles
        <div className="flex-1 flex overflow-hidden relative dashboard-shell">
          {/* Continuous Environmental Falling Particle System behind all content */}
          <GlobalParticleBackground />
          <div className="relative z-10 flex w-full h-full overflow-hidden">
            <AppSidebar
              currentModule={currentView}
              onSelectModule={handleNavigate}
              onBackToLanding={() => handleNavigate('landing')}
              onOpenPresentation={() => setPresentationOpen(true)}
            />
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#04120c]/70 backdrop-blur-[0.5px] dashboard-content">
              <div className="w-full">
                {renderConsoleModule()}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => handleNavigate('dashboard')}
      />

      {/* Jury & Hackathon 12-Step Presentation Mode Modal */}
      <PresentationModeModal
        isOpen={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        onNavigateToModule={(mod) => {
          handleNavigate(mod);
          setPresentationOpen(false);
        }}
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
