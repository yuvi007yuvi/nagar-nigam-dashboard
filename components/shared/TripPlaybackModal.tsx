import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity, X, Layers, Clock, Truck, MapPin } from 'lucide-react';
import KMLLayers from './KMLLayers';

// Custom Pin Icon Helper
const getPinIcon = (color: string) => {
    const svg = `
        <svg width="12" height="18" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}"/>
            <circle cx="12" cy="12" r="4.5" fill="white"/>
        </svg>
    `;
    return L.divIcon({
        html: svg,
        className: 'custom-pin-icon',
        iconSize: [12, 18],
        iconAnchor: [6, 18],
        popupAnchor: [0, -18]
    });
};

// Map Bounds Setter
const MapBoundsSetter = ({ routePath, pois }: { routePath: any, pois: any[] }) => {
    const map = useMap();
    useEffect(() => {
        if (routePath) {
            try {
                const geoJsonLayer = L.geoJSON(routePath);
                if (geoJsonLayer.getLayers().length > 0) {
                    map.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50], animate: true, duration: 1.5 });
                }
            } catch (e) {
                console.error("Error fitting route bounds:", e);
                if (routePath.plannedRoute && routePath.plannedRoute.length > 0) {
                    const bounds = L.latLngBounds(routePath.plannedRoute);
                    map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
                }
            }
        } else if (pois && pois.length > 0) {
            try {
                const points = pois.map(p => [p.lat, p.lng] as [number, number]);
                const bounds = L.latLngBounds(points);
                map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
            } catch (e) {
                console.error("Error fitting POI bounds:", e);
            }
        }
    }, [routePath, pois, map]);
    return null;
};

interface TripPlaybackModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        route?: string;
        routeName?: string;
        date?: string;
        vehicle?: any;
        vehicleName?: string;
        pois?: any[];
        routePath?: any;
        historyData?: any[];
        ward?: string;
    } | null;
}

export const TripPlaybackModal: React.FC<TripPlaybackModalProps> = ({ isOpen, onClose, data }) => {
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [showBoundary, setShowBoundary] = useState(true);
    const [showPOI, setShowPOI] = useState(true);
    const [showHistory, setShowHistory] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    if (!isOpen || !data) return null;

    const pois = data.pois || [];
    const historyData = data.historyData || [];
    const routeName = data.routeName || data.route || 'Route';
    const routeId = data.route || 'Unassigned';
    const vehicleName = data.vehicle?.plateNumber || data.vehicle?.vehicleNumber || data.vehicle?.name || data.vehicleName || 'Unassigned';
    const coveredCount = pois.filter((p: any) => p.status === 'covered').length;
    const missedCount = pois.filter((p: any) => p.status !== 'covered').length;
    const coveragePercentage = pois.length > 0 ? Math.round((coveredCount / pois.length) * 100) : 0;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700"
                >
                    {/* Modal Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 gap-4">
                        <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2 shrink-0">
                            <Activity size={20} className="text-emerald-500" />
                            Trip Playback: {routeName}
                        </h2>
                        
                        <div className="flex-1 flex justify-center">
                            <table className="text-[11px] font-bold border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden text-center border-collapse bg-white dark:bg-gray-900 shadow-sm tracking-wider text-black dark:text-white">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 text-[9px] font-black text-black dark:text-white">
                                        <th className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">Route</th>
                                        <th className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">Date</th>
                                        <th className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">Vehicle</th>
                                        <th className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">Households</th>
                                        <th className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">Covered</th>
                                        <th className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">Missed</th>
                                        <th className="px-3 py-1.5">Coverage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-black dark:text-white">
                                        <td className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">{routeId}</td>
                                        <td className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">{data.date || ''}</td>
                                        <td className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700">{vehicleName}</td>
                                        <td className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700 font-black">{pois.length}</td>
                                        <td className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700 text-emerald-600 font-black">{coveredCount}</td>
                                        <td className="px-3 py-1.5 border-r border-gray-100 dark:border-gray-700 text-red-500 font-black">{missedCount}</td>
                                        <td className="px-3 py-1.5 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 font-black">{coveragePercentage}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Modal Map Body */}
                    <div className="flex-1 w-full bg-gray-100 dark:bg-gray-900 relative">
                        {/* Floating Map Controls */}
                        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                title="Map Layers"
                            >
                                <Layers size={18} />
                            </button>

                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 min-w-[160px]"
                                    >
                                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                            <span>Satellite view</span>
                                            <button
                                                onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                                                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${mapType === 'satellite' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${mapType === 'satellite' ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showBoundary}
                                                onChange={(e) => setShowBoundary(e.target.checked)}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            Ward Boundary
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showPOI}
                                                onChange={(e) => setShowPOI(e.target.checked)}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            POI Locations
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showHistory}
                                                onChange={(e) => setShowHistory(e.target.checked)}
                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            History Track
                                        </label>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <MapContainer
                            center={[27.4924, 77.6737]}
                            zoom={14}
                            style={{ height: '100%', width: '100%', zIndex: 0 }}
                            maxZoom={22}
                        >
                            {mapType === 'street' ? (
                                <TileLayer
                                    attribution='&copy; Google Maps'
                                    url='https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                                    maxZoom={22}
                                    maxNativeZoom={20}
                                />
                            ) : (
                                <TileLayer
                                    attribution='&copy; Google Maps'
                                    url='https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                                    maxZoom={22}
                                    maxNativeZoom={20}
                                />
                            )}

                            <MapBoundsSetter routePath={data.routePath} pois={pois} />

                            {/* Ward Boundary KML Layer */}
                            <KMLLayers visible={showBoundary} wardName={data.ward} />

                            {/* Planned Route Line (Always Visible) */}
                            {data.routePath && (
                                <>
                                    {(data.routePath.type === 'FeatureCollection' || data.routePath.type === 'Feature') ? (
                                        <GeoJSON
                                            data={data.routePath}
                                            style={{ color: '#3b82f6', weight: 4, opacity: 0.8 }}
                                        />
                                    ) : (
                                        <>
                                            {data.routePath.plannedRoute && data.routePath.plannedRoute.length > 0 && (
                                                <Polyline
                                                    positions={data.routePath.plannedRoute}
                                                    pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }}
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {/* History GPS Layer */}
                            {showHistory && historyData.length > 0 && (
                                <Polyline
                                    positions={historyData.map((p: any) => [parseFloat(p.lat), parseFloat(p.lng)] as [number, number])}
                                    pathOptions={{
                                        color: '#ef4444',
                                        weight: 6,
                                        opacity: 1.0
                                    }}
                                />
                            )}

                            {/* Vehicle Current Position Icon */}
                            {showHistory && historyData.length > 0 && (
                                <Marker
                                    position={[
                                        parseFloat(historyData[historyData.length - 1].lat),
                                        parseFloat(historyData[historyData.length - 1].lng)
                                    ]}
                                    icon={L.divIcon({
                                        className: 'bg-transparent border-0',
                                        html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
                                        iconSize: [14, 14],
                                        iconAnchor: [7, 7]
                                    })}
                                >
                                    <Popup className="text-xs font-bold">End of Trip</Popup>
                                </Marker>
                            )}

                            {/* POI Locations Markers */}
                            {showPOI && pois.map((poi: any, idx: number) => (
                                <Marker
                                    key={poi.id || `poi-${idx}`}
                                    position={[poi.lat, poi.lng]}
                                    icon={getPinIcon(poi.status === 'covered' ? '#10b981' : '#ef4444')}
                                >
                                    <Popup>
                                        <div className="p-0 min-w-[220px] overflow-hidden rounded-xl bg-white dark:bg-gray-800 border-none shadow-2xl text-left">
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
                                                                <span className="font-bold">{poi.lastCovered?.toDate ? poi.lastCovered.toDate().toLocaleTimeString() : new Date(poi.lastCovered).toLocaleTimeString()}</span>
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
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TripPlaybackModal;
