import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SmartRedirect from './components/SmartRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import {
  CustomersPage, UserChargePage, FuelPage, WeighmentPage,
  BulkCollectionPage, LiveVehiclePage, AttendancePage,
  ComplaintPage, AdminPage, KPIDashboardPage, RolesPage, CitizenPage, UserManagement, ProfilePage, SettingsPage, POIMonitoringPage
} from './components/Pages';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/HomePage';
import { onAuthStateChange } from './services/authService';
import { DataProvider } from './services/DataContext';
import { initializeDefaultRoles, assignDefaultRoleIfNeeded } from './services/userRoleService';
import { storeUserLogin } from './services/userManagementService';
import { ThemeProvider } from './services/ThemeContext';

function App() {
  const [user, setUser] = useState<any>(null);
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
        // Only initialize if we haven't already for this user
        if (initializedUserRef.current !== user.uid) {
          initializedUserRef.current = user.uid;

          try {
            // Store user information in the database
            await storeUserLogin(user);
            // Initialize default roles if they don't exist
            await initializeDefaultRoles();
            // Ensure user has a role assigned
            await assignDefaultRoleIfNeeded(user.uid);
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
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DataProvider userId={user?.uid}>
      <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <HomePage /> : <Navigate to="/dashboard" />} />
          <Route path="/home" element={!user ? <HomePage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />

          {/* Protected Routes wrapped in Layout */}
          {user && (
            <Route element={<Layout userId={user.uid} />}>
              {/* Smart redirect to user's first allowed module */}
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
              <Route path="/settings" element={
                <ProtectedRoute userId={user?.uid || ''} requiredModule="Settings">
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/citizen" element={<CitizenPage currentUser={user} />} />
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}

          {/* Redirect non-authenticated users trying to access protected routes */}
          {!user && <Route path="*" element={<Navigate to="/" replace />} />}
        </Routes>
      </ThemeProvider>
    </DataProvider>
  );
}

export default App;