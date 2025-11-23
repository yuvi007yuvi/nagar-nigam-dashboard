import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SmartRedirect from './components/SmartRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import {
  CustomersPage, UserChargePage, FuelPage, WeighmentPage,
  BulkCollectionPage, CoverageMonitoringPage, AttendancePage,
  ComplaintPage, AdminPage, KPIDashboardPage, RolesPage, CitizenPage, UserManagement
} from './components/Pages';
import { generateDashboardInsight } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, AlertTriangle } from 'lucide-react';
import LoginPage from './components/auth/LoginPage';
import { onAuthStateChange } from './services/authService';
import { DataProvider } from './services/DataContext';
import { initializeDefaultRoles, assignDefaultRoleIfNeeded } from './services/userRoleService';
import { storeUserLogin } from './services/userManagementService';

function App() {
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [insightData, setInsightData] = useState<{ summary: string, recommendations: string[] } | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
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
        // Only redirect to login if not already there
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      } else {
        // Only initialize if we haven't already for this user
        if (initializedUserRef.current !== user.uid) {
          initializedUserRef.current = user.uid;

          // Store user information in the database
          await storeUserLogin(user);
          // Initialize default roles if they don't exist
          await initializeDefaultRoles();
          // Ensure user has a role assigned
          await assignDefaultRoleIfNeeded(user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGenerateInsight = async () => {
    setShowInsightModal(true);
    if (insightData) return; // Don't regenerate if we have it

    setIsLoadingInsight(true);
    // Construct a text representation of the dashboard state
    const dataContext = `
      System Status: Online but Waiting for Data Streams.
      
      Current Metrics:
      - Customer KYC: 0
      - User Charge Collected: ₹0
      - Active Vehicles: 0
      - Attendance: 0/0
      - Complaints: 0 Open
      - POI Coverage: 0%
      
      Note: The system has just been initialized or reset. No live data is currently being received from field devices.
    `;

    const result = await generateDashboardInsight(dataContext);
    setInsightData(result);
    setIsLoadingInsight(false);
  };

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
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes wrapped in Layout */}
        <Route element={user ? <Layout userId={user.uid} /> : <Navigate to="/login" />}>
          <Route path="/" element={user ? <SmartRedirect userId={user.uid} /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute userId={user?.uid || ''} requiredModule="Dashboard">
              <Dashboard onGenerateInsight={handleGenerateInsight} />
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
          <Route path="/coverage-monitoring" element={
            <ProtectedRoute userId={user?.uid || ''} requiredModule="Coverage Monitoring">
              <CoverageMonitoringPage />
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
          <Route path="/user-management" element={
            <ProtectedRoute userId={user?.uid || ''} requiredModule="Admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/citizen" element={<CitizenPage currentUser={user} />} />
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* AI Insight Modal */}
      <AnimatePresence>
        {showInsightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowInsightModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">AI System Insight</h2>
                      <p className="text-sm text-gray-500">Powered by Gemini AI</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInsightModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {isLoadingInsight ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">Generating insights...</p>
                  </div>
                ) : insightData ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                      <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" size={20} />
                        System Summary
                      </h3>
                      <p className="text-gray-700">{insightData.summary}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 mb-3">Recommended Actions</h3>
                      <ul className="space-y-2">
                        {insightData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                            </div>
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No insights available</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DataProvider>
  );
}

export default App;