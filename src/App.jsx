import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
const PageNotFound = lazy(() => import('./lib/PageNotFound'));
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LanguageProvider } from '@/lib/i18n/LanguagesContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here — code-split for bundle optimization
const Home = lazy(() => import('./pages/Home'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TransferPortal = lazy(() => import('./pages/TransferPortal'));
const Pricing = lazy(() => import('./pages/Pricing'));
const FAQ = lazy(() => import('./pages/FAQ'));
const ClubRegistration = lazy(() => import('./pages/ClubRegistration'));
const ScoutingArena = lazy(() => import('./pages/ScoutingArena'));
const OnboardingFlow = lazy(() => import('./pages/OnboardingFlow'));
const CoachWorkspace = lazy(() => import('./pages/CoachWorkspace'));
const CoachRoster = lazy(() => import('./pages/CoachRoster'));
const DirectorDashboard = lazy(() => import('./pages/DirectorDashboard'));
const SignContract = lazy(() => import('./pages/SignContract'));
const GuardianPortal = lazy(() => import('./pages/GuardianPortal'));
const SuperAdminPanel = lazy(() => import('./pages/SuperAdminPanel'));
const ScheduleStudio = lazy(() => import('./pages/ScheduleStudio'));
const BridgeStudio = lazy(() => import('./pages/BridgeStudio'));
const OwnerHub = lazy(() => import('./pages/OwnerHub'));
const LeagueStudio = lazy(() => import('./pages/LeagueStudio'));
const QaEnginePanel = lazy(() => import('./components/admin/QaEnginePanel'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname.split('/')[1] || 'root'}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="overflow-x-hidden"
      >
      <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
      <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/player-profile" element={<PlayerProfile />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/transfer-portal" element={<TransferPortal />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/club-registration" element={<ClubRegistration />} />
      <Route path="/scouting" element={<ScoutingArena />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/coach/*" element={<CoachWorkspace />} />
      <Route path="/coach-roster" element={<CoachRoster />} />
      <Route path="/director/*" element={<DirectorDashboard />} />
      <Route path="/sign-contract" element={<SignContract />} />
      <Route path="/guardian-portal" element={<GuardianPortal />} />
      <Route path="/qa-engine" element={<QaEnginePanel />} />
      <Route path="/super-admin" element={<SuperAdminPanel />} />
      <Route path="/schedule" element={<ScheduleStudio />} />
      <Route path="/bridge" element={<BridgeStudio />} />
      <Route path="/owner" element={<OwnerHub />} />
      <Route path="/league" element={<LeagueStudio />} />
      <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};


function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App