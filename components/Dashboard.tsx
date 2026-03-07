import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import {
  Wallet, Fuel, Truck,
  CalendarCheck, AlertTriangle, Sparkles,
  Recycle, IndianRupee, BarChart3, Activity, Map as MapIcon,
  LayoutDashboard, Clock
} from 'lucide-react';
import {
  ColoredStatCard, UserChargeWidget, VehicleStatusWidget,
  ComplaintChart, BulkCollectionChart, POIWidget, CustomerChart
} from './Widgets';
import { useVehicleData } from '../services/vehicleService';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Truck Icon for map - Enhanced visibility for satellite view
const truckIcon = new L.DivIcon({
  className: '',  // Empty to remove default Leaflet styling
  html: `<div style="background-color: #0f766e; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 0 0 2px #0f766e, 0 4px 12px rgba(0,0,0,0.5);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});


interface DashboardProps {
  onGenerateInsight?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerateInsight }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSatelliteView, setIsSatelliteView] = React.useState(false);

  // Check if user was redirected due to access denial
  const searchParams = new URLSearchParams(location.search);
  const isAccessDenied = searchParams.get('access') === 'denied';

  React.useEffect(() => {
    if (isAccessDenied) {
      // Clear the query param after showing the message
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAccessDenied, navigate]);

  // Fetch vehicle data
  const { vehicles, loading } = useVehicleData();

  // Calculate vehicle statistics
  const vehicleStats = useMemo(() => {
    const total = vehicles.length;
    const running = vehicles.filter(v => parseInt(v.speed) > 0).length;
    const stopped = vehicles.filter(v => parseInt(v.speed) === 0).length;

    return {
      total,
      running,
      stopped,
      widgetData: [
        { label: 'Total', value: total, color: 'bg-purple-100 text-purple-700' },
        { label: 'Running', value: running, color: 'bg-green-100 text-green-700' },
        { label: 'Stopped', value: stopped, color: 'bg-gray-100 text-gray-700' }
      ]
    };
  }, [vehicles]);


  // Stagger container for children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // Demo data for widgets
  const userChargeData = [
    { label: 'Residential', value: '₹1,42,500', color: 'bg-purple-500' },
    { label: 'Commercial', value: '₹85,300', color: 'bg-blue-500' },
    { label: 'Institutional', value: '₹18,000', color: 'bg-indigo-500' }
  ];

  const complaintData = [
    { name: 'Resolved', value: 38, color: '#10b981' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Escalated', value: 4, color: '#ef4444' }
  ];

  const bulkCollectionData = [
    { name: 'Hotels', value: 12, color: '#8b5cf6' },
    { name: 'Markets', value: 8, color: '#3b82f6' },
    { name: 'Schools', value: 5, color: '#ec4899' }
  ];

  const customerDistribution = [
    { name: 'Residential', value: 45, color: '#f97316' },
    { name: 'Commercial', value: 30, color: '#fbbf24' },
    { name: 'Industrial', value: 15, color: '#6366f1' },
    { name: 'Institutional', value: 10, color: '#ec4899' }
  ];

  return (
    <motion.div
      className="space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Access Denied Alert */}
      {isAccessDenied && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm"
        >
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-red-800">Access Denied</h3>
              <p className="text-red-700 mt-1 text-sm">
                You don't have permission to access the page you were trying to visit. Please contact your administrator if you need access.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Actions */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800 border border-indigo-100 dark:border-indigo-800 shadow-xl shadow-indigo-500/5 rounded-[1.5rem] relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <LayoutDashboard size={28} className="text-indigo-600 dark:text-indigo-400 relative z-10" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter font-display leading-tight">
                Dashboard Overview
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/50 rounded-xl shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">System Live</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 p-1">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-tight">
                Welcome back, Administrator
              </p>
              <div className="flex items-center gap-2 text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg border border-indigo-100/50 dark:border-indigo-800/50">
                <Clock size={12} />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {onGenerateInsight && (
            <motion.button
              onClick={onGenerateInsight}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all text-sm font-bold border border-white/10"
            >
              <Sparkles size={18} className="animate-pulse" />
              Generate AI Insights
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Section: Key Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Activity size={20} className="text-blue-500" />
          Key Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <ColoredStatCard
            title="Waste Collected"
            value="42.5 Ton"
            icon={Recycle}
            color="bg-gradient-to-br from-blue-500 to-blue-700"
            delay={0.1}
          />
          <ColoredStatCard
            title="Active Vehicles"
            value={vehicleStats.total}
            icon={Truck}
            color="bg-gradient-to-br from-teal-500 to-emerald-600"
            delay={0.2}
            onClick={() => navigate('/live-vehicle')}
          />
          <ColoredStatCard
            title="Complaints"
            value="14"
            icon={AlertTriangle}
            color="bg-gradient-to-br from-rose-500 to-pink-600"
            delay={0.3}
          />
          <ColoredStatCard
            title="Revenue"
            value="₹2,45,800"
            icon={IndianRupee}
            color="bg-gradient-to-br from-violet-500 to-purple-700"
            delay={0.4}
          />
        </div>
      </div>

      {/* Section: Operational Widgets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Activity size={20} className="text-emerald-500" />
          Operational Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-[300px]">
            <VehicleStatusWidget data={vehicleStats.widgetData} />
          </div>
          <div className="h-[300px]">
            <UserChargeWidget data={userChargeData} />
          </div>
          <div className="h-[300px]">
            <ComplaintChart data={complaintData} />
          </div>
          <div className="h-[300px]">
            <BulkCollectionChart data={bulkCollectionData} />
          </div>
          <div className="h-[300px]">
            <POIWidget total={1250} visited={845} />
          </div>
          <div className="h-[300px]">
            <CustomerChart data={customerDistribution} />
          </div>
        </div>
      </div>

      {/* Section: Secondary Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <BarChart3 size={20} className="text-orange-500" />
          Additional Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColoredStatCard
            title="Fuel Usage"
            value="840 Ltr"
            icon={Fuel}
            color="bg-gradient-to-br from-orange-400 to-red-500"
            delay={0.5}
          />
          <ColoredStatCard
            title="Attendance"
            value="156/160"
            icon={CalendarCheck}
            color="bg-gradient-to-br from-indigo-500 to-violet-700"
            delay={0.6}
          />
        </div>
      </div>

      {/* Section: Live Ward Monitoring (Map at Bottom) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <MapIcon size={20} className="text-emerald-500" />
          Live Ward Monitoring
        </h3>
        <motion.div
          variants={itemVariants}
          className="glass p-1 rounded-2xl shadow-2xl border border-white/40 overflow-hidden"
        >
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-t-xl border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 font-display text-lg">
              <span className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-sm"></span>
              Live Vehicle Tracking
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    checked={isSatelliteView}
                    onChange={(e) => setIsSatelliteView(e.target.checked)}
                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-emerald-500 right-0"
                  />
                  <span className="toggle-label block overflow-hidden h-4 rounded-full bg-emerald-500"></span>
                </div>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {isSatelliteView ? 'Satellite View' : 'Street View'}
                </span>
              </label>
            </div>
          </div>

          <div className="relative w-full h-[400px] sm:h-[600px] rounded-b-xl overflow-hidden z-0">
            <MapContainer
              center={vehicles.length > 0 ? [parseFloat(vehicles[0].lat), parseFloat(vehicles[0].lng)] : [27.4924, 77.6737]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              {isSatelliteView ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              {vehicles.map((vehicle, idx) => (
                <Marker
                  key={`${vehicle.imei}-${idx}`}
                  position={[parseFloat(vehicle.lat), parseFloat(vehicle.lng)]}
                  icon={truckIcon}
                >
                  <Popup className="glass-popup">
                    <div className="p-2 min-w-[150px]">
                      <h3 className="font-bold text-sm mb-2 text-emerald-800 border-b border-emerald-100 pb-1">{vehicle.name}</h3>
                      <div className="text-xs space-y-1.5">
                        <p className="flex justify-between"><span className="text-gray-500">Speed:</span> <span className="font-bold">{vehicle.speed} km/h</span></p>
                        <p className="flex justify-between"><span className="text-gray-500">Last Update:</span> <span className="font-medium text-gray-700">{vehicle.dt_tracker}</span></p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Live Tracking Indicator */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-white/50 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Tracking</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;