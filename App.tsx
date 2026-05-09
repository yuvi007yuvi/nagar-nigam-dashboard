import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SmartRedirect from './components/SmartRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import { onAuthStateChange } from './services/authService';
import { DataProvider } from './services/DataContext';
import { initializeDefaultRoles, assignDefaultRoleIfNeeded, getUserRole, ROLES } from './services/userRoleService';
import { storeUserLogin } from './services/userManagementService';
import { ThemeProvider } from './services/ThemeContext';
import PageLoader from './components/shared/PageLoader';
import { GPSSyncService } from './services/GPSSyncService';


// Lazy load page components
const CustomersPage = lazy(() => import('./components/pages/CustomersPage'));
const UserChargePage = lazy(() => import('./components/pages/UserChargePage'));
const FuelPage = lazy(() => import('./components/pages/FuelPage'));
const WeighmentPage = lazy(() => import('./components/pages/WeighmentPage'));
const BulkCollectionPage = lazy(() => import('./components/pages/BulkCollectionPage'));
const LiveVehiclePage = lazy(() => import('./components/pages/LiveVehiclePage'));
const AttendancePage = lazy(() => import('./components/pages/AttendancePage'));
const ComplaintPage = lazy(() => import('./components/pages/ComplaintPage'));
const AdminPage = lazy(() => import('./components/pages/AdminPage'));
const KPIDashboardPage = lazy(() => import('./components/pages/KPIDashboardPage'));
const RolesPage = lazy(() => import('./components/pages/RolesPage'));
const CitizenPage = lazy(() => import('./components/pages/CitizenPage'));
const UserManagement = lazy(() => import('./components/pages/UserManagement'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const POIMonitoringPage = lazy(() => import('./components/pages/POIMonitoringPage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const HomePage = lazy(() => import('./components/HomePage'));
const MapLayersPage = lazy(() => import('./components/pages/MapLayersPage'));
const VehicleHistoryPage = lazy(() => import('./components/pages/VehicleHistoryPage'));
const VehicleMasterPage = lazy(() => import('./components/pages/VehicleMasterPage'));
const RoleAssignmentPage = lazy(() => import('./components/pages/RoleAssignmentPage'));
const QRDataPage = lazy(() => import('./components/pages/QRDataPage'));
const ZoneWardMasterPage = lazy(() => import('./components/pages/ZoneWardMasterPage'));
const RouteMasterPage = lazy(() => import('./components/pages/RouteMasterPage'));
const PropertyTypeMasterPage = lazy(() => import('./components/pages/PropertyTypeMasterPage'));
const PropertyWiseCheckingPage = lazy(() => import('./components/pages/PropertyWiseCheckingPage'));
const DataMigrationPage = lazy(() => import('./components/pages/DataMigrationPage'));
const BulkCustomerUploadPage = lazy(() => import('./components/pages/BulkCustomerUploadPage'));
const RouteAssignmentPage = lazy(() => import('./components/pages/RouteAssignmentPage'));
const KPIThresholdsPage = lazy(() => import('./components/pages/KPIThresholdsPage'));
const KPIDataEntryPage = lazy(() => import('./components/pages/KPIDataEntryPage'));
const ParkingDumpMasterPage = lazy(() => import('./components/pages/ParkingDumpMasterPage'));
const RouteVisualizationPage = lazy(() => import('./components/pages/RouteVisualizationPage'));
const RouteAuditReportPage = lazy(() => import('./components/pages/RouteAuditReportPage'));
const CoverageReRunPage = lazy(() => import('./components/pages/CoverageReRunPage'));
const BulkVehicleUploadPage = lazy(() => import('./components/pages/BulkVehicleUploadPage'));
const MaintenanceDashboard = lazy(() => import('./components/pages/maintenance/MaintenanceDashboard'));


function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const initializedUserRef = React.useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        initializedUserRef.current = null;
      } else {
        if (initializedUserRef.current !== user.uid) {
          initializedUserRef.current = user.uid;
          try {
            await storeUserLogin(user);
            await initializeDefaultRoles();
            await assignDefaultRoleIfNeeded(user.uid);
            
            // Fetch role to determine if admin
            const roleRes = await getUserRole(user.uid);
            if (roleRes.success) {
              setIsAdmin(roleRes.data.role === ROLES.ADMIN);
            }
          } catch (error) {
            console.error('Error initializing user:', error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DataProvider userId={user?.uid} isAdmin={isAdmin}>
      <ThemeProvider>
        {user && <GPSSyncService />}
        <Suspense fallback={<PageLoader />}>

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!user ? <HomePage /> : <Navigate to="/dashboard" />} />
            <Route path="/home" element={!user ? <HomePage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes wrapped in Layout */}
            {user && (
              <Route element={<Layout userId={user.uid} />}>
                <Route path="/redirect" element={<SmartRedirect userId={user.uid} />} />

                <Route path="/dashboard" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/customers" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Customers">
                    <CustomersPage />
                  </ProtectedRoute>
                } />
                <Route path="/user-charge" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="User Charge">
                    <UserChargePage />
                  </ProtectedRoute>
                } />
                <Route path="/fuel" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Fuel">
                    <FuelPage />
                  </ProtectedRoute>
                } />
                <Route path="/weighment" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Weighment">
                    <WeighmentPage />
                  </ProtectedRoute>
                } />
                <Route path="/bulk-collection" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Bulk Collection">
                    <BulkCollectionPage />
                  </ProtectedRoute>
                } />
                <Route path="/live-vehicle" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Live Vehicle">
                    <LiveVehiclePage />
                  </ProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Attendance">
                    <AttendancePage />
                  </ProtectedRoute>
                } />
                <Route path="/complaint" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Complaint">
                    <ComplaintPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <AdminPage currentUser={user} />
                  </ProtectedRoute>
                } />
                <Route path="/kpi-dashboard" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="KPI Dashboard">
                    <KPIDashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/roles" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Roles">
                    <RolesPage />
                  </ProtectedRoute>
                } />
                <Route path="/role-assignments" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <RoleAssignmentPage />
                  </ProtectedRoute>
                } />
                <Route path="/poi-monitoring" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="POI Monitoring">
                    <POIMonitoringPage />
                  </ProtectedRoute>
                } />
                <Route path="/user-management" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Profile">
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/vehicle-history" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Live Vehicle">
                    <VehicleHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/map-layers" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <MapLayersPage />
                  </ProtectedRoute>
                } />
                <Route path="/vehicle-master" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <VehicleMasterPage />
                  </ProtectedRoute>
                } />
                <Route path="/qr-data" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <QRDataPage />
                  </ProtectedRoute>
                } />
                <Route path="/zone-ward-master" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <ZoneWardMasterPage />
                  </ProtectedRoute>
                } />
                <Route path="/route-master" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <RouteMasterPage />
                  </ProtectedRoute>
                } />
                <Route path="/property-type-master" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <PropertyTypeMasterPage />
                  </ProtectedRoute>
                } />
                <Route path="/property-wise-checking" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <PropertyWiseCheckingPage />
                  </ProtectedRoute>
                } />
                <Route path="/migrate-data" element={<DataMigrationPage />} />
                <Route path="/bulk-customer-upload" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <BulkCustomerUploadPage />
                  </ProtectedRoute>
                } />
                <Route path="/route-assignments" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <RouteAssignmentPage />
                  </ProtectedRoute>
                } />
                <Route path="/route-network" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <RouteVisualizationPage />
                  </ProtectedRoute>
                } />
                <Route path="/route-audit-report" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <RouteAuditReportPage />
                  </ProtectedRoute>
                } />
                <Route path="/kpi-thresholds" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <KPIThresholdsPage />
                  </ProtectedRoute>
                } />
                <Route path="/kpi-data-entry" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <KPIDataEntryPage />
                  </ProtectedRoute>
                } />
                <Route path="/parking-dump-master" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <ParkingDumpMasterPage />
                  </ProtectedRoute>
                } />
                <Route path="/coverage-rerun" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <CoverageReRunPage />
                  </ProtectedRoute>
                } />
                <Route path="/bulk-vehicle-upload" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <BulkVehicleUploadPage />
                  </ProtectedRoute>
                } />
                <Route path="/maintenance-erp" element={
                  <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
                    <MaintenanceDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/citizen" element={<CitizenPage currentUser={user} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            )}

            {!user && <Route path="*" element={<Navigate to="/" replace />} />}
          </Routes>
        </Suspense>
      </ThemeProvider>
    </DataProvider>
  );
}

export default App;