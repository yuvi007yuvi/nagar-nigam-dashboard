import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Search, Filter, Download, MoreHorizontal, MapPin,
    CheckCircle, XCircle, Clock, AlertTriangle, User,
    Fuel, Settings, Save, Bell, Inbox,
    Plus, Minus, FileText, ChevronDown, Calendar, ArrowRight,
    Home, Briefcase, Building2, Factory, Layers,
    IndianRupee, Gauge, Droplets, TrendingUp,
    Scale, Truck, WifiOff, PlayCircle, OctagonAlert, PauseCircle, StopCircle,
    CalendarCheck, Edit, MessageSquare, RefreshCw, X
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import KMLLayers from '../shared/KMLLayers';
import MapSettingsOverlay from '../shared/MapSettingsOverlay';
import { getAuth } from 'firebase/auth';
import { useVehicleData } from '../../services/vehicleService';
import vehicleTopDown from '../images/top-down-vehicle.png';
import vehicleStoppedTopDown from '../images/top-down-vehicle-stopped.png';
import vehicleOfflineTopDown from '../images/top-down-vehicle-offline.png';
import truckTopDown from '../images/top-down-truck.png';

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

const getVehicleIcon = (speed: string | number, angle: string | number = 0, name: string = '', isOffline: boolean = false) => {
    const s = typeof speed === 'string' ? parseInt(speed) : speed;
    const a = typeof angle === 'string' ? parseInt(angle) : angle;
    const isMoving = s > 0 && !isOffline;
    const isTruck = name.toLowerCase().includes('compactor') || name.toLowerCase().includes('truck');

    // Choose icon base
    let iconUrl = isMoving ? vehicleTopDown : vehicleStoppedTopDown;
    if (isOffline) iconUrl = vehicleOfflineTopDown;
    if (isTruck && !isOffline) iconUrl = truckTopDown;

    const color = isOffline ? '#ef4444' : (isMoving ? '#22c55e' : '#f59e0b');

    return new L.DivIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            ${isMoving ? `<div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; border: 3px solid ${color}; opacity: 0.5; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="transform: rotate(${a}deg); transition: transform 0.5s ease; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
              <img src="${iconUrl}" style="width: ${isTruck ? '40px' : '34px'}; height: auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
    });
};

// --- Live Vehicle Page ---
const LiveVehiclePage = () => {
    const { vehicles: liveVehicles, loading: liveLoading, error, refetch } = useVehicleData();
    const [registeredVehicles, setRegisteredVehicles] = useState<any[]>([]);
    const [isRegLoading, setIsRegLoading] = useState(true);

    useEffect(() => {
        const fetchRegistered = async () => {
            const { getAllAdminData } = await import('../../services/databaseService');
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
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [generatingReport, setGeneratingReport] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [activeReport, setActiveReport] = useState<string>('');
    const [reportFilters, setReportFilters] = useState({
        zone: 'Zone A',
        ward: 'Ward 01',
        vehicle: 'All',
        vType: 'All',
        startDate: '2026-03-07',
        endDate: '2026-03-07'
    });

    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [showKMLLayers, setShowKMLLayers] = useState(false);

    const [user, setUser] = useState<any>(null);
    useEffect(() => {
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

    const handleGenerateReport = (reportType: string) => {
        setGeneratingReport(reportType);
        setActiveReport(reportType);

        setTimeout(() => {
            setGeneratingReport(null);
            setShowReport(true);

            // Generate high-fidelity dynamic data based on current vehicles
            if (reportType === 'POI Report' || reportType === 'Coverage Overview') {
                const data = vehicles.slice(0, 10).map((v, i) => ({
                    sno: i + 1,
                    zone: 'Zone ' + (i % 3 + 1),
                    ward: 'Ward ' + (i + 1),
                    vehicle: v.name,
                    vtype: 'Primary - Auto Tipper',
                    route: 'R' + (i + 1),
                    total: 300 + i * 10,
                    covered: 250 + i * 10,
                    pending: 50,
                    coverage: Math.round(((250 + i * 10) / (300 + i * 10)) * 100) + '%',
                    date: reportFilters.startDate,
                    inTime: '07:' + (30 + i).toString().padStart(2, '0') + ' AM',
                    outTime: '11:' + (20 + i).toString().padStart(2, '0') + ' AM'
                }));
                setReportData(data);
            } else if (reportType === 'Trip Report') {
                const data = vehicles.slice(0, 8).map((v, i) => ({
                    sno: i + 1,
                    vehicle: v.name.split(' ')[1] || v.name,
                    driver: 'Staff ' + (i + 1),
                    trips: (i % 3) + 1,
                    distance: (20 + i * 5) + '.2 km',
                    start: '07:' + (40 + i).toString().padStart(2, '0') + ' AM',
                    end: '11:' + (50 + i).toString().padStart(2, '0') + ' AM',
                    status: 'Completed',
                    date: reportFilters.startDate
                }));
                setReportData(data);
            } else {
                const data = vehicles.slice(0, 8).map((v, i) => ({
                    sno: i + 1,
                    vehicle: v.name.split(' ')[1] || v.name,
                    zone: 'Zone ' + (i % 3 + 1),
                    distance: (30 + i * 4) + '.5 km',
                    fuel: (5 + i).toFixed(1) + 'L',
                    duration: '4h ' + (10 + i) + 'm',
                    date: reportFilters.startDate
                }));
                setReportData(data);
            }
        }, 1500);
    };

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const total = vehicles.length;

        const detailedVehicles = vehicles.map(v => {
            const lastUpdate = new Date(v.dt_tracker);
            const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
            const isOffline = diffMinutes > 10;
            return { ...v, isOffline };
        });

        const running = detailedVehicles.filter(v => !v.isOffline && parseInt(v.speed) > 0).length;
        const stopped = detailedVehicles.filter(v => !v.isOffline && parseInt(v.speed) === 0).length;
        const offline = detailedVehicles.filter(v => v.isOffline).length;

        return { total, running, stopped, offline, detailedVehicles };
    }, [vehicles]);

    const coverageStats = [
        { label: 'Total', value: stats.total.toString(), icon: Layers, color: 'text-purple-600 bg-purple-100', sub: 'View More' },
        { label: 'Data Not Receiving', value: stats.offline.toString(), icon: WifiOff, color: 'text-orange-500 bg-orange-100', sub: 'View More' },
        { label: 'Running', value: stats.running.toString(), icon: PlayCircle, color: 'text-green-500 bg-green-100', sub: 'View More' },
        { label: 'Over Speeding', value: '0', icon: OctagonAlert, color: 'text-red-500 bg-red-100', sub: 'View More' },
        { label: 'Standing', value: '0', icon: PauseCircle, color: 'text-pink-500 bg-pink-100', sub: 'View More' },
        { label: 'Stopped', value: stats.stopped.toString(), icon: StopCircle, color: 'text-blue-500 bg-blue-100', sub: 'View More' },
    ];

    const CoverageStatCard = ({ label, value, icon: Icon, color, sub }: any) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div>
                    <div className={`p-2.5 rounded-full w-fit mb-3 ${color} bg-opacity-20`}>
                        <Icon size={20} className={color.split(' ')[0]} />
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-0.5">{value}</h3>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                    {sub} <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[8px]">▶</div>
                </span>
            </div>
        </div>
    );

    // Center map on Mathura/Vrindavan or the first vehicle
    const centerPosition: [number, number] = vehicles.length > 0
        ? [parseFloat(vehicles[0].lat), parseFloat(vehicles[0].lng)]
        : [27.4924, 77.6737]; // Mathura coordinates

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
            <div className="flex justify-between items-start">
                <div>
                    <PageHeader title="Live Vehicle" description="Live vehicle tracking and route coverage analysis." />
                    <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mt-1">
                        Welcome {userName}, {getGreeting()}!
                    </p>
                </div>
                <button
                    onClick={refetch}
                    className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                    title="Refresh Data"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {coverageStats.map((stat, i) => (
                    <CoverageStatCard key={i} {...stat} />
                ))}
            </div>

            {/* Reports Section */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-600">Reports</h3>
                <div className="flex flex-wrap gap-3">
                    {['Trip Report', 'POI Report', 'Coverage Overview', 'Distance Report'].map((report) => (
                        <button
                            key={report}
                            onClick={() => handleGenerateReport(report)}
                            disabled={generatingReport !== null}
                            className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-cyan-100 dark:border-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg shadow-sm hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:shadow text-xs font-bold transition-all relative overflow-hidden ${generatingReport === report ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <div className="p-1 bg-cyan-100 dark:bg-cyan-900/50 rounded text-cyan-600 dark:text-cyan-400">
                                {generatingReport === report ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                            </div>
                            {report}
                            {generatingReport === report && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.5 }}
                                    className="absolute bottom-0 left-0 h-0.5 bg-cyan-500 opacity-30"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                {/* Vehicle List Sidebar */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-bold text-gray-800 dark:text-white">Active Vehicles ({vehicles.length})</h3>
                        <div className="mt-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search vehicle..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : vehicles.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">No vehicles found</div>
                        ) : (
                            vehicles.map((vehicle, idx) => (
                                <div
                                    key={`${vehicle.imei}-${idx}`}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedVehicle === vehicle.imei ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700'}`}
                                    onClick={() => setSelectedVehicle(vehicle.imei)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{vehicle.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${parseInt(vehicle.speed) > 0 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                            {parseInt(vehicle.speed) > 0 ? `${vehicle.speed} km/h` : 'Stopped'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                                        <Clock size={10} />
                                        <span>{vehicle.dt_tracker}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map */}
                <div className="lg:col-span-3 relative rounded-xl overflow-hidden border border-gray-300 shadow-inner z-0">
                    <MapContainer
                        center={centerPosition}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution={mapType === 'street' ? '&copy; OpenStreetMap contributors' : '&copy; Google Maps'}
                            url={mapType === 'street'
                                ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                            }
                        />
                        <KMLLayers visible={showKMLLayers} />

                        {stats.detailedVehicles.map((vehicle, idx) => (
                            <Marker
                                key={`${vehicle.imei}-${idx}`}
                                position={[parseFloat(vehicle.lat), parseFloat(vehicle.lng)]}
                                icon={getVehicleIcon(vehicle.speed, vehicle.angle, vehicle.name, vehicle.isOffline)}
                                eventHandlers={{
                                    click: () => setSelectedVehicle(vehicle.imei),
                                }}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-sm">{vehicle.name}</h3>
                                            {vehicle.isOffline && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1 rounded">OFFLINE</span>}
                                        </div>
                                        <div className="text-xs space-y-1">
                                            <p><span className="text-gray-500">Speed:</span> {vehicle.speed} km/h</p>
                                            <p><span className="text-gray-500">Last Update:</span> {vehicle.dt_tracker}</p>
                                            <p><span className="text-gray-500">IMEI:</span> {vehicle.imei}</p>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    <MapSettingsOverlay 
                        mapType={mapType}
                        setMapType={setMapType}
                        showKMLLayers={showKMLLayers}
                        setShowKMLLayers={setShowKMLLayers}
                        position="top-right"
                    />


                </div>
            </div>
            {/* Report Modal - Matches Reference Screenshot */}
            <AnimatePresence>
                {showReport && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-[98%] max-h-[96vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {activeReport} - Todays Date
                                </h2>
                                <button
                                    onClick={() => setShowReport(false)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Stats Summary Row */}
                                <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-bold text-gray-600 dark:text-gray-300 px-2">
                                    <div className="flex gap-6">
                                        <span>Total Rows : <span className="text-gray-900 dark:text-white">166</span></span>
                                        <span>Total Unique Route Count : <span className="text-gray-900 dark:text-white">166</span></span>
                                        <span>Covered Count : <span className="text-emerald-600">76,514</span></span>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 font-black"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> 0-30%</div>
                                        <div className="flex items-center gap-1.5 font-black"><div className="w-3 h-3 bg-gray-400 rounded-sm"></div> 31-60%</div>
                                        <div className="flex items-center gap-1.5 font-black"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> 61-80%</div>
                                        <div className="flex items-center gap-1.5 font-black"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> 81-100%</div>
                                    </div>
                                </div>

                                {/* Filter Controls Row */}
                                <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <select
                                        value={reportFilters.zone}
                                        onChange={(e) => setReportFilters({ ...reportFilters, zone: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-32"
                                    >
                                        <option>Zone A</option>
                                        <option>Zone B</option>
                                        <option>Zone C</option>
                                    </select>
                                    <select
                                        value={reportFilters.ward}
                                        onChange={(e) => setReportFilters({ ...reportFilters, ward: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-32"
                                    >
                                        <option>Ward 01</option>
                                        <option>Ward 02</option>
                                        <option>Ward 03</option>
                                    </select>
                                    <select
                                        value={reportFilters.vehicle}
                                        onChange={(e) => setReportFilters({ ...reportFilters, vehicle: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-40"
                                    >
                                        <option value="All">All Vehicles</option>
                                        {vehicles.map(v => (
                                            <option key={v.id}>{v.registrationNumber}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={reportFilters.vType}
                                        onChange={(e) => setReportFilters({ ...reportFilters, vType: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-48"
                                    >
                                        <option value="All">All types</option>
                                        <option>Auto Tipper</option>
                                        <option>Wheel Barrow</option>
                                    </select>
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500">
                                        <Calendar size={14} />
                                        <input
                                            type="date"
                                            value={reportFilters.startDate}
                                            onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                                            className="bg-transparent outline-none w-24 ml-1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500">
                                        <Calendar size={14} />
                                        <input
                                            type="date"
                                            value={reportFilters.endDate}
                                            onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                                            className="bg-transparent outline-none w-24 ml-1"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleGenerateReport(activeReport)}
                                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white text-xs font-black rounded hover:bg-emerald-600 transition-all ml-auto"
                                    >
                                        <Search size={14} /> Search All
                                    </button>
                                    <button
                                        onClick={() => {
                                            const csvContent = "data:text/csv;charset=utf-8," +
                                                reportData.map(r => Object.values(r).join(",")).join("\n");
                                            const encodedUri = encodeURI(csvContent);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", encodedUri);
                                            link.setAttribute("download", `${activeReport.toLowerCase().replace(/ /g, '_')}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                        }}
                                        className="px-4 py-1.5 bg-gray-900 text-white text-xs font-black rounded hover:bg-black transition-all"
                                    >
                                        Export
                                    </button>
                                </div>

                                {/* Main Data Table */}
                                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <table className="w-full text-left border-collapse min-w-[1200px]">
                                        <thead>
                                            <tr className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest">
                                                {reportData.length > 0 && Object.keys(reportData[0]).map((key) => (
                                                    <th key={key} className="px-4 py-3 border-r border-emerald-400/30">
                                                        {key === 'sno' ? 'S.No' :
                                                            key === 'vtype' ? 'Vehicle Type' :
                                                                key === 'inTime' ? 'In Time' :
                                                                    key === 'outTime' ? 'Out Time' :
                                                                        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-center">Trip Playback</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {reportData.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                    {Object.entries(row).map(([key, value]: [string, any], i) => (
                                                        <td key={i} className={`px-4 py-4 border-r dark:border-gray-700 ${key === 'ward' ? 'text-blue-600 dark:text-blue-400' : ''} ${key === 'coverage' ? 'font-black text-emerald-600' : ''}`}>
                                                            {value}
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-4 text-center">
                                                        <button className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-all">
                                                            <div className="w-3 h-3 flex items-center justify-center">▶</div>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                <button
                                    onClick={() => setShowReport(false)}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white text-xs font-black rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                >
                                    Close Report
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default LiveVehiclePage;
