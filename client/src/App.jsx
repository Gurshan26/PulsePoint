import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import DashboardShell from './pages/Dashboard/DashboardShell';
import Overview from './pages/Dashboard/Overview';
import Trends from './pages/Dashboard/Trends';
import Verbatims from './pages/Dashboard/Verbatims';
import Touchpoints from './pages/Dashboard/Touchpoints';
import AIInsights from './pages/Dashboard/AIInsights';
import NotFound from './pages/NotFound/NotFound';
import ErrorBoundary from './components/shared/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Navigate to="/datasets/demo-cx" replace />} />
        <Route path="/datasets/:datasetId" element={<DashboardShell />}>
          <Route index element={<Overview />} />
          <Route path="trends" element={<Trends />} />
          <Route path="verbatims" element={<Verbatims />} />
          <Route path="touchpoints" element={<Touchpoints />} />
          <Route path="insights" element={<AIInsights />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
