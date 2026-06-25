import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Map as MapIcon, Filter, Layers, Navigation, 
    Maximize2, Info, ChevronRight, Search, RefreshCw,
    Activity, Globe, Target
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, useMap, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PageHeader from '../shared/PageHeader';
import { getAllAdminData } from '../../services/databaseService';
import { useData } from '../../services/DataContext';

// Fix for Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Route {
    id: string;
    routeId?: string;
    name: string;
    zone: string;
    ward: string;
    data: string;
    featureCount?: number;
    pointCount?: number;
}

const MapBoundsSetter = ({ data, allRoutes }: { data: any, allRoutes: Route[] }) => {
    const map = useMap();
    
    useEffect(() => {
        if (data) {
            try {
                const geoJson = typeof data === 'string' ? JSON.parse(data) : data;
                const bounds = L.geoJSON(geoJson).getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                }
            } catch (e) {
                console.error("Error fitting focused route bounds:", e);
            }
        } else if (allRoutes.length > 0) {
            try {
                const group = L.featureGroup();
                allRoutes.forEach(r => {
                    if (r.data) {
                        const geoJson = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
                        L.geoJSON(geoJson).addTo(group);
                    }
                });
                const bounds = group.getBounds();
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (e) {
                console.error("Error fitting all routes bounds:", e);
            }
        }
    }, [data, map, allRoutes]);
    
    return null;
};

const RouteVisualizationPage = () => {
    const { zones, wards, customers, coverageRecords } = useData();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [focusedRoute, setFocusedRoute] = useState<Route | null>(null);
    const [focusedRouteData, setFocusedRouteData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        const result = await getAllAdminData('ward_routes');
        if (result.success) {
            setRoutes(result.data as Route[]);
        }
        setLoading(false);
    };

    const filteredRoutes = routes.filter(r => {
        const matchesZone = !selectedZone || r.zone === selectedZone;
        const matchesWard = !selectedWard || r.ward === selectedWard;
        const matchesSearch = !searchTerm || 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (r.routeId || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesZone && matchesWard && matchesSearch;
    });

    const handleFocusRoute = (route: Route) => {
        if (focusedRoute?.id === route.id) {
            setFocusedRoute(null);
            setFocusedRouteData(null);
        } else {
            setFocusedRoute(route);
            try {
                setFocusedRouteData(JSON.parse(route.data));
            } catch (e) {
                setFocusedRouteData(null);
            }
        }
    };

    const getRouteColor = (id: string) => {
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Calculate Stats
    const totalRoutes = filteredRoutes.length;
    const totalPoints = filteredRoutes.reduce((acc, r) => acc + (r.pointCount || 0), 0);
    const totalFeatures = filteredRoutes.reduce((acc, r) => acc + (r.featureCount || 0), 0);

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 p-2 overflow-hidden">
            {/* Left: Sidebar Controls */}
            <div className="w-80 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Route Map</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Visual Network Audit</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Routes</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter Zone</label>
                            <select 
                                value={selectedZone}
                                onChange={(e) => {
                                    setSelectedZone(e.target.value);
                                    setSelectedWard('');
                                }}
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">All Zones</option>
                                {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter Ward</label>
                            <select 
                                value={selectedWard}
                                onChange={(e) => setSelectedWard(e.target.value)}
                                disabled={!selectedZone}
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none disabled:opacity-50 cursor-pointer"
                            >
                                <option value="">All Wards</option>
                                {wards.filter(w => w.zoneName === selectedZone).map(w => (
                                    <option key={w.id} value={w.name}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-gray-50 dark:border-gray-700 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Routes</p>
                            <p className="text-xl font-black text-emerald-500">{totalRoutes}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Coverage</p>
                            <p className="text-xl font-black text-blue-500">{(totalPoints/1000).toFixed(1)}k</p>
                        </div>
                    </div>
                </motion.div>

                {/* Routes List */}
                <div className="flex-1 space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Available Routes ({filteredRoutes.length})</p>
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-3xl animate-pulse" />)
                    ) : filteredRoutes.map(route => (
                        <motion.button
                            layout
                            key={route.id}
                            onClick={() => handleFocusRoute(route)}
                            className={`w-full p-5 rounded-3xl border text-left transition-all ${focusedRoute?.id === route.id 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-emerald-500/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-xl ${focusedRoute?.id === route.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-900 text-emerald-500'}`}>
                                    <Navigation size={16} />
                                </div>
                                {route.routeId && (
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${focusedRoute?.id === route.id ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {route.routeId}
                                    </span>
                                )}
                            </div>
                            <h4 className="font-black uppercase tracking-tight text-sm truncate">{route.name}</h4>
                            <div className="flex items-center gap-2 mt-1 opacity-60">
                                <span className="text-[9px] font-bold uppercase">{route.ward}</span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Right: Large Map View */}
            <div className="flex-1 relative h-full rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 bg-gray-50">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
                        <RefreshCw size={48} className="animate-spin text-emerald-500 mb-4" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Generating Network Map...</p>
                    </div>
                ) : (
                    <MapContainer 
                        center={[27.4924, 77.6737]} 
                        zoom={13} 
                        className="w-full h-full z-0"
                        maxZoom={22}
                    >
                        <TileLayer
                            attribution='&copy; Google Maps'
                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            maxZoom={22}
                            maxNativeZoom={20}
                        />
                        
                        {/* Background Routes */}
                        {!focusedRoute && filteredRoutes.map(r => r.data && (
                            <GeoJSON 
                                key={r.id}
                                data={JSON.parse(r.data)}
                                style={{ 
                                    color: getRouteColor(r.id), 
                                    weight: 3, 
                                    opacity: 0.6
                                }}
                                eventHandlers={{
                                    click: () => handleFocusRoute(r)
                                }}
                            >
                                <LeafletPopup route={r} />
                            </GeoJSON>
                        ))}

                        {/* Focused Route */}
                        {focusedRouteData && (
                            <GeoJSON 
                                key={`focus-${focusedRoute?.id}`}
                                data={focusedRouteData}
                                style={{ color: '#10b981', weight: 8, opacity: 1 }}
                            />
                        )}

                        {/* Customer Markers for Focused Route */}
                        {focusedRoute && customers.filter(c => c.routeId === focusedRoute.routeId && c.lat && c.lng).map((customer, idx) => {
                            const isCovered = coverageRecords.some((r: any) => r.customerId === (customer.customerId || customer.id));
                            const markerColor = isCovered ? '#10b981' : '#ef4444'; // Green if covered, Red if pending
                            
                            return (
                            <Marker 
                                key={customer.id || idx} 
                                position={[parseFloat(customer.lat), parseFloat(customer.lng)]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px ${markerColor}80;"></div>`,
                                    iconSize: [12, 12],
                                    iconAnchor: [6, 6]
                                })}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[150px]">
                                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Customer POI</div>
                                        <div className="text-xs font-black text-gray-900 uppercase mb-0.5">{customer.name}</div>
                                        <div className="text-[9px] font-bold text-gray-400 mb-2">{customer.customerId}</div>
                                        
                                        <div className="space-y-1 pt-2 border-t border-gray-100">
                                            <div className="flex justify-between text-[9px]">
                                                <span className="text-gray-400 font-bold uppercase">Type:</span>
                                                <span className="font-black text-gray-700 uppercase">{customer.propertyType}</span>
                                            </div>
                                            <div className="flex justify-between text-[9px]">
                                                <span className="text-gray-400 font-bold uppercase">Ward:</span>
                                                <span className="font-black text-gray-700 uppercase">{customer.ward}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )})}

                        <MapBoundsSetter data={focusedRouteData} allRoutes={filteredRoutes} />
                    </MapContainer>
                )}

                {/* Floating Map Controls */}
                <div className="absolute top-8 left-8 flex flex-col gap-3 z-[1000]">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/20 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Network Active</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            {filteredRoutes.length} Routes Visible
                        </span>
                    </div>
                </div>

                {focusedRoute && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6"
                    >
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-emerald-500/20 flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                                <Activity size={32} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">{focusedRoute.routeId || 'N/A'}</span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{focusedRoute.ward}</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{focusedRoute.name}</h3>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Target size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{focusedRoute.featureCount || 0} Paths</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Globe size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{focusedRoute.pointCount || 0} Points</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {setFocusedRoute(null); setFocusedRouteData(null);}}
                                className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-2xl hover:text-red-500 transition-colors"
                            >
                                <Maximize2 size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const LeafletPopup = ({ route }: { route: Route }) => {
    return (
        <Popup className="custom-popup">
            <div className="p-2">
                <h4 className="font-black text-sm uppercase mb-1">{route.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{route.routeId} • {route.ward}</p>
            </div>
        </Popup>
    );
};

export default RouteVisualizationPage;
