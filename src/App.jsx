import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import ContentCalendarPage from './pages/ContentCalendarPage';
import BudgetPage from './pages/BudgetPage';
import TasksPage from './pages/TasksPage';
import SettingsPage from './pages/SettingsPage';
import AudiencesPage from './pages/AudiencesPage';
import PositioningPage from './pages/PositioningPage';
import ContentOverviewPage from './pages/ContentOverviewPage';
import CustomerJourneyPage from './pages/CustomerJourneyPage';
import AsidasFunnelPage from './pages/AsidasFunnelPage';
import TouchpointsPage from './pages/TouchpointsPage';
import ManualPage from './pages/ManualPage';

function AppRoutes() {
  const { currentUser, login, logout, can } = useAuth();

  if (!currentUser) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <Layout onLogout={logout}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/audiences" element={<AudiencesPage />} />
          <Route path="/journeys" element={<CustomerJourneyPage />} />
          <Route path="/asidas" element={<AsidasFunnelPage />} />
          <Route path="/touchpoints" element={<TouchpointsPage />} />
          <Route path="/content" element={<ContentCalendarPage />} />
          <Route path="/content-overview" element={<ContentOverviewPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/positioning" element={<PositioningPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/manual" element={<ManualPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

import { TaskProvider } from './context/TaskContext';
import { ContentProvider } from './context/ContentContext';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <TaskProvider>
          <AppRoutes />
        </TaskProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
