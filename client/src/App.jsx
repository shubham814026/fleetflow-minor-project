import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import AppLayout from './layouts/AppLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const VehicleRegistryPage = lazy(() => import('./pages/VehicleRegistryPage'));
const VehicleCreatePage = lazy(() => import('./pages/VehicleCreatePage'));
const TripDispatcherPage = lazy(() => import('./pages/TripDispatcherPage'));
const TripCreatePage = lazy(() => import('./pages/TripCreatePage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const MaintenanceCreatePage = lazy(() => import('./pages/MaintenanceCreatePage'));
const ExpenseFuelPage = lazy(() => import('./pages/ExpenseFuelPage'));
const FuelCreatePage = lazy(() => import('./pages/FuelCreatePage'));
const DriverManagementPage = lazy(() => import('./pages/DriverManagementPage'));
const DriverCreatePage = lazy(() => import('./pages/DriverCreatePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const App = () => {
  return (
    <Suspense fallback={<div className="p-6"><Loader text="Loading view" /></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehicleRegistryPage />} />
            <Route path="/trips" element={<TripDispatcherPage />} />
            <Route path="/trips/create" element={<TripCreatePage />} />
            <Route path="/drivers" element={<DriverManagementPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer']} />}>
          <Route element={<AppLayout />}>
            <Route path="/vehicles/create" element={<VehicleCreatePage />} />
            <Route path="/drivers/create" element={<DriverCreatePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Safety Officer', 'Financial Analyst']} />}>
          <Route element={<AppLayout />}>
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/maintenance/create" element={<MaintenanceCreatePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']} />}>
          <Route element={<AppLayout />}>
            <Route path="/expenses" element={<ExpenseFuelPage />} />
            <Route path="/expenses/create" element={<FuelCreatePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Fleet Manager', 'Financial Analyst']} />}>
          <Route element={<AppLayout />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
