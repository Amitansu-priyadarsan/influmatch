import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/themeTokens';

// Auth
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import LandingPage from './pages/LandingPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInfluencers from './pages/admin/AdminInfluencers';
import AdminOwners from './pages/admin/AdminOwners';
import AdminCampaigns from './pages/admin/AdminCampaigns';

// Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOnboarding from './pages/owner/OwnerOnboarding';
import OwnerCampaigns from './pages/owner/OwnerCampaigns';
import OwnerApplicantsOverview from './pages/owner/OwnerApplicantsOverview';
import OwnerApplicants from './pages/owner/OwnerApplicants';
import OwnerApplicantReview from './pages/owner/OwnerApplicantReview';
import PublicInfluencerProfile from './pages/owner/PublicInfluencerProfile';
import OwnerProfile from './pages/owner/OwnerProfile';
import OwnerBrowseInfluencers from './pages/owner/OwnerBrowseInfluencers';
import PitchesList from './pages/shared/PitchesList';
import PitchThread from './pages/shared/PitchThread';

// Influencer
import InfluencerOnboarding from './pages/influencer/InfluencerOnboarding';
import InfluencerDashboard from './pages/influencer/InfluencerDashboard';
import InfluencerBrowseCampaigns from './pages/influencer/InfluencerBrowseCampaigns';
import InfluencerCampaigns from './pages/influencer/InfluencerCampaigns';
import InfluencerProfile from './pages/influencer/InfluencerProfile';
import InfluencerConversation from './pages/influencer/InfluencerConversation';
import InfluencerBrowseBrands from './pages/influencer/InfluencerBrowseBrands';
import PublicBrandProfile from './pages/influencer/PublicBrandProfile';

function BootGate({ children }) {
  const { bootLoading } = useAuth();
  if (bootLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        background: 'var(--bg, #0b0b0c)', color: 'var(--fg-mute, #6b6b68)',
        fontFamily: 'ui-monospace, monospace', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase',
      }}>Loading…</div>
    );
  }
  return children;
}

function ProtectedRoute({ children, allowedRole }) {
  const { user, bootLoading } = useAuth();
  if (bootLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user, bootLoading } = useAuth();
  if (bootLoading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'owner') {
    if (!user.onboarded) return <Navigate to="/owner/onboarding" replace />;
    return <Navigate to="/owner/dashboard" replace />;
  }
  if (user.role === 'influencer') {
    if (!user.onboarded) return <Navigate to="/influencer/onboarding" replace />;
    return <Navigate to="/influencer/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/influencers" element={
        <ProtectedRoute allowedRole="admin"><AdminInfluencers /></ProtectedRoute>
      } />
      <Route path="/admin/owners" element={
        <ProtectedRoute allowedRole="admin"><AdminOwners /></ProtectedRoute>
      } />
      <Route path="/admin/campaigns" element={
        <ProtectedRoute allowedRole="admin"><AdminCampaigns /></ProtectedRoute>
      } />

      {/* Owner Routes */}
      <Route path="/owner/onboarding" element={
        <ProtectedRoute allowedRole="owner"><OwnerOnboarding /></ProtectedRoute>
      } />
      <Route path="/owner/dashboard" element={
        <ProtectedRoute allowedRole="owner"><OwnerDashboard /></ProtectedRoute>
      } />
      <Route path="/owner/campaigns" element={
        <ProtectedRoute allowedRole="owner"><OwnerCampaigns /></ProtectedRoute>
      } />
      <Route path="/owner/applicants" element={
        <ProtectedRoute allowedRole="owner"><OwnerApplicantsOverview /></ProtectedRoute>
      } />
      <Route path="/owner/applicants/:campaignId" element={
        <ProtectedRoute allowedRole="owner"><OwnerApplicants /></ProtectedRoute>
      } />
      <Route path="/owner/applicants/:campaignId/:influencerId" element={
        <ProtectedRoute allowedRole="owner"><OwnerApplicantReview /></ProtectedRoute>
      } />
      <Route path="/owner/influencers/:id" element={
        <ProtectedRoute allowedRole="owner"><PublicInfluencerProfile /></ProtectedRoute>
      } />
      <Route path="/owner/profile" element={
        <ProtectedRoute allowedRole="owner"><OwnerProfile /></ProtectedRoute>
      } />
      <Route path="/owner/browse" element={
        <ProtectedRoute allowedRole="owner"><OwnerBrowseInfluencers /></ProtectedRoute>
      } />
      <Route path="/owner/inbox" element={
        <ProtectedRoute allowedRole="owner"><PitchesList /></ProtectedRoute>
      } />
      <Route path="/owner/inbox/:id" element={
        <ProtectedRoute allowedRole="owner"><PitchThread /></ProtectedRoute>
      } />

      {/* Influencer Routes */}
      <Route path="/influencer/onboarding" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerOnboarding /></ProtectedRoute>
      } />
      <Route path="/influencer/dashboard" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerDashboard /></ProtectedRoute>
      } />
      <Route path="/influencer/browse" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerBrowseCampaigns /></ProtectedRoute>
      } />
      <Route path="/influencer/campaigns" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerCampaigns /></ProtectedRoute>
      } />
      <Route path="/influencer/profile" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerProfile /></ProtectedRoute>
      } />
      <Route path="/influencer/conversation/:campaignId" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerConversation /></ProtectedRoute>
      } />
      <Route path="/influencer/brands" element={
        <ProtectedRoute allowedRole="influencer"><InfluencerBrowseBrands /></ProtectedRoute>
      } />
      <Route path="/influencer/brands/:id" element={
        <ProtectedRoute allowedRole="influencer"><PublicBrandProfile /></ProtectedRoute>
      } />
      <Route path="/influencer/pitches" element={
        <ProtectedRoute allowedRole="influencer"><PitchesList /></ProtectedRoute>
      } />
      <Route path="/influencer/pitches/:id" element={
        <ProtectedRoute allowedRole="influencer"><PitchThread /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <BootGate>
            <AppRoutes />
          </BootGate>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
