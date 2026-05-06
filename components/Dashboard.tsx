import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import {
  Wallet, Fuel, Truck,
  CalendarCheck, AlertTriangle, Sparkles,
  Recycle, IndianRupee, BarChart3, Activity, Map as MapIcon,
  LayoutDashboard, Clock, UserPlus, FileText
} from 'lucide-react';
import {
  ColoredStatCard, UserChargeWidget, VehicleStatusWidget,
  ComplaintChart, BulkCollectionChart, POIWidget, CustomerChart,
  WeatherWidget, QuickActionCard, TopWardsWidget
} from './Widgets';
import { useVehicleData } from '../services/vehicleService';
import { useData } from '../services/DataContext';
import { getAuth } from 'firebase/auth';
import vehicle3D from './images/3d-vehicle.png';
import vehicleStopped3D from './images/3d-vehicle-stopped.png';
import vehicleOffline3D from './images/3d-vehicle-offline.png';
import bin3D from './images/3d-bin.png';

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

const getVehicleIcon = (speed: string | number) => {
  const s = typeof speed === 'string' ? parseInt(speed) : speed;
  const isMoving = s > 0;
  const color = isMoving ? '#10b981' : '#f59e0b'; // Emerald for moving, Amber for stopped

  return new L.DivIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position: relative;">
        <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
        ${isMoving ? `<div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${color}; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};


interface DashboardProps {
  onGenerateInsight?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerateInsight }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSatelliteView, setIsSatelliteView] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setUser(auth.currentUser);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Administrator';
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
  const { vehicles: liveVehicles, loading: liveLoading } = useVehicleData();
  const [registeredVehicles, setRegisteredVehicles] = React.useState<any[]>([]);
  const [isRegLoading, setIsRegLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRegistered = async () => {
      const { getAllAdminData } = await import('../services/databaseService');
      const result = await getAllAdminData('vehicles');
      if (result.success) {
        setRegisteredVehicles(result.data);
      }
      setIsRegLoading(false);
    };
    fetchRegistered();
  }, []);

  const vehicles = useMemo(() => {
    const registeredImeis = new Set(registeredVehicles.map(v => v.imei));
    return liveVehicles.filter(v => registeredImeis.has(v.imei));
  }, [liveVehicles, registeredVehicles]);

  const loading = liveLoading || isRegLoading;

  // Calculate vehicle statistics
  const vehicleStats = useMemo(() => {
    const total = registeredVehicles.length;
    const active = vehicles.length;
    const running = vehicles.filter(v => parseInt(v.speed) > 0).length;
    const stopped = vehicles.filter(v => parseInt(v.speed) === 0).length;
    const offline = total - active;

    return {
      total,
      active,
      running,
      stopped,
      offline,
      widgetData: [
        { label: 'Total', value: total, color: 'bg-purple-100 text-purple-700' },
        { label: 'Running', value: running, color: 'bg-green-100 text-green-700' },
        { label: 'Stopped', value: stopped, color: 'bg-amber-100 text-amber-700' },
        { label: 'Offline', value: offline, color: 'bg-gray-100 text-gray-700' }
      ]
    };
  }, [vehicles, registeredVehicles]);


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

  // Fetch all data from context
  const { 
    userCharges, 
    complaints, 
    bulkCollections, 
    attendanceRecords,
    customers,
    coverageRecords,
    fuelEntries,
    loading: dataLoading 
  } = useData();

  // Calculate metrics from context data
  const userChargeSummary = useMemo(() => {
    const residential = userCharges.filter(c => c.type === 'Residential').reduce((sum, c) => sum + (c.amount || 0), 0);
    const commercial = userCharges.filter(c => c.type === 'Commercial').reduce((sum, c) => sum + (c.amount || 0), 0);
    const institutional = userCharges.filter(c => c.type === 'Institutional').reduce((sum, c) => sum + (c.amount || 0), 0);
    
    return [
      { label: 'Residential', value: `₹${residential.toLocaleString()}`, color: 'bg-purple-500' },
      { label: 'Commercial', value: `₹${commercial.toLocaleString()}`, color: 'bg-blue-500' },
      { label: 'Institutional', value: `₹${institutional.toLocaleString()}`, color: 'bg-indigo-500' }
    ];
  }, [userCharges]);

  const complaintSummary = useMemo(() => {
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const escalated = complaints.filter(c => c.status === 'Escalated').length;

    return [
      { name: 'Resolved', value: resolved, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#f59e0b' },
      { name: 'Escalated', value: escalated, color: '#ef4444' }
    ];
  }, [complaints]);

  const customerSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach(c => {
      counts[c.propertyType] = (counts[c.propertyType] || 0) + 1;
    });

    const colors: Record<string, string> = {
      'Residential': '#f97316',
      'Commercial': '#fbbf24',
      'Industrial': '#6366f1',
      'Institutional': '#ec4899'
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#94a3b8'
    }));
  }, [customers]);

  const totalRevenue = useMemo(() => {
    const total = userCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
    return `₹${total.toLocaleString()}`;
  }, [userCharges]);

  const attendanceSummary = useMemo(() => {
    const present = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'P').length;
    const total = attendanceRecords.length || 0;
    return total > 0 ? `${present}/${total}` : '0/0';
  }, [attendanceRecords]);

  const fuelSummary = useMemo(() => {
    const total = fuelEntries.reduce((sum, entry) => sum + (parseFloat(entry.quantity) || 0), 0);
    return `${total.toLocaleString()} Ltr`;
  }, [fuelEntries]);
  
  const bulkCollectionData = useMemo(() => {
    // Process bulk collections for the widget
    const counts: Record<string, number> = {};
    bulkCollections.forEach(r => {
      counts[r.site || 'Other'] = (counts[r.site || 'Other'] || 0) + 1;
    });

    const segments = Object.entries(counts).slice(0, 4).map(([name, value], idx) => ({
      name,
      value,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][idx % 4]
    }));

    // For bin status, show the most recent fill levels
    const binStatus = bulkCollections.slice(0, 4).map((r, idx) => ({
      location: r.site || 'Unknown Site',
      fill: parseInt(r.fill) || 0,
      color: parseInt(r.fill) > 80 ? 'bg-rose-500' : 'bg-emerald-500'
    }));

    return { segments, binStatus };
  }, [bulkCollections]);

  const poiSummary = useMemo(() => {
    const total = coverageRecords.length || 0;
    const visited = coverageRecords.filter(r => r.status === 'Visited' || r.visited).length;
    return { total, visited };
  }, [coverageRecords]);

  // Calculate ward performance for TopWardsWidget
  const wardPerformance = useMemo(() => {
    if (!customers.length) return [];
    
    // 1. Group customers by ward to get denominator
    const wardPOIs: Record<string, number> = {};
    customers.forEach(c => {
      if (c.ward) {
        wardPOIs[c.ward] = (wardPOIs[c.ward] || 0) + 1;
      }
    });

    // 2. Count unique customer visits per ward today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const wardScans: Record<string, Set<string>> = {};
    coverageRecords.forEach(record => {
      try {
        const recordDate = record.createdAt?.toDate ? record.createdAt.toDate() : new Date(record.createdAt);
        if (recordDate >= today) {
          // Find ward for this customer - try both ID and custom ID fields
          const customer = customers.find(c => c.id === record.customerId || c.customerId === record.customerId);
          if (customer && customer.ward) {
            if (!wardScans[customer.ward]) wardScans[customer.ward] = new Set();
            wardScans[customer.ward].add(record.customerId);
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    // 3. Calculate score per ward
    const performance = Object.keys(wardPOIs).map(wardName => {
      const total = wardPOIs[wardName];
      const scanned = wardScans[wardName]?.size || 0;
      const score = Math.min(100, Math.round((scanned / total) * 100));
      
      return {
        name: wardName,
        score: score,
        trend: score > 80 ? 'up' : 'neutral'
      };
    });

    // 4. Return top 3
    return performance
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [customers, coverageRecords]);

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



      {/* Section: Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} className="text-indigo-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickActionCard 
            title="Add Customer" 
            icon={UserPlus} 
            color="from-blue-500 to-indigo-600" 
            onClick={() => navigate('/customers')}
          />
          <QuickActionCard 
            title="Log Fuel" 
            icon={Fuel} 
            color="from-orange-500 to-red-600" 
            onClick={() => navigate('/fuel')}
          />
          <QuickActionCard 
            title="Record Attendance" 
            icon={CalendarCheck} 
            color="from-emerald-500 to-teal-600" 
            onClick={() => navigate('/attendance')}
          />
          <QuickActionCard 
            title="New Complaint" 
            icon={AlertTriangle} 
            color="from-rose-500 to-pink-600" 
            onClick={() => navigate('/complaint')}
          />
          <QuickActionCard 
            title="Bulk Entry" 
            icon={Truck} 
            color="from-amber-500 to-yellow-600" 
            onClick={() => navigate('/bulk-collection')}
          />
          <QuickActionCard 
            title="Export Report" 
            icon={FileText} 
            color="from-gray-700 to-gray-900" 
          />
        </div>
      </div>

      {/* Section: Key Metrics */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} className="text-blue-500" />
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ColoredStatCard
            title="Waste Collected"
            value="42.5 Ton"
            image={bin3D}
            icon={Recycle}
            color="bg-gradient-to-br from-blue-500 to-blue-700"
            delay={0.1}
          />
          <ColoredStatCard
            title="Total Vehicles"
            value={vehicleStats.total}
            image={vehicle3D}
            icon={Truck}
            color="bg-gradient-to-br from-teal-500 to-emerald-600"
            delay={0.2}
            onClick={() => navigate('/live-vehicle')}
          />
          <ColoredStatCard
            title="Complaints"
            value={complaints.length}
            icon={AlertTriangle}
            color="bg-gradient-to-br from-rose-500 to-pink-600"
            delay={0.3}
          />
          <ColoredStatCard
            title="Revenue"
            value={totalRevenue}
            icon={IndianRupee}
            color="bg-gradient-to-br from-violet-500 to-purple-700"
            delay={0.4}
          />
        </div>
      </div>

      {/* Section: Operational Widgets */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          Operational Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-[240px]">
            <VehicleStatusWidget data={vehicleStats.widgetData} />
          </div>
          <div className="h-[240px]">
            <UserChargeWidget data={userChargeSummary} />
          </div>
          <div className="h-[240px]">
            <ComplaintChart data={complaintSummary} />
          </div>
          <div className="h-[240px]">
            <BulkCollectionChart data={bulkCollectionData} />
          </div>
          <div className="h-[240px]">
            <POIWidget total={poiSummary.total} visited={poiSummary.visited} />
          </div>
          <div className="h-[240px]">
            <CustomerChart data={customerSummary} />
          </div>
          <div className="h-[240px] lg:col-span-1">
            <TopWardsWidget data={wardPerformance} />
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
            value={fuelSummary}
            icon={Fuel}
            color="bg-gradient-to-br from-orange-400 to-red-500"
            delay={0.5}
          />
          <ColoredStatCard
            title="Attendance"
            value={attendanceSummary}
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
                  icon={getVehicleIcon(vehicle.speed)}
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