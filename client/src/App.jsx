import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import AppLayout from './layouts/AppLayout';
import DriverLayout from './layouts/DriverLayout';

// Landing & Auth Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DriverLoginPage = lazy(() => import('./pages/driver/DriverLoginPage'));

// Admin Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LiveMapPage = lazy(() => import('./pages/LiveMapPage'));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage'));
const VehicleDetailPage = lazy(() => import('./pages/VehicleDetailPage'));
const DriversPage = lazy(() => import('./pages/DriversPage'));
const DriverDetailPage = lazy(() => import('./pages/DriverDetailPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));
const FuelPage = lazy(() => import('./pages/FuelPage'));
const UtilisationPage = lazy(() => import('./pages/UtilisationPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const GeofencingPage = lazy(() => import('./pages/GeofencingPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const SafetyPage = lazy(() => import('./pages/SafetyPage'));
const RoutesPage = lazy(() => import('./pages/RoutesPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const LogbookPage = lazy(() => import('./pages/LogbookPage'));
const CarbonPage = lazy(() => import('./pages/CarbonPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SalaryPage = lazy(() => import('./pages/SalaryPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Driver PWA Pages
const DriverDashboardPage = lazy(() => import('./pages/driver/DriverDashboardPage'));
const DriverTripPage = lazy(() => import('./pages/driver/DriverTripPage'));
const DriverMapPage = lazy(() => import('./pages/driver/DriverMapPage'));
const DriverHistoryPage = lazy(() => import('./pages/driver/DriverHistoryPage'));
const DriverProfilePage = lazy(() => import('./pages/driver/DriverProfilePage'));
const DriverSOSPage = lazy(() => import('./pages/driver/DriverSOSPage'));

const App = () => {
  return (
    <Suspense fallback={<div className="p-8 bg-slate-950 min-h-screen flex items-center justify-center"><Loader text="Initializing SmartFleet AI..." /></div>}>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/driver/login" element={<DriverLoginPage />} />

        {/* Admin / Sub-Admin Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Sub-Admin', 'Accountant/HR']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/live-map" element={<LiveMapPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/:id" element={<DriverDetailPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/utilisation" element={<UtilisationPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/alerts/fraud" element={<AlertsPage />} />
            <Route path="/alerts/fuel" element={<AlertsPage />} />
            <Route path="/alerts/maintenance" element={<AlertsPage />} />
            <Route path="/forecast" element={<ForecastPage />} />
            <Route path="/geofencing" element={<GeofencingPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/safety" element={<SafetyPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/logbook" element={<LogbookPage />} />
            <Route path="/carbon" element={<CarbonPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Driver PWA Mobile Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Driver', 'Super Admin', 'Sub-Admin']} />}>
          <Route element={<DriverLayout />}>
            <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
            <Route path="/driver/trip" element={<DriverTripPage />} />
            <Route path="/driver/map" element={<DriverMapPage />} />
            <Route path="/driver/history" element={<DriverHistoryPage />} />
            <Route path="/driver/profile" element={<DriverProfilePage />} />
            <Route path="/driver/sos" element={<DriverSOSPage />} />
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
