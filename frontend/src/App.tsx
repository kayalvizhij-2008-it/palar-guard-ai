import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppSidebar } from './components/layout/AppSidebar';
import { AuthModal } from './components/modules/AuthModal';
import { PresentationModeModal } from './components/modules/PresentationModeModal';
import { CustomCursor } from './components/effects/CustomCursor';
import { ParticleField } from './components/effects/ParticleField';

// Modules
import { LandingPage } from './components/modules/LandingPage';
import { DashboardOverview } from './components/modules/DashboardOverview';
import { CommunityDashboard, CommunityTab } from './components/modules/CommunityDashboard';
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
import { DocumentIntelligenceModule } from './components/modules/DocumentIntelligenceModule';
import { MonitoringWatchlistModule } from './components/modules/MonitoringWatchlistModule';

const VALID_PRO_MODULES = new Set([
  'dashboard',
  'digital_twin',
  'groundwater',
  'forecasting',
  'rainfall',
  'water_quality',
  'anomalies',
  'risk_priority',
  'confidence',
  'community',
  'investigations',
  'recharge',
  'assistant',
  'analytics',
  'workflows',
  'analyses',
  'documents',
  'monitoring',
  'role_access',
  'admin_audit',
]);

const COMMUNITY_SUBVIEW_TO_TAB: Record<string, CommunityTab> = {
  dashboard: 'near_you',
  'water-near-you': 'near_you',
  community_report: 'report',
  community: 'report',
  community_understand: 'understand',
  community_my_reports: 'my_reports',
  community_alerts: 'alerts',
  community_updates: 'updates',
  community_tips: 'tips',
};

interface RouteState {
  view: string;
  notFound: boolean;
  workspaceHint?: 'simple' | 'expert';
}

function parsePathname(pathname: string): RouteState {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/home') {
    return { view: 'landing', notFound: false };
  }
  if (clean === '/app' || clean === '/dashboard' || clean === '/pro') {
    return { view: 'dashboard', notFound: false, workspaceHint: clean === '/pro' ? 'expert' : undefined };
  }
  if (clean === '/community') {
    return { view: 'dashboard', notFound: false, workspaceHint: 'simple' };
  }
  if (clean.startsWith('/community/')) {
    const slug = clean.slice('/community/'.length);
    if (slug === 'assistant') return { view: 'assistant', notFound: false, workspaceHint: 'simple' };
    const mapped = COMMUNITY_SUBVIEW_TO_TAB[slug] ? slug : COMMUNITY_SUBVIEW_TO_TAB[`community_${slug}`] ? `community_${slug}` : null;
    if (mapped) return { view: mapped, notFound: false, workspaceHint: 'simple' };
    return { view: 'not_found', notFound: true };
  }
  if (clean.startsWith('/pro/') || clean.startsWith('/app/')) {
    const slug = clean.replace(/^\/(pro|app)\//, '');
    if (VALID_PRO_MODULES.has(slug)) {
      return { view: slug, notFound: false, workspaceHint: clean.startsWith('/pro/') ? 'expert' : undefined };
    }
    return { view: 'not_found', notFound: true };
  }
  return { view: 'not_found', notFound: true };
}

function viewToPath(view: string, mode: 'simple' | 'expert'): string {
  if (view === 'landing') return '/';
  if (mode === 'simple') {
    if (view === 'dashboard') return '/community';
    if (view === 'assistant') return '/community/assistant';
    return `/community/${view}`;
  }
  if (view === 'dashboard') return '/pro';
  return `/pro/${view}`;
}

export function AppContent() {
  const { mode, setMode, lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [routeState, setRouteState] = useState<RouteState>(() => parsePathname(window.location.pathname));
  const [selectedLocationId, setSelectedLocationId] = useState<number>(1);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [presentationOpen, setPresentationOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync workspace mode hint from direct URL
  useEffect(() => {
    if (routeState.workspaceHint && routeState.workspaceHint !== mode) {
      setMode(routeState.workspaceHint);
    }
  }, [routeState.workspaceHint]);

  // Listen to Browser Back / Forward
  useEffect(() => {
    const onPopState = () => {
      setRouteState(parsePathname(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Global 'P' shortcut for Guided Overview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'p' || e.key === 'P') {
        setPresentationOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view?: string, locationId?: number) => {
    const target = view || 'dashboard';
    if (locationId) setSelectedLocationId(locationId);

    // Handle special shortcut from landing page
    let nextMode = mode;
    let resolvedView = target;
    if (target === 'community_portal') {
      nextMode = 'simple';
      setMode('simple');
      resolvedView = 'dashboard';
    }

    const nextPath = viewToPath(resolvedView, nextMode);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setRouteState({ view: resolvedView, notFound: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentView = routeState.view;

  const renderConsoleModule = () => {
    if (routeState.notFound) {
      return (
        <div className="rounded-2xl border border-white/10 bg-[#081b13] p-10 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="text-4xl font-serif text-[#d9c27a]">404</div>
          <h2 className="text-xl font-semibold text-[#fcfbf7]">{L('Route Not Found', 'பக்கம் கிடைக்கவில்லை')}</h2>
          <p className="text-xs text-[#a4b2a9]">
            {L('The requested route does not exist in PALAR GUARD AI.', 'நீங்கள் கேட்ட இணைய முகவரி இந்தத் தளத்தில் இல்லை.')}
          </p>
          <button
            type="button"
            onClick={() => handleNavigate('landing')}
            className="px-5 py-2.5 rounded-xl bg-[#10b981] text-[#041a11] text-xs font-semibold"
          >
            {L('Return Home', 'முகப்பிற்குச் செல்')}
          </button>
        </div>
      );
    }

    if (mode === 'simple') {
      if (currentView === 'assistant') return <AIAssistantModule />;
      const tab = COMMUNITY_SUBVIEW_TO_TAB[currentView] || 'near_you';
      return (
        <CommunityDashboard
          initialTab={tab}
          onSwitchToProfessional={() => {
            setMode('expert');
            handleNavigate('dashboard');
          }}
          onSelectLocation={(locId) => setSelectedLocationId(locId)}
        />
      );
    }

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
        return <InvestigationModule onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'recharge':
        return <RechargeModule />;
      case 'assistant':
        return <AIAssistantModule />;
      case 'analytics':
        return <AnalyticsReportingModule />;
      case 'workflows':
      case 'analyses':
        return <AnalysisWorkflowsModule />;
      case 'documents':
        return <DocumentIntelligenceModule onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'monitoring':
        return <MonitoringWatchlistModule onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'role_access':
        return <RoleAccessModule onOpenAuth={() => setAuthModalOpen(true)} />;
      case 'admin_audit':
        return <AdminAuditModule onOpenAuth={() => setAuthModalOpen(true)} />;
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
    <div className="relative isolate min-h-screen overflow-x-clip bg-transparent text-[#fcfbf7] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <ParticleField />
      <CustomCursor />

      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {isLanding ? (
        <main className="flex-1 bg-transparent">
          <LandingPage
            onExplore={handleNavigate}
            onOpenPresentation={() => setPresentationOpen(true)}
          />
          <Footer />
        </main>
      ) : routeState.notFound ? (
        <main className="flex-1 p-4 bg-transparent">{renderConsoleModule()}</main>
      ) : (
        <div className="flex-1 flex overflow-hidden relative dashboard-shell bg-transparent">
          <div className="relative z-10 flex w-full h-full overflow-hidden">
            <AppSidebar
              currentModule={currentView}
              onSelectModule={handleNavigate}
              onBackToLanding={() => handleNavigate('landing')}
              mobileOpen={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
            <main className="flex-1 overflow-y-auto p-3 sm:p-5 bg-transparent dashboard-content">
              <div className="w-full max-w-7xl mx-auto">
                {!isAuthenticated && ['investigations', 'documents', 'monitoring', 'admin_audit'].includes(currentView) && (
                  <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3">
                    <span>{L('Sign in to unlock protected records for this module.', 'இந்தப் பகுதியைப் பயன்படுத்த உள்நுழையவும்.')}</span>
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="px-3 py-1 rounded bg-[#10b981] text-[#041a11] font-semibold"
                    >
                      {L('Sign In', 'உள்நுழைக')}
                    </button>
                  </div>
                )}
                {renderConsoleModule()}
              </div>
            </main>
          </div>
        </div>
      )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (currentView === 'landing') handleNavigate('dashboard');
        }}
      />

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
