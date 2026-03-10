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
          <Route path="/content" element={<ContentCalendarPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/positioning" element={<PositioningPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
