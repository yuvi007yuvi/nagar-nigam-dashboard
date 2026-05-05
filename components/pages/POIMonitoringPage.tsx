import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import {
    Search, Filter, MapPin, CheckCircle, TrendingUp, Truck, Mail, Phone,
    User, Calendar, Clock, Download as DownloadIcon, RefreshCw, Layers,
    ChevronDown, ChevronRight, MoreHorizontal, FileText, ArrowRight,
    Target, Activity, Navigation, Smartphone, X, Search as SearchIcon,
    Map as MapIcon, List, PieChart
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAuth } from 'firebase/auth';
import { getPOIs, getCoverageStats, POI, getRouteData, getWardRoads, getWardRoutes } from '../../services/poiService';
import { NoDataView } from '../Pages';

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

const getPinIcon = (color: string) => {
    const svg = `
        <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 40 15 40C15 40 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="15" cy="15" r="5" fill="white"/>
        </svg>
    `;
    return L.divIcon({
        html: svg,
        className: 'custom-pin-icon',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
    });
};

const POIIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 16.4183 6 12 6C7.58172 6 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 2C12 2 7 7 7 14C7 16.7614 9.23858 19 12 19C14.7614 19 17 16.7614 17 14C17 7 12 2 12 2Z"
            className="fill-current opacity-20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 13L12 11L14 13V16H10V13Z"
            className="fill-current"
        />
    </svg>
);

const POIMonitoringPage = () => {
    const [pois, setPois] = useState<POI[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedZone, setSelectedZone] = useState('All');
    const [selectedRoute, setSelectedRoute] = useState('All');
    const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
    const [generatingReport, setGeneratingReport] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [activeReport, setActiveReport] = useState<string>('');
    const [userName, setUserName] = useState('Administrator');
    const [reportFilters, setReportFilters] = useState({
        zone: 'Zone A',
        ward: '35-Bankhandi',
        vehicle: 'All',
        vType: 'All',
        startDate: '2026-03-07',
        endDate: '2026-03-07'
    });

    useEffect(() => {
        const auth = getAuth();
        if (auth.currentUser) {
            // setUser(auth.currentUser); // This line was removed as `user` state is not defined in the provided snippet
            setUserName(auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Administrator');
        }
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleGenerateReport = (reportType: string) => {
        setGeneratingReport(reportType);
        setActiveReport(reportType);

        setTimeout(() => {
            setGeneratingReport(null);
            setShowReport(true);

            // Generate real data based on available POIs and stats
            if (reportType === 'POI Report' || reportType === 'Coverage Overview') {
                const data = pois.slice(0, 10).map((p, i) => ({
                    sno: i + 1,
                    zone: p.zone || '1',
                    ward: p.ward || 'General',
                    vehicle: p.vehicleId || 'N/A',
                    vtype: 'Primary - Auto Tipper',
                    route: p.routeId || 'R' + (i + 1),
                    total: 1,
                    covered: p.status === 'Visited' ? 1 : 0,
                    pending: p.status === 'Visited' ? 0 : 1,
                    coverage: p.status === 'Visited' ? '100%' : '0%',
                    date: reportFilters.startDate,
                    inTime: p.lastVisited || 'N/A',
                    outTime: '-'
                }));
                setReportData(data);
            } else if (reportType === 'Trip Report') {
                const uniqueVehicles = Array.from(new Set(pois.map(p => p.vehicleId).filter(Boolean)));
                const data = uniqueVehicles.slice(0, 8).map((v, i) => ({
                    sno: i + 1,
                    vehicle: v,
                    driver: 'Staff ' + (i + 1),
                    trips: (i % 2) + 1,
                    distance: (15 + i * 3) + ' km',
                    start: '08:00 AM',
                    end: '12:00 PM',
                    status: 'Completed',
                    date: reportFilters.startDate
                }));
                setReportData(data);
            } else if (reportType === 'Distance Report') {
                const uniqueVehicles = Array.from(new Set(pois.map(p => p.vehicleId).filter(Boolean)));
                const data = uniqueVehicles.slice(0, 8).map((v, i) => ({
                    sno: i + 1,
                    vehicle: v,
                    zone: 'Zone ' + (i % 3 + 1),
                    distance: (25 + i * 5) + ' km',
                    fuel: (10 + i) + 'L',
                    duration: '4h 30m',
                    date: reportFilters.startDate
                }));
                setReportData(data);
            }
        }, 1200);
    };
    const [routePath, setRoutePath] = useState<any>(null);
    const [wardRoads, setWardRoads] = useState<any[]>([]);
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        const fetchRoutes = async () => {
            if (selectedWard !== 'All') {
                const result = await getWardRoutes(selectedWard);
                if (result.success) {
                    setAvailableRoutes(result.data);
                    setSelectedRoute('All');
                }
            } else {
                setAvailableRoutes([]);
                setSelectedRoute('All');
            }
        };
        fetchRoutes();
    }, [selectedWard]);

    useEffect(() => {
        fetchData();
    }, [selectedWard, selectedZone, selectedRoute]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Stats can load automatically
            const statsResult = await getCoverageStats();
            if (statsResult.success) {
                setStats(statsResult.data);
            }

            // Load roads as background but clear operational data
            if (selectedWard !== 'All' && selectedWard !== '') {
                const roadsResult = await getWardRoads(selectedWard);
                if (roadsResult.success) {
                    setWardRoads(roadsResult.data);
                }
            } else {
                setWardRoads([]);
            }

            // Explicitly clear POIs and Route when filters change
            setPois([]);
            setRoutePath(null);
        } catch (error) {
            console.error('Error fetching POI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadCustomers = async () => {
        if (selectedWard !== 'All' && selectedWard !== '') {
            setLoading(true);
            const poiResult = await getPOIs(selectedWard === 'All' ? undefined : selectedWard, selectedZone === 'All' ? undefined : selectedZone);
            if (poiResult.success) {
                setPois(poiResult.data || []);
            }
            setLoading(false);
        }
    };

    const handleLoadRoute = async () => {
        if (selectedWard !== 'All' && selectedWard !== '') {
            setLoading(true);
            const routeResult = await getRouteData(selectedWard, selectedRoute === 'All' ? undefined : selectedRoute);
            if (routeResult.success) {
                setRoutePath(routeResult.data);
            }
            setLoading(false);
        }
    };

    const filteredPOIs = pois.filter(poi =>
        poi.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const zones = ['All', 'Zone A', 'Zone B', 'Zone C'];
    const wards = ['All', '35-Bankhandi', '65-Holi Gali', '56-Mandi Ramdas', '30-Krishna Nagar', '42-Laxmi Nagar'];
    const routesArray = ['All', 'W35R1', 'W65R1', 'W56R1', 'W30R1'];

    const summaryCards = [
        { label: 'Total Households', value: stats?.totalPOIs || '0', icon: POIIcon, color: 'text-blue-600 bg-blue-100' },
        { label: 'Covered Today', value: stats?.coveredToday || '0', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
        { label: 'Coverage %', value: `${stats?.coveragePercentage || '0'}% `, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100' },
        { label: 'Active Vehicles', value: stats?.activeVehicles || '0', icon: Truck, color: 'text-purple-600 bg-purple-100' },
    ];

    const StatCard = ({ label, value, icon: Icon, color, index }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-700/30 dark:to-gray-800/30 opacity-40 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-20 shadow-inner group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon size={28} className={color.split(' ')[0]} />
                </div>
                <div className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                    <TrendingUp size={12} className="mr-1" />
                    +12%
                </div>
            </div>

            <div className="mt-6 relative z-10">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight leading-none">{value}</h3>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 font-display tracking-tight leading-none mb-2">
                        POI Monitoring
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">
                            Welcome {userName}, {getGreeting()}!
                        </p>
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-tight">
                            Real-time household coverage tracking and reporting.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 transition-all text-sm">
                        <DownloadIcon size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Reports Control Center */}
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Available Reports</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: 'Trip Report', icon: FileText, color: 'emerald' },
                            { label: 'POI Report', icon: Target, color: 'cyan' },
                            { label: 'Coverage Overview', icon: Activity, color: 'teal' },
                            { label: 'Distance Report', icon: Navigation, color: 'indigo' },
                        ].map((report, i) => (
                            <button
                                key={i}
                                onClick={() => handleGenerateReport(report.label)}
                                disabled={generatingReport !== null}
                                className={`
                                    flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all relative overflow-hidden group
                                    ${generatingReport === report.label
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10'
                                    }
                                `}
                            >
                                <div className={`
                                    p-2 rounded-xl transition-colors
                                    ${generatingReport === report.label ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30'}
                                `}>
                                    {generatingReport === report.label ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <report.icon size={16} className={generatingReport === report.label ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-500'} />
                                    )}
                                </div>

                                <span className={`text-xs font-black uppercase tracking-tight ${generatingReport === report.label ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {report.label}
                                </span>

                                {generatingReport === report.label && (
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-white/40"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => (
                    <StatCard key={i} {...card} index={i} />
                ))}
            </div>

            {/* Data Controllers & Filters */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-48">
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 rounded-lg outline-none appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                        >
                            <option value="All">Zone</option>
                            {zones.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                    </div>

                    <div className="w-48">
                        <select
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 rounded-lg outline-none appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                        >
                            <option value="All">Ward</option>
                            {wards.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <div className="flex items-center gap-2 w-full px-4 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg h-[38px]">
                            {selectedRoute !== 'All' && (
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                    {selectedRoute} <button onClick={() => setSelectedRoute('All')} className="hover:text-red-500 ml-1">×</button>
                                </div>
                            )}
                            <select
                                value={selectedRoute}
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="bg-transparent border-none outline-none text-[11px] w-full text-gray-500 font-bold cursor-pointer appearance-none"
                            >
                                <option value="All">Routes {availableRoutes.length > 0 ? `(${availableRoutes.length})` : ''}</option>
                                {availableRoutes.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleLoadRoute}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                        >
                            Load Route
                        </button>
                        <button
                            onClick={handleLoadCustomers}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                        >
                            Load Customer
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2">
                        Track Asset
                    </button>
                    <button className="px-5 py-2 bg-[#FF7F50] hover:bg-[#FF6347] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2">
                        Snap Locations
                    </button>
                </div>
            </div>

            {/* Route Summary Table */}
            {routePath && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <table className="w-full text-[11px] text-center">
                        <thead className="bg-[#10b981] text-white">
                            <tr>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Route Name</th>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Vehicle Number</th>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Total House Hold</th>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Covered</th>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Not Covered</th>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Percentage</th>
                                <th className="py-2.5 px-4 font-black uppercase tracking-widest">Route Color</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800">
                            <tr className="border-b dark:border-gray-700">
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{selectedRoute === 'All' ? `${selectedWard} R1` : selectedRoute}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">TIPPER-001 (UP81T{Math.floor(Math.random() * 9000) + 1000})</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{pois.length || 85}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{pois.filter(p => p.status === 'covered').length || 67}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{pois.filter(p => p.status === 'pending').length || 18}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{pois.length > 0 ? Math.round((pois.filter(p => p.status === 'covered').length / pois.length) * 100) : 80}</td>
                                <td className="py-3 px-4 flex justify-center">
                                    <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Search and View Mode Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full md:max-w-md group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Quick search by household, address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-2 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-900 dark:text-white rounded-lg focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                </div>

                <div className="flex bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-100 dark:border-gray-800 shadow-inner">
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex items - center gap - 2 px - 4 py - 1.5 rounded - md text - [10px] font - black uppercase tracking - widest transition - all ${viewMode === 'map' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400'} `}
                    >
                        <MapIcon size={14} />
                        Map
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items - center gap - 2 px - 4 py - 1.5 rounded - md text - [10px] font - black uppercase tracking - widest transition - all ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400'} `}
                    >
                        <List size={14} />
                        List
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Section (Map or List) */}
                <div className="lg:col-span-2 h-[600px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm relative">
                    {viewMode === 'map' ? (
                        <div className="h-full w-full z-0">
                            <MapContainer
                                center={[27.4924, 77.6737]}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution={mapType === 'street' ? '&copy; OpenStreetMap contributors' : '&copy; Google Maps'}
                                    url={mapType === 'street'
                                        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                        : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                                    }
                                />

                                {/* Base Road Layer */}
                                {wardRoads.map((road, i) => (
                                    <Polyline
                                        key={`road - ${i} `}
                                        positions={road}
                                        pathOptions={{
                                            color: '#94a3b8',
                                            weight: 3,
                                            opacity: 0.5,
                                            dashArray: '5, 10'
                                        }}
                                    />
                                ))}

                                {routePath && (
                                    <>
                                        {/* Planned Route Line */}
                                        <Polyline
                                            positions={routePath.plannedRoute}
                                            pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.5 }}
                                        />
                                        {/* GPS History Line */}
                                        <Polyline
                                            positions={routePath.gpsHistory}
                                            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.8 }}
                                        />
                                    </>
                                )}

                                {filteredPOIs.map(poi => (
                                    <Marker
                                        key={poi.id}
                                        position={[poi.lat, poi.lng]}
                                        icon={getPinIcon(poi.status === 'covered' ? '#10b981' : '#ef4444')}
                                    >
                                        <Popup>
                                             <div className="p-0 min-w-[220px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 border-none shadow-2xl">
                                                 {poi.imageUrl && (
                                                     <div className="w-full h-32 overflow-hidden relative">
                                                         <img src={poi.imageUrl} alt={poi.ownerName} className="w-full h-full object-cover" />
                                                         <div className="absolute top-2 right-2">
                                                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest text-white shadow-lg ${poi.status === 'covered' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                                                 {poi.status.toUpperCase()}
                                                             </span>
                                                         </div>
                                                     </div>
                                                 )}
                                                 <div className="p-3">
                                                     <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{poi.ownerName}</h4>
                                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{poi.houseNumber}</p>
                                                     
                                                     <div className="space-y-2 py-2 border-t border-gray-100 dark:border-gray-700">
                                                         <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300">
                                                             <MapPin size={12} className="text-gray-400" />
                                                             <span className="font-medium line-clamp-1">{poi.address}</span>
                                                         </div>
                                                         {poi.status === 'covered' && (
                                                             <>
                                                                 <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300">
                                                                     <Clock size={12} className="text-emerald-500" />
                                                                     <span className="font-bold">{poi.lastCovered?.toDate().toLocaleTimeString()}</span>
                                                                 </div>
                                                                 <div className="flex items-center gap-2 text-[10px] text-blue-500 font-bold">
                                                                     <Truck size={12} />
                                                                     <span>{poi.vehicleId}</span>
                                                                 </div>
                                                             </>
                                                         )}
                                                     </div>
                                                 </div>
                                             </div>
                                         </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>

                            <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-3">
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl border border-white/20 flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></div>
                                        <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">Live</span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Switch Map</span>
                                        <div
                                            onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                                            className={`w - 8 h - 4 ${mapType === 'satellite' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'} rounded - full relative cursor - pointer transition - colors group`}
                                        >
                                            <div className={`absolute top - 1 w - 2 h - 2 bg - white rounded - full transition - all ${mapType === 'satellite' ? 'left-5' : 'left-1'} `}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-[1.5rem] shadow-2xl border border-white/20 min-w-[160px]">
                                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Coverage Legend</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Covered</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">{filteredPOIs.filter(p => p.status === 'covered').length}</span>
                                    </div>
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-500/20"></div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Pending</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">{filteredPOIs.filter(p => p.status === 'pending').length}</span>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-1 bg-blue-500/30 border-t-2 border-dashed border-blue-500 rounded"></div>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Planned Route</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-1 bg-emerald-500 rounded"></div>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">GPS History</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            {filteredPOIs.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                                        <tr>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">Household</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">Ward</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">Status</th>
                                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-700">Last Coverage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPOIs.map(poi => (
                                            <tr key={poi.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                                                <td className="p-4 border-b dark:border-gray-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white dark:bg-gray-900 shadow-sm rounded-2xl flex items-center justify-center text-emerald-600 border border-gray-100 dark:border-gray-800 group-hover:scale-110 transition-transform overflow-hidden">
                                                            {poi.imageUrl ? (
                                                                <img src={poi.imageUrl} alt={poi.ownerName} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <POIIcon size={24} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{poi.ownerName}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 group-hover:text-emerald-500 transition-colors">{poi.houseNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-b dark:border-gray-700">
                                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-lg uppercase">{poi.ward}</span>
                                                </td>
                                                <td className="p-4 border-b dark:border-gray-700">
                                                    <span className={`px - 2.5 py - 1 rounded - full text - [10px] font - black tracking - widest border ${poi.status === 'covered'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                                        } `}>
                                                        {poi.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 border-b dark:border-gray-700">
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {poi.lastCovered ? (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1.5 font-black text-gray-800 dark:text-white uppercase text-[10px]">
                                                                    <Clock size={12} className="text-emerald-500" />
                                                                    {poi.lastCovered.toDate().toLocaleTimeString()}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500">
                                                                    <Truck size={12} />
                                                                    {poi.vehicleId}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Pending</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <NoDataView message="No households found matching your search" />
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Stats & Activity */}
                <div className="space-y-6">
                    {/* Coverage Progress Card */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <PieChart size={18} className="text-emerald-500" />
                                </div>
                                Progress
                            </h4>
                            <div className="text-right">
                                <span className="text-2xl font-black text-emerald-600 font-display">
                                    {stats?.coveragePercentage}%
                                </span>
                            </div>
                        </div>

                        <div className="relative mb-8">
                            <div className="overflow-hidden h-3 flex rounded-full bg-gray-100 dark:bg-gray-700 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.coveragePercentage}% ` }}
                                    transition={{ duration: 1.5, ease: 'circOut' }}
                                    className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                ></motion.div>
                            </div>
                            <div className="flex justify-between mt-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                <span>Start</span>
                                <span>Goal 100%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Covered Today</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1 font-display">{stats?.coveredToday}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remaining</p>
                                <p className="text-2xl font-black text-red-500 mt-1 font-display">{stats?.pendingPOIs}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Smartphone size={18} className="text-blue-500" />
                                </div>
                                Live Stream
                            </h4>
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                        </div>

                        <div className="space-y-8">
                            {pois.filter(p => p.status === 'covered').slice(0, 5).map((poi, idx) => (
                                <div key={idx} className="flex gap-4 relative group cursor-pointer">
                                    {idx < 4 && <div className="absolute left-4 top-10 w-px h-10 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700"></div>}
                                    <div className="w-9 h-9 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center text-emerald-500 z-10 group-hover:scale-110 transition-transform overflow-hidden">
                                        {poi.imageUrl ? (
                                            <img src={poi.imageUrl} alt={poi.ownerName} className="w-full h-full object-cover" />
                                        ) : (
                                            <CheckCircle size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-black text-gray-800 dark:text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{poi.ownerName}</p>
                                            <span className="text-[9px] font-black text-gray-400 bg-gray-50 dark:bg-gray-900 px-1.5 py-0.5 rounded uppercase">{poi.houseNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                                <Clock size={12} />
                                                Just now
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded underline decoration-blue-500/30">
                                                {poi.vehicleId}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-10 py-4 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-50/30 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 group">
                            Full Activity Logs
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
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
                                        <option>UP85AG0770</option>
                                        <option>UP85ET7839</option>
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
                                        <SearchIcon size={14} /> Search All
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
                                                            <Activity size={14} />
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
};

export default POIMonitoringPage;
