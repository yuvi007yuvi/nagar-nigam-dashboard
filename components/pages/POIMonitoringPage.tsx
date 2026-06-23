import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
    Search, Filter, MapPin, CheckCircle, TrendingUp, Truck, Mail, Phone,
    User, Calendar, Clock, Download as DownloadIcon, RefreshCw, Layers,
    ChevronDown, ChevronRight, MoreHorizontal, FileText, ArrowRight,
    Target, Activity, Navigation, Smartphone, X, Search as SearchIcon,
    Map as MapIcon, List, PieChart, AlertCircle
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import KMLLayers from '../shared/KMLLayers';
import AssetLayers from '../shared/AssetLayers';
import MapSettingsOverlay from '../shared/MapSettingsOverlay';
import { useData } from '../../services/DataContext';

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

// Stable color generator for routes
const getRouteColor = (id: string) => {
    if (!id || id === 'All') return '#f59e0b';
    const colors = [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#3b82f6', // Blue
        '#ec4899', // Pink
        '#8b5cf6', // Violet
        '#f97316', // Orange
        '#06b6d4', // Cyan
        '#84cc16'  // Lime
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Component to handle map centering and zooming
const MapBoundsSetter = ({ routePath, pois }: { routePath: any, pois: any[] }) => {
    const map = useMap();
    useEffect(() => {
        if (routePath) {
            try {
                const geoJsonLayer = L.geoJSON(routePath);
                if (geoJsonLayer.getLayers().length > 0) {
                    map.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50] });
                }
            } catch (e) {
                console.error("Error fitting route bounds:", e);
                // Fallback for custom objects if they have coordinates
                if (routePath.plannedRoute && routePath.plannedRoute.length > 0) {
                    const bounds = L.latLngBounds(routePath.plannedRoute);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        } else if (pois && pois.length > 0) {
            try {
                const points = pois.map(p => [p.lat, p.lng] as [number, number]);
                const bounds = L.latLngBounds(points);
                map.fitBounds(bounds, { padding: [50, 50] });
            } catch (e) {
                console.error("Error fitting POI bounds:", e);
            }
        }
    }, [routePath, pois, map]);
    return null;
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

const vehicleIcon = (angle: string, time: string) => {
    const a = typeof angle === 'string' ? parseInt(angle) : angle;
    const color = '#10b981'; // Primary theme color for monitoring

    return L.divIcon({
        className: 'bg-transparent border-none',
        html: `<div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                <!-- Sleek Directional Pointer -->
                <div style="transform: rotate(${a || 0}deg); transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="white" fill-opacity="0.95" stroke="${color}" stroke-width="2.5"/>
                    <path d="M20 7L12 28L20 24L28 28L20 7Z" fill="${color}" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
                    <circle cx="20" cy="20" r="2.5" fill="white"/>
                  </svg>
                </div>
                
                <!-- Time Label Overlay -->
                <div style="position: absolute; top: -32px; left: 50%; transform: translateX(-50%); background: ${color}; color: white; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 900; white-space: nowrap; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); border: 2px solid white; z-index: 50; display: flex; align-items: center; gap: 4px;">
                  <span style="width: 6px; height: 6px; background: white; border-radius: 50%; animation: pulse 2s infinite;"></span>
                  ${time}
                </div>
              </div>`,
        iconSize: [50, 50],
        iconAnchor: [25, 25]
    });
};

const POIMonitoringPage = () => {
    const [pois, setPois] = useState<POI[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [assignedVehicle, setAssignedVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { zones, wards, customers, vehicles: allVehicles, coverageRecords, loading: dataLoading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedZone, setSelectedZone] = useState('All');
    const [selectedRoute, setSelectedRoute] = useState('All');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [generatingReport, setGeneratingReport] = useState<string | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);
    const [activeReport, setActiveReport] = useState<string>('');
    const [userName, setUserName] = useState('Administrator');
    const [reportFilters, setReportFilters] = useState({
        zone: '',
        ward: '',
        vehicle: 'All',
        vType: 'All',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [isStale, setIsStale] = useState(false);
    const [playbackTarget, setPlaybackTarget] = useState<{ward: string, zone: string, route: string, date: string} | null>(null);

    useEffect(() => {
        const auth = getAuth();
        if (auth.currentUser) {
            setUserName(auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Administrator');
        }
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const handleGenerateReport = async (reportType: string) => {
        setGeneratingReport(reportType);
        setActiveReport(reportType);

        try {
            
            // Use customers from context as primary source
            let sourceData = customers;
            
            // Apply modal filters if they are set, otherwise use main page filters
            const targetZone = reportFilters.zone || (selectedZone === 'All' ? '' : selectedZone);
            const targetWard = reportFilters.ward || (selectedWard === 'All' ? '' : selectedWard);
            
            let filteredSource = sourceData.filter(c => {
                const matchesZone = !targetZone || c.zone === targetZone;
                const matchesWard = !targetWard || c.ward === targetWard;
                return matchesZone && matchesWard;
            });

            // If context is empty (loading), try a direct fetch as fallback
            if (filteredSource.length === 0 && sourceData.length === 0) {
                const res = await getPOIs(targetWard || undefined, targetZone || undefined);
                if (res.success) filteredSource = res.data;
            }

            // Simulated delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 800));

            let data: any[] = [];
            
            // Build covered set from coverageRecords or historical records
            const [year, month, day] = reportFilters.startDate.split('-').map(Number);
            const targetDate = new Date(year, month - 1, day);
            const targetDateStr = targetDate.toDateString();
            const todayStr = new Date().toISOString().split('T')[0];

            let activeCoverageRecords = coverageRecords;
            if (reportFilters.startDate !== todayStr) {
                const { getCoverageByDate } = await import('../../services/databaseService');
                const res = await getCoverageByDate(reportFilters.startDate);
                if (res.success && res.data) {
                    activeCoverageRecords = res.data;
                }
            }

            const coveredCustomerVehicleMap = new Map<string, string>();
            activeCoverageRecords.forEach((r: any) => {
                const rDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                if (rDate.toDateString() === targetDateStr || r.sourceDate === reportFilters.startDate) {
                    coveredCustomerVehicleMap.set(r.customerId, r.vehicleId || r.imei || 'Unknown Vehicle');
                }
            });

            if (reportType === 'POI Report' || reportType === 'Coverage Overview') {
                // Group POIs by Route for a summarized report
                const routeGroups: { [key: string]: any } = {};
                
                filteredSource.forEach(p => {
                    const rId = p.routeId || 'Unassigned';
                    if (!routeGroups[rId]) {
                        // Find ALL vehicles assigned to this route
                        const assignedVehicles = (allVehicles || []).filter(v => {
                            const routeStr = v.allAssignedRoutes || v.assignedRouteId || '';
                            if (!routeStr) return false;
                            const routes = routeStr.toString().split(/[;,]/).map((r: string) => r.trim());
                            return routes.includes(rId);
                        });
                        
                        // Find zone from ward if missing
                        const wardInfo = wards.find(w => w.name === p.ward);
                        
                        routeGroups[rId] = {
                            zone: p.zone || wardInfo?.zoneName || 'N/A',
                            ward: p.ward || 'N/A',
                            vehicle: assignedVehicles.length > 0 
                                ? assignedVehicles.map(v => v.plateNumber || v.name).join(', ') 
                                : p.vehicleId || 'N/A',
                            vtype: assignedVehicles.length > 0 
                                ? Array.from(new Set(assignedVehicles.map(v => v.type))).join(', ') 
                                : 'Auto Tipper',
                            route: rId,
                            total: 0,
                            covered: 0,
                            pending: 0,
                            lastVisited: p.lastVisited || ''
                        };
                    }
                    routeGroups[rId].total++;
                    const isCovered = coveredCustomerVehicleMap.has(p.customerId || p.id);
                    
                    if (isCovered) {
                        routeGroups[rId].covered++;
                        const actualVehicleId = coveredCustomerVehicleMap.get(p.customerId || p.id);
                        if (actualVehicleId) {
                            if (!routeGroups[rId].actualVehicles) routeGroups[rId].actualVehicles = new Set<string>();
                            routeGroups[rId].actualVehicles.add(actualVehicleId === 'MN-RE-RUN' ? 'Manual Re-Run' : actualVehicleId);
                        }
                    } else {
                        routeGroups[rId].pending++;
                    }
                    // Keep the latest visit time
                    if (p.lastVisited && (!routeGroups[rId].lastVisited || p.lastVisited > routeGroups[rId].lastVisited)) {
                        routeGroups[rId].lastVisited = p.lastVisited;
                    }
                });

                data = Object.values(routeGroups).map((group: any, i) => {
                    let finalVehicle = group.vehicle;
                    if (finalVehicle === 'N/A' && group.actualVehicles && group.actualVehicles.size > 0) {
                        finalVehicle = Array.from(group.actualVehicles).join(', ');
                    }

                    return {
                        sno: i + 1,
                        zone: group.zone,
                        ward: group.ward,
                        vehicle: finalVehicle,
                        vtype: group.vtype,
                    route: group.route,
                    total: group.total,
                    covered: group.covered,
                    pending: group.pending,
                    coverage: `${Math.round((group.covered / group.total) * 100)}%`,
                    date: reportFilters.startDate,
                    inTime: group.covered > 0 ? (group.lastVisited || '08:30 AM') : 'N/A',
                    outTime: group.covered > 0 ? '02:00 PM' : '-'
                    };
                });
            } else if (reportType === 'Trip Report' || reportType === 'Distance Report') {
                // Generate per-vehicle summary
                const vehicles = Array.from(new Set(filteredSource.map(p => p.vehicleId).filter(v => v && v !== 'N/A')));
                if (vehicles.length === 0 && filteredSource.length > 0) vehicles.push('MVN-01'); // Fallback if no vehicle assigned

                data = vehicles.map((v, i) => {
                    const vehiclePois = filteredSource.filter(p => p.vehicleId === v);
                    const covered = vehiclePois.filter(p => coveredCustomerVehicleMap.has(p.customerId || p.id)).length;
                    const total = vehiclePois.length;
                    const perc = total > 0 ? Math.round((covered / total) * 100) : 0;

                    return {
                        sno: i + 1,
                        zone: targetZone || 'Zone 1',
                        ward: targetWard || 'Ward 1',
                        vehicle: v,
                        vtype: 'Auto Tipper',
                        route: 'R-01',
                        total: reportType === 'Distance Report' ? '12.4 km' : total,
                        covered: reportType === 'Distance Report' ? '11.8 km' : covered,
                        pending: reportType === 'Distance Report' ? '0.6 km' : (total - covered),
                        coverage: `${perc}%`,
                        date: reportFilters.startDate,
                        inTime: '08:30 AM', // TODO: Calculate from actual records
                        outTime: '02:00 PM' // TODO: Calculate from actual records
                    };
                });
            }

            setReportData(data);
            setShowReport(true);
        } catch (error) {
            console.error("Error generating report:", error);
        } finally {
            setGeneratingReport(null);
        }
    };

    const handlePlayback = async (row: any) => {
        setShowReport(false);
        setLoading(true);
        setViewMode('map'); // Force view to map
        
        if (row.ward && row.ward !== 'N/A') setSelectedWard(row.ward);
        if (row.zone && row.zone !== 'N/A') setSelectedZone(row.zone);
        if (row.route && row.route !== 'Unassigned') setSelectedRoute(row.route);
        
        // Update the main view date to match the report date
        setSelectedDate(reportFilters.startDate);

        setPlaybackTarget({
            ward: row.ward !== 'N/A' ? row.ward : '',
            zone: row.zone !== 'N/A' ? row.zone : '',
            route: row.route !== 'Unassigned' ? row.route : '',
            date: reportFilters.startDate
        });
    };
    const [routePath, setRoutePath] = useState<any>(null);
    const [wardRoads, setWardRoads] = useState<any[]>([]);
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [showKMLLayers, setShowKMLLayers] = useState(false);
    const [showParking, setShowParking] = useState(false);
    const [showDump, setShowDump] = useState(false);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

    useEffect(() => {
        const fetchRoutes = async () => {
            if (selectedWard !== 'All') {
                const result = await getWardRoutes(selectedWard);
                if (result.success && 'data' in result) {
                    setAvailableRoutes(result.data as any[]);
                }
            } else {
                setAvailableRoutes([]);
            }
        };
        fetchRoutes();
    }, [selectedWard]);

    useEffect(() => {
        fetchData();
    }, [selectedWard, selectedZone, selectedRoute]);

    const fetchData = async () => {
        // Explicitly clear POIs and Route when filters change BEFORE async operations
        setPois([]);
        setRoutePath(null);
        setAssignedVehicle(null);
        setHistoryData([]);
        setLoading(true);

        try {
            // Load roads as background but clear operational data
            if (selectedWard !== 'All' && selectedWard !== '') {
                const roadsResult = await getWardRoads(selectedWard);
                if (roadsResult.success) {
                    setWardRoads(roadsResult.data);
                }
            } else {
                setWardRoads([]);
            }
        } catch (error) {
            console.error('Error fetching POI data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadCustomers = async (overrideWard?: string, overrideZone?: string) => {
        const w = typeof overrideWard === 'string' ? overrideWard : selectedWard;
        const z = typeof overrideZone === 'string' ? overrideZone : selectedZone;
        if (w !== 'All' && w !== '') {
            setLoading(true);

            const poiResult = await getPOIs(w === 'All' ? undefined : w, z === 'All' ? undefined : z);
            if (poiResult.success) {
                setPois(poiResult.data || []);
            }
            setLoading(false);
        }
    };

    const handleLoadRoute = async (overrideRoute?: string, overrideDate?: string) => {
        const r = typeof overrideRoute === 'string' ? overrideRoute : selectedRoute;
        if (r !== 'All' && r !== '') {
            setLoading(true);
            setHistoryData([]); // Clear old history

            const { getAllAdminData } = await import('../../services/databaseService');
            const [routeResult, vehiclesResult] = await Promise.all([
                getRouteData(r),
                getAllAdminData('vehicles')
            ]);

            if (routeResult.success) {
                setRoutePath(routeResult.data);
            }

            if (vehiclesResult.success) {
                const vehicle = (vehiclesResult.data as any[]).find((v: any) => v.assignedRouteId === r);
                setAssignedVehicle(vehicle || null);

                // Fetch history if vehicle is assigned
                if (vehicle && vehicle.imei) {
                    try {
                        const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
                        const { db } = await import('../../services/firebaseConfig');
                        
                        const targetDay = typeof overrideDate === 'string' ? overrideDate : (selectedDate || new Date().toISOString().split('T')[0]);
                        const snapshotsCol = collection(db, 'vehicle_history_snapshots');
                        const q = query(
                            snapshotsCol,
                            where('day', '==', targetDay),
                            orderBy('timestamp', 'asc')
                        );
                        
                        const querySnapshot = await getDocs(q);
                        const allSnapshots = querySnapshot.docs.map(doc => doc.data());
                        
                        const data = allSnapshots
                            .map(snap => {
                                const vData = snap.vehicles?.find((v: any) => v.imei === vehicle.imei);
                                return vData ? { ...vData, timestamp: snap.timestamp } : null;
                            })
                            .filter(Boolean);
                            
                        setHistoryData(data as any[]);
                    } catch (error) {
                        console.error('Error fetching vehicle history:', error);
                    }
                }
            }
            
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-load route and customers when playback target is ready
        if (playbackTarget) {
            handleLoadCustomers(playbackTarget.ward, playbackTarget.zone);
            handleLoadRoute(playbackTarget.route, playbackTarget.date);
            setPlaybackTarget(null);
        }
    }, [playbackTarget]);

    const filteredPOIs = pois.filter(poi =>
        (poi.ownerName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (poi.address || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (poi.houseNumber || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );


    const selectedRouteName = useMemo(() => {
        if (selectedRoute === 'All') return 'All';
        const route = availableRoutes.find(r => r.id === selectedRoute);
        return route ? route.name : selectedRoute;
    }, [selectedRoute, availableRoutes]);

    const routeAssignedStats = useMemo(() => {
        const assigned = customers.filter(c => c.routeId && c.routeId !== '' && c.routeId !== 'Unassigned');
        const total = assigned.length;
        const covered = assigned.filter(c => c.status === 'covered').length;
        const percentage = total > 0 ? Math.round((covered / total) * 100) : 0;
        return { total, covered, percentage };
    }, [customers]);

    const computedStats = useMemo(() => {
        let filteredCustomers = customers;
        if (selectedWard !== 'All' && selectedWard !== '') {
            filteredCustomers = filteredCustomers.filter(c => c.ward === selectedWard);
        }
        if (selectedZone !== 'All' && selectedZone !== '') {
            filteredCustomers = filteredCustomers.filter(c => c.zone === selectedZone);
        }

        const total = filteredCustomers.length;
        
        const todayStr = new Date().toDateString();
        const coveredCustomerIds = new Set(
            coverageRecords
                .filter((r: any) => {
                    const rDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
                    return rDate.toDateString() === todayStr;
                })
                .map((r: any) => r.customerId)
        );

        const covered = filteredCustomers.filter(c => coveredCustomerIds.has(c.id) || c.status === 'covered').length;
        
        return {
            totalPOIs: total,
            coveredToday: covered,
            activeVehicles: (allVehicles || []).filter((v: any) => v.status === 'active').length
        };
    }, [customers, coverageRecords, selectedWard, selectedZone, allVehicles]);

    const summaryCards = [
        { label: 'Total Households', value: computedStats.totalPOIs || '0', icon: POIIcon, color: 'text-blue-600 bg-blue-100' },
        { label: 'Covered Today', value: computedStats.coveredToday || '0', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
        { label: 'Route Coverage', value: `${routeAssignedStats.covered}/${routeAssignedStats.total} (${routeAssignedStats.percentage}%)`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100' },
        { label: 'Active Vehicles', value: assignedVehicle ? 1 : (computedStats.activeVehicles || '0'), icon: Truck, color: 'text-purple-600 bg-purple-100' },
    ];

    const StatCard = ({ label, value, icon: Icon, color, index }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden group`}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-700/30 dark:to-gray-800/30 opacity-40 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 rounded-2xl ${color} bg-opacity-20 shadow-inner group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon size={28} className={color.split(' ')[0]} />
                </div>
                <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-lg transition-colors text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20`}>
                    Live
                </div>
            </div>

            <div className="mt-6 relative z-10">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <h3 className={`text-4xl font-black font-display tracking-tight leading-none transition-all text-gray-900 dark:text-white`}>
                        {value}
                    </h3>
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

            {/* Critical Missed POIs Alert Widget */}
            {(computedStats.totalPOIs - computedStats.coveredToday) > 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-5 shadow-sm flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-800/50 rounded-2xl text-red-500">
                            <AlertCircle size={24} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-red-800 dark:text-red-400 uppercase tracking-tight">Critical Alert: Missed Scans</h3>
                            <p className="text-xs font-bold text-red-600/80 dark:text-red-300/70 mt-0.5">
                                There are <span className="text-red-600 font-black text-sm">{computedStats.totalPOIs - computedStats.coveredToday}</span> households currently pending coverage today.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleGenerateReport('POI Report')}
                        disabled={dataLoading}
                        className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all text-xs uppercase tracking-widest"
                    >
                        Review Pending
                    </button>
                </motion.div>
            )}

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
                                disabled={generatingReport !== null || dataLoading}
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
                            onChange={(e) => {
                                setSelectedZone(e.target.value);
                                setSelectedWard('All');
                                setSelectedRoute('All');
                            }}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 rounded-lg outline-none appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                        >
                            <option value="All">All Zones</option>
                            {zones.map((z, idx) => <option key={z.id || `zone-${idx}`} value={z.name}>{z.name}</option>)}
                        </select>
                    </div>

                    <div className="w-48">
                        <select
                            value={selectedWard}
                            onChange={(e) => {
                                setSelectedWard(e.target.value);
                                setSelectedRoute('All');
                            }}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 rounded-lg outline-none appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                            disabled={selectedZone === 'All'}
                        >
                            <option value="All">All Wards</option>
                            {useMemo(() => {
                                const filtered = wards.filter(w => w.zoneName === selectedZone);
                                const unique = new Map();
                                
                                filtered.forEach(w => {
                                    // Normalize name: "Ward 24: Name" or "24-Name" -> "24 - Name"
                                    let normalized = w.name.replace(/Ward\s+/i, '').replace(/[:\-]/g, ' - ').replace(/\s+/g, ' ').trim();
                                    // Ensure number comes first if it exists
                                    const match = normalized.match(/^(\d+)\s*-\s*(.*)$/);
                                    if (match) normalized = `${match[1]} - ${match[2]}`;
                                    
                                    if (!unique.has(normalized)) {
                                        unique.set(normalized, { ...w, displayName: normalized });
                                    }
                                });
                                
                                return Array.from(unique.values())
                                    .sort((a, b) => {
                                        const numA = parseInt(a.displayName) || 0;
                                        const numB = parseInt(b.displayName) || 0;
                                        return numA - numB;
                                    })
                                    .map((w, idx) => <option key={w.id || `ward-${idx}`} value={w.name}>{w.displayName}</option>);
                            }, [wards, selectedZone])}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <div className="flex items-center gap-2 w-full px-4 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg h-[38px]">
                            <select
                                value={selectedRoute}
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                className="bg-transparent border-none outline-none text-[11px] w-full text-gray-500 font-bold cursor-pointer appearance-none"
                            >
                                <option value="All">Routes {availableRoutes.length > 0 ? `(${availableRoutes.length})` : ''}</option>
                                {availableRoutes.map((r, idx) => <option key={r.id || `route-${idx}`} value={r.id}>{r.name}</option>)}
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
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{selectedRoute === 'All' ? `${selectedWard} R1` : selectedRouteName}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                                    {assignedVehicle 
                                        ? (assignedVehicle.plateNumber ? `${assignedVehicle.name} (${assignedVehicle.plateNumber})` : assignedVehicle.name) 
                                        : 'No Vehicle Assigned'
                                    }
                                </td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{stats?.totalPOIs || 0}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{stats?.coveredToday || 0}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{stats?.pendingPOIs || 0}</td>
                                <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">{stats?.coveragePercentage || 0}%</td>
                                <td className="py-3 px-4 flex justify-center">
                                    <div 
                                        className="w-4 h-4 rounded-full shadow-sm" 
                                        style={{ backgroundColor: getRouteColor(selectedRoute) }}
                                    ></div>
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
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400'}`}
                    >
                        <MapIcon size={14} />
                        Map
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400'}`}
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

                                <MapBoundsSetter routePath={routePath} pois={filteredPOIs} />

                                <KMLLayers visible={showKMLLayers} />
                                <AssetLayers showParking={showParking} showDump={showDump} />

                                {/* Base Road Layer */}
                                {wardRoads.map((road, i) => road && road.length > 0 && (
                                    <Polyline
                                        key={`road-${i}`}
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
                                        {/* Handle GeoJSON Route */}
                                        {(routePath.type === 'FeatureCollection' || routePath.type === 'Feature') ? (
                                            <GeoJSON 
                                                data={routePath} 
                                                style={{ color: '#3b82f6', weight: 3, opacity: 0.8 }} 
                                            />
                                        ) : (
                                            <>
                                                {/* Planned Route Line */}
                                                {routePath.plannedRoute && routePath.plannedRoute.length > 0 && (
                                                    <Polyline
                                                        positions={routePath.plannedRoute}
                                                        pathOptions={{ color: '#3b82f6', weight: 3, opacity: 0.8 }}
                                                    />
                                                )}
                                                {/* GPS History Line */}
                                                {routePath.gpsHistory && routePath.gpsHistory.length > 0 && (
                                                    <Polyline
                                                        positions={routePath.gpsHistory}
                                                        pathOptions={{ color: '#10b981', weight: 3, opacity: 0.8 }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Assigned Vehicle History Trail */}
                                {historyData.length > 0 && (
                                    <Polyline 
                                        positions={historyData.map(p => [parseFloat(p.lat), parseFloat(p.lng)] as [number, number])}
                                        pathOptions={{
                                            color: '#ef4444',
                                            weight: 4,
                                            opacity: 0.6,
                                            dashArray: '10, 10'
                                        }}
                                    />
                                )}

                                {/* Vehicle Current Position Icon */}
                                {historyData.length > 0 && (
                                    <Marker 
                                        position={[parseFloat(historyData[historyData.length - 1].lat), parseFloat(historyData[historyData.length - 1].lng)]}
                                        icon={vehicleIcon(
                                            historyData[historyData.length - 1].angle || '0',
                                            new Date(historyData[historyData.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        )}
                                    >
                                        <Popup>
                                            <div className="p-2 font-bold">
                                                <p className="text-gray-900 dark:text-white uppercase tracking-tight">{assignedVehicle?.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(historyData[historyData.length - 1].timestamp).toLocaleTimeString()}</p>
                                                <p className="text-emerald-600">{historyData[historyData.length - 1].speed} km/h</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}

                                {filteredPOIs.map((poi, idx) => (
                                    <Marker
                                        key={poi.id || `poi-${idx}`}
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

                            <MapSettingsOverlay 
                                mapType={mapType}
                                setMapType={setMapType}
                                showKMLLayers={showKMLLayers}
                                setShowKMLLayers={setShowKMLLayers}
                                showParking={showParking}
                                setShowParking={setShowParking}
                                showDump={showDump}
                                setShowDump={setShowDump}
                                position="top-right"
                            />



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
                                        <div className="w-8 h-1 bg-blue-500 rounded"></div>
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
                                        {filteredPOIs.map((poi, idx) => (
                                            <tr key={poi.id || `row-${idx}`} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
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
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border ${poi.status === 'covered'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-red-50 text-red-600 border-red-100'}`}>
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
                                    animate={{ width: `${stats?.coveragePercentage || 0}%` }}
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
                                    {activeReport} - {new Date().toLocaleDateString()}
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
                                        <span>Total Rows : <span className="text-gray-900 dark:text-white">{reportData.length}</span></span>
                                        <span>Covered Count : <span className="text-emerald-600">{reportData.filter(r => r.covered === 1).length}</span></span>
                                        <span>Pending Count : <span className="text-red-600">{reportData.filter(r => r.pending === 1).length}</span></span>
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
                                        onChange={(e) => setReportFilters({ ...reportFilters, zone: e.target.value, ward: '' })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-32"
                                    >
                                        <option value="">Select Zone</option>
                                        {zones.map((z, idx) => <option key={z.id || `zone-modal-${idx}`} value={z.name}>{z.name}</option>)}
                                    </select>
                                    <select
                                        value={reportFilters.ward}
                                        onChange={(e) => setReportFilters({ ...reportFilters, ward: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-32"
                                        disabled={!reportFilters.zone}
                                    >
                                        <option value="">Select Ward</option>
                                        {wards
                                            .filter(w => w.zoneName === reportFilters.zone)
                                            .map((w, idx) => <option key={w.id || `ward-modal-${idx}`} value={w.name}>{w.name}</option>)
                                        }
                                    </select>
                                    <select
                                        value={reportFilters.vehicle}
                                        onChange={(e) => setReportFilters({ ...reportFilters, vehicle: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-40"
                                    >
                                        <option value="All">All Vehicles</option>
                                    </select>
                                    <select
                                        value={reportFilters.vType}
                                        onChange={(e) => setReportFilters({ ...reportFilters, vType: e.target.value })}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-bold text-gray-500 outline-none w-48"
                                    >
                                        <option value="All">All types</option>
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
                                            {reportData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={20} className="px-4 py-20 text-center text-gray-400 font-black uppercase tracking-widest bg-gray-50/50 dark:bg-gray-900/50">
                                                        No matching records found for the selected filters
                                                    </td>
                                                </tr>
                                            ) : (
                                                reportData.map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                                        {Object.entries(row).map(([key, value]: [string, any], i) => (
                                                            <td key={i} className={`px-4 py-4 border-r dark:border-gray-700 ${key === 'ward' ? 'text-blue-600 dark:text-blue-400' : ''} ${key === 'coverage' ? 'font-black text-emerald-600' : ''}`}>
                                                                {value}
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-4 text-center">
                                                            <button 
                                                                onClick={() => handlePlayback(row)}
                                                                className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
                                                                title="View Playback on Map"
                                                            >
                                                                <Activity size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
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
