import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CampusProvider, useCampus } from './context/CampusContext';
import { AppShell } from './components/AppShell';
import { ToastStack } from './components/ToastStack';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccommodationPage } from './pages/AccommodationPage';
import { RoommateMatchingPage } from './pages/RoommateMatchingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CampusHubPage } from './pages/CampusHubPage';
import { LocalServicesPage } from './pages/LocalServicesPage';
import { AssistantPage } from './pages/AssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

const AppRouter: React.FC = () => {
  const { route } = useCampus();

  if (route === 'landing') {
    return <LandingPage />;
  }
  if (route === 'auth') {
    return <AuthPage />;
  }

  return (
    <AppShell>
      {route === 'dashboard' && <DashboardPage />}
      {route === 'accommodation' && <AccommodationPage />}
      {route === 'roommates' && <RoommateMatchingPage />}
      {route === 'marketplace' && <MarketplacePage />}
      {route === 'campus-hub' && <CampusHubPage />}
      {route === 'local-services' && <LocalServicesPage />}
      {route === 'assistant' && <AssistantPage />}
      {route === 'profile' && <ProfilePage />}
      {route === 'admin' && <AdminPage />}
    </AppShell>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <CampusProvider>
        <AppRouter />
        <ToastStack />
      </CampusProvider>
    </ErrorBoundary>
  );
}
