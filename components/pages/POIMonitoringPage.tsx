import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import {
    Search, Filter, Download as DownloadIcon, MapPin,
    CheckCircle, Clock, Home, Truck, Layers,
    TrendingUp, Map as MapIcon, Calendar, ArrowRight,
    Search as SearchIcon, RefreshCw, Smartphone, List, PieChart
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getPOIs, getCoverageStats, POI } from '../../services/poiService';

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

const POIMonitoringPage = () => {
    const [pois, setPois] = useState<POI[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWard, setSelectedWard] = useState('All');
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        fetchData();
    }, [selectedWard]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const poiResult = await getPOIs(selectedWard === 'All' ? undefined : selectedWard);
            if (poiResult.success) {
                setPois(poiResult.data || []);
            }

            const statsResult = await getCoverageStats();
            if (statsResult.success) {
                setStats(statsResult.data);
            }
        } catch (error) {
            console.error('Error fetching POI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPOIs = pois.filter(poi =>
        poi.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const wards = ['All', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];

    const summaryCards = [
        { label: 'Total Households', value: stats?.totalPOIs || '0', icon: Home, color: 'text-blue-600 bg-blue-100' },
        { label: 'Covered Today', value: stats?.coveredToday || '0', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
        { label: 'Coverage %', value: `${stats?.coveragePercentage || '0'}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100' },
        { label: 'Active Vehicles', value: stats?.activeVehicles || '0', icon: Truck, color: 'text-purple-600 bg-purple-100' },
    ];

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 opacity-50 rounded-bl-full -mr-4 -mt-4 group-hover:bg-emerald-50 transition-colors"></div>
            <div className={`p-3 rounded-xl w-fit mb-4 ${color} bg-opacity-20 relative z-10`}>
                <Icon size={24} className={color.split(' ')[0]} />
            </div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider relative z-10">{label}</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-1 relative z-10">{value}</h3>
            <div className="mt-4 flex items-center text-xs text-green-600 dark:text-green-400 font-semibold relative z-10">
                <TrendingUp size={14} className="mr-1" />
                <span>+12% from yesterday</span>
            </div>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <PageHeader
                    title="POI Monitoring"
                    description="Real-time household coverage tracking and reporting."
                />
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

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {wards.map(ward => (
                        <button
                            key={ward}
                            onClick={() => setSelectedWard(ward)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedWard === ward
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            {ward}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search households..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                        />
                    </div>
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                        >
                            <MapIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600' : 'text-gray-500'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
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
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {filteredPOIs.map(poi => (
                                    <CircleMarker
                                        key={poi.id}
                                        center={[poi.lat, poi.lng]}
                                        radius={8}
                                        fillColor={poi.status === 'covered' ? '#10b981' : '#ef4444'}
                                        color="#fff"
                                        weight={2}
                                        opacity={1}
                                        fillOpacity={0.8}
                                    >
                                        <Popup>
                                            <div className="p-2 min-w-[200px]">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-gray-800">{poi.ownerName}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${poi.status === 'covered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {poi.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-xs text-gray-600">
                                                    <p><span className="font-semibold">H.No:</span> {poi.houseNumber}</p>
                                                    <p><span className="font-semibold">Address:</span> {poi.address}</p>
                                                    {poi.status === 'covered' && (
                                                        <>
                                                            <p><span className="font-semibold">Time:</span> {poi.lastCovered?.toDate().toLocaleTimeString()}</p>
                                                            <p><span className="font-semibold">Vehicle:</span> {poi.vehicleId}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                            <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20">
                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">Legend</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] text-gray-600 dark:text-gray-400">Covered</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-[10px] text-gray-600 dark:text-gray-400">Pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b dark:border-gray-700">Household</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b dark:border-gray-700">Ward</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b dark:border-gray-700">Status</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b dark:border-gray-700">Last Coverage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPOIs.map(poi => (
                                        <tr key={poi.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="p-4 border-b dark:border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600">
                                                        <Home size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{poi.ownerName}</p>
                                                        <p className="text-xs text-gray-500">{poi.houseNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b dark:border-gray-700">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{poi.ward}</span>
                                            </td>
                                            <td className="p-4 border-b dark:border-gray-700">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${poi.status === 'covered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {poi.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b dark:border-gray-700">
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {poi.lastCovered ? (
                                                        <>
                                                            <div className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                                                                <Clock size={12} />
                                                                {poi.lastCovered.toDate().toLocaleTimeString()}
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Truck size={12} />
                                                                {poi.vehicleId}
                                                            </div>
                                                        </>
                                                    ) : 'Not Covered'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats & Activity */}
                <div className="space-y-6">
                    {/* Coverage Progress Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <PieChart size={18} className="text-emerald-500" />
                            Coverage Progress
                        </h4>
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                                        Progress
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-emerald-600">
                                        {stats?.coveragePercentage}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-emerald-100">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats?.coveragePercentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                                ></motion.div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Covered</p>
                                <p className="text-lg font-bold text-emerald-600">{stats?.coveredToday}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Pending</p>
                                <p className="text-lg font-bold text-red-500">{stats?.pendingPOIs}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Smartphone size={18} className="text-blue-500" />
                            Live Coverage Stream
                        </h4>
                        <div className="space-y-4">
                            {pois.filter(p => p.status === 'covered').slice(0, 5).map((poi, idx) => (
                                <div key={idx} className="flex gap-3 relative">
                                    {idx < 4 && <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-100 dark:bg-gray-700"></div>}
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 z-10">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 dark:text-white">{poi.ownerName} Covered</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                            <Clock size={10} />
                                            Just now · Vehicle {poi.vehicleId}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 text-xs font-bold text-gray-400 hover:text-emerald-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                            View All Activity
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default POIMonitoringPage;
