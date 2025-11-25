import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
    CalendarCheck, Edit, MessageSquare, RefreshCw
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useVehicleData } from '../../services/vehicleService';

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

// Custom Truck Icon
const truckIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
  </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// --- Live Vehicle Page ---
const LiveVehiclePage = () => {
    const { vehicles, loading, error, refetch } = useVehicleData();
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

    // Calculate stats
    const stats = useMemo(() => {
        const total = vehicles.length;
        const running = vehicles.filter(v => parseInt(v.speed) > 0).length;
        const stopped = vehicles.filter(v => parseInt(v.speed) === 0).length;
        // Assuming 'Data Not Receiving' or other statuses would require more logic or data fields
        // For now, we'll just use basic speed-based logic
        return { total, running, stopped };
    }, [vehicles]);

    const coverageStats = [
        { label: 'Total', value: stats.total.toString(), icon: Layers, color: 'text-purple-600 bg-purple-100', sub: 'View More' },
        { label: 'Data Not Receiving', value: '0', icon: WifiOff, color: 'text-orange-500 bg-orange-100', sub: 'View More' },
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
                <PageHeader title="Live Vehicle" description="Live vehicle tracking and route coverage analysis." />
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
                        <button key={report} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-cyan-100 dark:border-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg shadow-sm hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:shadow text-xs font-bold transition-all">
                            <div className="p-1 bg-cyan-100 dark:bg-cyan-900/50 rounded text-cyan-600 dark:text-cyan-400"><FileText size={14} /></div>
                            {report}
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
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {vehicles.map((vehicle, idx) => (
                            <Marker
                                key={`${vehicle.imei}-${idx}`}
                                position={[parseFloat(vehicle.lat), parseFloat(vehicle.lng)]}
                                icon={truckIcon}
                                eventHandlers={{
                                    click: () => setSelectedVehicle(vehicle.imei),
                                }}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm mb-1">{vehicle.name}</h3>
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

                    {/* Map Controls Overlay */}
                    <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Live Tracking</span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default LiveVehiclePage;
