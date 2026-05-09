import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, FileText, Trash2, CheckCircle2, AlertCircle, 
    Layers, Plus, Filter, Search, Map as MapIcon, 
    Navigation, Save, X, ChevronRight, Globe, RefreshCw, List, Database, Truck
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { db } from '../../services/firebaseConfig';
import { collection, writeBatch, doc, setDoc } from 'firebase/firestore';
import { getAllAdminData, createLargeDocument, deleteAdminData, updateAdminData } from '../../services/databaseService';
import { useData } from '../../services/DataContext';
import toGeoJSON from '@mapbox/togeojson';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Robust coordinate counting for various GeoJSON types
const countCoordinates = (geometry: any): number => {
    if (!geometry) return 0;
    if (geometry.type === 'Point') return 1;
    if (geometry.type === 'LineString') return geometry.coordinates?.length || 0;
    if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
        return geometry.coordinates?.reduce((acc: number, curr: any) => acc + (curr?.length || 0), 0) || 0;
    }
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates?.reduce((acc: number, polygon: any) => 
            acc + (polygon?.reduce((innerAcc: number, ring: any) => innerAcc + (ring?.length || 0), 0) || 0), 0) || 0;
    }
    if (geometry.type === 'GeometryCollection') {
        return geometry.geometries?.reduce((acc: number, g: any) => acc + countCoordinates(g), 0) || 0;
    }
    return 0;
};

// Stable color generator for routes
const getRouteColor = (id: string) => {
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

// Component to handle map centering
const MapBoundsSetter = ({ data, allRoutes }: { data: any, allRoutes?: RouteLayer[] }) => {
    const map = useMap();
    useEffect(() => {
        if (data) {
            try {
                const geoJsonLayer = L.geoJSON(data);
                map.fitBounds(geoJsonLayer.getBounds(), { padding: [40, 40] });
            } catch (e) {
                console.error("Error fitting bounds:", e);
            }
        } else if (allRoutes && allRoutes.length > 0) {
            try {
                const group = new L.FeatureGroup();
                allRoutes.forEach(r => {
                    if (r.data) {
                        try {
                            const layer = L.geoJSON(JSON.parse(r.data));
                            group.addLayer(layer);
                        } catch {}
                    }
                });
                if (group.getLayers().length > 0) {
                    map.fitBounds(group.getBounds(), { padding: [50, 50] });
                }
            } catch (e) {
                console.error("Error fitting all routes bounds:", e);
            }
        }
    }, [data, map, allRoutes]);
    return null;
};

interface RouteLayer {
    id: string;
    routeId?: string;
    name: string;
    zone: string;
    ward: string;
    featureCount: number;
    data: string;
    createdAt: any;
    isChunked: boolean;
}

const RouteMasterPage = () => {
    const navigate = useNavigate();
    const { zones, wards, vehicles: allVehicles, refreshData: refreshGlobalData } = useData();
    const [routes, setRoutes] = useState<RouteLayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [fetchingRoute, setFetchingRoute] = useState(false);
    
    // Form State
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [routeName, setRouteName] = useState('');
    const [routeId, setRouteId] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
    const [activeTab, setActiveTab] = useState<'view' | 'upload'>('view');
    const [isRepairing, setIsRepairing] = useState(false);

    // Refs for hidden inputs
    const routeFileInputRef = useRef<HTMLInputElement>(null);
    const bulkFileInputRef = useRef<HTMLInputElement>(null);

    // Map Modal State
    const [selectedRoute, setSelectedRoute] = useState<RouteLayer | null>(null);
    const [selectedRouteData, setSelectedRouteData] = useState<any>(null);
    const [viewingRouteName, setViewingRouteName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const routesRes = await getAllAdminData('ward_routes');
            if (routesRes.success) setRoutes(routesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRepairZones = async () => {
        if (wards.length === 0) {
            if (window.confirm("Ward Master data is missing. Would you like to initialize the default 70 wards and 4 zones first?")) {
                handleInitializeMasterData();
            }
            return;
        }

        setIsRepairing(true);
        try {
            const batch = writeBatch(db);
            let count = 0;

            for (const route of routes) {
                if (!route.zone || route.zone === 'Unknown' || route.zone === '') {
                    const trimmedWard = String(route.ward).trim();
                    console.log('Attempting to repair ward:', trimmedWard);
                    
                    const foundWard = wards.find(w => 
                        w.name.toLowerCase().trim() === trimmedWard.toLowerCase() ||
                        (trimmedWard.length <= 3 && w.name.startsWith(trimmedWard.padStart(2, '0') + '-')) ||
                        w.name.toLowerCase().includes(trimmedWard.toLowerCase())
                    );

                    if (foundWard) {
                        console.log('Match found:', foundWard.name, 'Zone:', foundWard.zoneName);
                        const zoneName = foundWard.zoneName || foundWard.zone;
                        const routeRef = doc(db, 'ward_routes', route.id);
                        batch.update(routeRef, { zone: zoneName });
                        count++;
                    } else {
                        console.log('No match found for ward:', trimmedWard);
                    }
                }
            }

            if (count > 0) {
                await batch.commit();
                alert(`Successfully repaired ${count} routes!`);
                fetchData();
            } else {
                alert("No repairable routes found. Please ensure Ward Master data matches your route ward names.");
            }
        } catch (error) {
            console.error("Repair error:", error);
            alert("Failed to repair zones.");
        } finally {
            setIsRepairing(false);
        }
    };

    const handleInitializeMasterData = async () => {
        setIsRepairing(true);
        try {
            const ZONES = ["1-CITY", "2-BHUTESHWAR", "3-AURANGABAD", "4-VRINDAVAN"];
            const WARDS_DATA = [
                "01-Birjapur", "02-Ambedkar Nagar", "03-Girdharpur", "04-Ishapur Yamunapar", "05-Bharatpur Gate",
                "06-Aduki", "07-Lohvan", "08-Atas", "09-Gandhi Nagar", "10-Aurangabad First",
                "11-Tarsi", "12-Radhe Shyam Colony", "13-Sunrakh", "14-Lakshmi Nagar Yamunapar", "15-Maholi First",
                "16-Bakalpur", "17-Bairaagpura", "18-General ganj", "19-Ramnagar Yamunapar", "20-Krishna Nagar First",
                "21-Chaitanya Bihar", "22-Badhri Nagar", "23-Aheer Pada", "24-Sarai Azamabad", "25-Chharaura",
                "26-Naya Nagla", "27-Baad", "28-Aurangabad Second", "29-Koyla Alipur", "30-Krishna Nagar Second",
                "31-Navneet Nagar", "32-Ranchibagar", "33-Palikhera", "34-Radhaniwas", "35-Bankhandi",
                "36-Jaisingh Pura", "37-Baldevpuri", "38-Civil Lines", "39-Mahavidhya Colony", "40-Rajkumar",
                "41-Dhaulipiau", "42-Manoharpur", "43-Ganeshra", "44-Radhika Bihar", "45-Birla Mandir",
                "46-Radha Nagar", "47-Dwarkapuri", "48-Satoha Asangpur", "49-Daimpiriyal Nagar", "50-Patharpura",
                "51-Gaushala Nagar", "52-Chandrapuri", "53-Krishna Puri", "54-Pratap Nagar", "55-Govind Nagar",
                "56-Mandi Randas", "57-Balajipuram", "58-Gau Ghat", "59-Maholi Second", "60-Jagannath Puri",
                "61-Chaubia Para", "62-Mathura Darwaza", "63-Maliyaan Sadar", "64-Ghati Bahalray", "65-Holi Gali",
                "66-Keshighat", "67-Kemar Van", "68-Shanti Nagar", "69-Ratan Chhatri", "70-Biharipur"
            ];

            // Create Zones
            for (const zName of ZONES) {
                const zoneRef = doc(db, 'zones', zName);
                await setDoc(zoneRef, { name: zName, description: 'Default System Zone', updatedAt: new Date().toISOString() }, { merge: true });
            }

            // Create Wards
            const batch = writeBatch(db);
            for (let i = 0; i < WARDS_DATA.length; i++) {
                const wName = WARDS_DATA[i];
                let zName = ZONES[0];
                if (i >= 20 && i < 40) zName = ZONES[1];
                if (i >= 40 && i < 60) zName = ZONES[2];
                if (i >= 60) zName = ZONES[3];
                
                const wardRef = doc(db, 'wards', wName);
                batch.set(wardRef, { 
                    name: wName, 
                    zoneName: zName, 
                    updatedAt: new Date().toISOString() 
                }, { merge: true });
            }
            await batch.commit();
            alert("Master Data Initialized! Now clicking Repair Zones will work.");
            refreshGlobalData();
        } catch (e: any) {
            alert("Initialization failed: " + e.message);
        } finally {
            setIsRepairing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension === 'kml' || extension === 'geojson' || extension === 'json') {
                setSelectedFile(file);
                if (!routeName) {
                    setRouteName(file.name.split('.')[0].replace(/_/g, ' '));
                }
                if (!routeId) {
                    setRouteId(file.name.split('.')[0].toUpperCase());
                }
            } else {
                setStatus({ type: 'error', message: 'Please upload a .kml or .geojson file' });
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedZone || !selectedWard || !routeName || !routeId) {
            setStatus({ type: 'error', message: 'Please fill all fields and select a file' });
            return;
        }

        setUploading(true);
        setStatus(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target?.result as string;
                let geojsonData: any;

                if (selectedFile.name.endsWith('.kml')) {
                    const parser = new DOMParser();
                    const kmlDoc = parser.parseFromString(content, 'text/xml');
                    geojsonData = toGeoJSON.kml(kmlDoc);
                } else {
                    geojsonData = JSON.parse(content);
                }

                // Calculate coordinate stats using robust counting
                let totalPoints = 0;
                if (geojsonData.features) {
                    geojsonData.features.forEach((f: any) => {
                        totalPoints += countCoordinates(f.geometry);
                    });
                } else if (geojsonData.type === 'Feature') {
                    totalPoints = countCoordinates(geojsonData.geometry);
                } else if (geojsonData.type === 'GeometryCollection') {
                    totalPoints = countCoordinates(geojsonData);
                }

                // Metadata for the route
                const routeData = {
                    name: routeName,
                    routeId: routeId,
                    zone: selectedZone,
                    ward: selectedWard,
                    featureCount: geojsonData.features?.length || (geojsonData.type === 'Feature' ? 1 : 0),
                    pointCount: totalPoints,
                    data: JSON.stringify(geojsonData),
                    createdAt: new Date().toISOString()
                };

                const result = await createLargeDocument('ward_routes', routeData, 'data');

                if (result.success) {
                    setStatus({ type: 'success', message: 'Route uploaded successfully!' });
                    setRouteName('');
                    setRouteId('');
                    setSelectedFile(null);
                    fetchData();
                } else {
                    setStatus({ type: 'error', message: result.error || 'Failed to upload route' });
                }
                setUploading(false);
            };
            reader.readAsText(selectedFile);
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
            setUploading(false);
        }
    };

    const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.csv')) {
                setBulkFile(file);
                setStatus({ type: 'info', message: `Selected bulk file: ${file.name}. Click 'Start Bulk Import' to proceed.` });
            } else {
                setStatus({ type: 'error', message: 'Please upload a .csv file for bulk import' });
            }
        }
    };

    const handleBulkUpload = async () => {
        if (!bulkFile) return;
        setUploading(true);
        setStatus({ type: 'info', message: 'Processing bulk file...' });

        try {
            const isCSV = bulkFile.name.toLowerCase().endsWith('.csv');
            
            if (isCSV) {
                Papa.parse(bulkFile, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await processJsonData(results.data);
                    },
                    error: (error) => {
                        console.error('PapaParse error:', error);
                        setStatus({ type: 'error', message: `File parsing error: ${error.message}` });
                        setUploading(false);
                    }
                });
            } else {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];
                    await processJsonData(jsonData);
                };
                reader.readAsArrayBuffer(bulkFile);
            }

            async function processJsonData(jsonData: any[]) {
                setBulkProgress({ current: 0, total: jsonData.length });
                let successCount = 0;
                let failCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    try {
                        // Flexible header mapping
                        const wardArea = row['Ward Area'] || row['ward_area'] || row['Ward'] || '';
                        const routeId = row['Route ID'] || row['route_id'] || row['id'] || '';
                        const routeName = row['Route Name'] || row['route_name'] || row['name'] || row['Route ID'] || `Route ${i + 1}`;
                        const kmlContent = row['KML Content'] || row['kml_content'] || row['kml'] || '';

                        if (!kmlContent) {
                            console.warn(`Row ${i} missing KML Content`, row);
                            failCount++;
                            continue;
                        }

                        // Map ward to zone (Robust Lookup)
                        const trimmedWard = String(wardArea).trim();
                        const foundWard = wards.find(w => 
                            w.name.toLowerCase().trim() === trimmedWard.toLowerCase() ||
                            (trimmedWard.length <= 3 && w.name.startsWith(trimmedWard.padStart(2, '0') + '-')) ||
                            w.name.toLowerCase().includes(trimmedWard.toLowerCase())
                        );
                        const zoneName = foundWard ? (foundWard.zoneName || foundWard.zone) : 'Unknown';

                        // Parse KML to GeoJSON
                        const parser = new DOMParser();
                        const kmlDoc = parser.parseFromString(kmlContent, 'text/xml');
                        
                        // Check for XML parsing errors
                        if (kmlDoc.getElementsByTagName('parsererror').length > 0) {
                            throw new Error('Invalid KML XML format');
                        }

                        const geojsonData = toGeoJSON.kml(kmlDoc);

                        if (!geojsonData || !geojsonData.features || geojsonData.features.length === 0) {
                            throw new Error('No features found in KML');
                        }

                        // Calculate stats
                        let totalPoints = 0;
                        geojsonData.features.forEach((f: any) => {
                            totalPoints += countCoordinates(f.geometry);
                        });

                        const routeData = {
                            name: routeName,
                            routeId: routeId,
                            zone: zoneName,
                            ward: wardArea,
                            featureCount: geojsonData.features.length,
                            pointCount: totalPoints,
                            data: JSON.stringify(geojsonData),
                            createdAt: new Date().toISOString()
                        };

                        const result = await createLargeDocument('ward_routes', routeData, 'data');
                        if (result.success) {
                            successCount++;
                        } else {
                            console.error(`Failed to save row ${i}:`, result.error);
                            errors.push(`Row ${i}: ${result.error}`);
                            failCount++;
                        }

                    } catch (err: any) {
                        console.error(`Error processing row ${i}:`, err);
                        errors.push(`Row ${i}: ${err.message}`);
                        failCount++;
                    }
                    setBulkProgress({ current: i + 1, total: jsonData.length });
                }

                setStatus({ 
                    type: successCount > 0 ? 'success' : 'error', 
                    message: `Bulk import complete! Successfully imported ${successCount} routes. ${failCount} failed.${errors.length > 0 ? ' Check console for details.' : ''}` 
                });
                
                if (errors.length > 0) {
                    console.error('Bulk Import Errors:', errors);
                }

                setUploading(false);
                setBulkFile(null);
                fetchData();
            }
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            const result = await deleteAdminData('ward_routes', id);
            if (result.success) {
                fetchData();
            }
        }
    };

    const handleViewOnMap = async (route: RouteLayer) => {
        setSelectedRoute(route);
        setViewingRouteName(route.name);
        setSelectedRouteData(null); // Clear previous to trigger refresh
        
        // If the route is chunked, we need to fetch the full data
        if ((route as any).isChunked) {
            setFetchingRoute(true);
            const { getLargeDocument } = await import('../../services/databaseService');
            const result = await getLargeDocument('ward_routes', route.id, 'data');
            setFetchingRoute(false);
            
            if (result.success && result.data.data) {
                try {
                    setSelectedRouteData(JSON.parse(result.data.data));
                } catch (e) {
                    console.error('Failed to parse fetched route data', e);
                }
            }
        } else if (route.data) {
            try {
                setSelectedRouteData(JSON.parse(route.data));
            } catch (e) {
                console.error('Failed to parse route data', e);
            }
        }
    };

    const filteredWards = wards.filter(w => {
        const wardZone = (w.zoneName || w.zone || '').toString().trim();
        const currentZone = (selectedZone || '').toString().trim();
        return wardZone === currentZone;
    });
    
    const getRouteStats = (route: RouteLayer) => {
        const pointCount = (route as any).pointCount;
        if (pointCount !== undefined && pointCount > 0) return { paths: route.featureCount || 0, nodes: pointCount };
        
        try {
            const geoJson = JSON.parse(route.data);
            let totalNodes = 0;
            if (geoJson.features) {
                geoJson.features.forEach((f: any) => {
                    totalNodes += countCoordinates(f.geometry);
                });
            } else {
                totalNodes = countCoordinates(geoJson);
            }
            return { paths: route.featureCount || (geoJson.features ? geoJson.features.length : 1), nodes: totalNodes };
        } catch {
            return { paths: route.featureCount || 0, nodes: 0 };
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
                <PageHeader 
                    title="Route Master Management" 
                    description="Upload and manage ward-specific vehicle routes." 
                />
                <div className="flex gap-3">
                    <button
                        onClick={handleInitializeMasterData}
                        disabled={isRepairing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm disabled:opacity-50"
                    >
                        <Database size={18} className={isRepairing ? "animate-spin" : ""} />
                        Auto-Initialize Master Data
                    </button>
                    <button
                        onClick={handleRepairZones}
                        disabled={isRepairing}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all text-sm disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isRepairing ? "animate-spin" : ""} />
                        {isRepairing ? "Repairing..." : "Fix Unknown Zones"}
                    </button>
                    <button
                        onClick={() => setActiveTab(activeTab === 'view' ? 'upload' : 'view')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-sm"
                    >
                        {activeTab === 'view' ? <Plus size={18} /> : <List size={18} />}
                        {activeTab === 'view' ? 'Bulk Upload' : 'View Routes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Upload className="text-emerald-500" size={24} />
                            Upload Route
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Zone</label>
                                <select 
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                >
                                    <option value="">Select Zone</option>
                                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Ward</label>
                                <select 
                                    value={selectedWard}
                                    onChange={(e) => setSelectedWard(e.target.value)}
                                    disabled={!selectedZone}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-50"
                                >
                                    <option value="">Select Ward</option>
                                    {filteredWards.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Route ID</label>
                                <input 
                                    type="text"
                                    value={routeId}
                                    onChange={(e) => setRouteId(e.target.value)}
                                    placeholder="e.g. W1R1"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Route Name</label>
                                <input 
                                    type="text"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    placeholder="e.g. Ward 5 - Primary Route"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    accept=".kml,.geojson,.json"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`p-8 border-2 border-dashed rounded-3xl text-center transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 dark:border-gray-700 group-hover:border-emerald-400'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${selectedFile ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                                        {selectedFile ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                                    </div>
                                    <p className="text-sm font-black text-gray-700 dark:text-gray-200">
                                        {selectedFile ? selectedFile.name : 'Click or drop KML/GeoJSON'}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Max size: 50MB (Chunked)</p>
                                </div>
                            </div>

                            <button 
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {uploading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                {uploading ? 'Uploading...' : 'Save Route'}
                            </button>

                            <AnimatePresence>
                                {status && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                                    >
                                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        <p className="text-xs font-bold">{status.message}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Bulk Import Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
                    >
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Layers className="text-blue-500" size={24} />
                            Bulk Import Routes
                        </h3>

                        <div className="space-y-5">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-bold leading-relaxed">
                                    Upload a CSV with headers: <br/>
                                    <code className="bg-white/50 px-1 rounded">Ward Area, Route ID, Route Name, KML Content</code>
                                </p>
                            </div>

                            <div className="relative group">
                                <input 
                                    type="file" 
                                    onChange={handleBulkFileChange}
                                    accept=".csv"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`p-6 border-2 border-dashed rounded-3xl text-center transition-all ${bulkFile ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 dark:border-gray-700 group-hover:border-blue-400'}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3 ${bulkFile ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <p className="text-xs font-black text-gray-700 dark:text-gray-200">
                                        {bulkFile ? bulkFile.name : 'Select CSV for Bulk Upload'}
                                    </p>
                                </div>
                            </div>

                            {uploading && bulkProgress.total > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <span>Importing...</span>
                                        <span>{bulkProgress.current} / {bulkProgress.total}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                onClick={handleBulkUpload}
                                disabled={uploading || !bulkFile}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {uploading ? <RefreshCw className="animate-spin" size={20} /> : <Navigation size={20} />}
                                {uploading ? 'Processing...' : 'Start Bulk Import'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Content: Map then Table */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Map Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[500px]"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <MapIcon size={16} className="text-emerald-500" />
                                    Route Audit Map
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {fetchingRoute ? 'Reassembling Complex Data...' : (selectedRoute ? `Viewing: ${selectedRoute.name}` : 'Select a route below to focus')}
                                </p>
                            </div>
                            {selectedRoute && (
                                <button 
                                    onClick={() => {
                                        setSelectedRoute(null);
                                        setSelectedRouteData(null);
                                    }}
                                    className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest"
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <MapContainer 
                                center={[27.4924, 77.6737]} 
                                zoom={13} 
                                className="w-full h-full z-0"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {routes.map(r => r.data && (
                                    <GeoJSON 
                                        key={r.id}
                                        data={JSON.parse(r.data)}
                                        style={{ 
                                            color: getRouteColor(r.id), 
                                            weight: selectedRoute?.id === r.id ? 6 : 3, 
                                            opacity: selectedRoute ? (selectedRoute.id === r.id ? 1 : 0.4) : 0.8,
                                            dashArray: ''
                                        }}
                                        pointToLayer={(feature, latlng) => (
                                            L.circleMarker(latlng, {
                                                radius: selectedRoute?.id === r.id ? 6 : 4,
                                                fillColor: getRouteColor(r.id),
                                                color: '#fff',
                                                weight: 1,
                                                opacity: 1,
                                                fillOpacity: 0.8
                                            })
                                        )}
                                    />
                                ))}
                                {selectedRouteData && (
                                    <GeoJSON 
                                        key={`focus-${selectedRoute?.id}`}
                                        data={selectedRouteData}
                                        style={{ color: getRouteColor(selectedRoute?.id || ''), weight: 6, opacity: 1 }}
                                    />
                                )}
                                <MapBoundsSetter data={selectedRouteData} allRoutes={routes} />
                            </MapContainer>

                            {(fetchingRoute || (routes.length > 0 && !routes.some(r => r.data) && !selectedRouteData)) && (
                                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px] z-10 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3">
                                        <RefreshCw size={24} className="animate-spin text-emerald-500" />
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                            {fetchingRoute ? 'Loading Large Route...' : 'Syncing Network...'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedRoute && (
                                <div className="absolute top-6 right-6 z-[1000]">
                                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getRouteColor(selectedRoute.id) }}></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Focus</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">{selectedRoute.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Table Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="text-emerald-500" size={24} />
                                Existing Routes
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text"
                                        placeholder="Search routes..."
                                        className="pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 w-64"
                                    />
                                </div>
                                <button
                                    onClick={handleRepairZones}
                                    disabled={isRepairing}
                                    title="Fix Unknown Zones"
                                    className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2 px-3 text-[10px] font-black uppercase"
                                >
                                    <RefreshCw size={14} className={isRepairing ? "animate-spin" : ""} />
                                    {isRepairing ? "Fixing..." : "Repair Zones"}
                                </button>
                                <button
                                    onClick={() => navigate('/bulk-vehicle-upload')}
                                    title="Bulk Vehicle Assignment"
                                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 px-3 text-[10px] font-black uppercase"
                                >
                                    <Truck size={14} />
                                    Vehicle Assignment
                                </button>
                                <button onClick={fetchData} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400">
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone / Ward</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicles</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Analytics</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {loading ? (
                                        [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="px-8 py-10 animate-pulse bg-gray-50/30 dark:bg-gray-800/30"></td></tr>)
                                    ) : routes.length === 0 ? (
                                        <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No routes found</td></tr>
                                    ) : (
                                        routes.map((route) => {
                                            const stats = getRouteStats(route);
                                            return (
                                                <tr key={route.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-all">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                                                                <Navigation size={18} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                                                    {route.name}
                                                                    {route.routeId && <span className="ml-2 text-emerald-500 font-bold">[{route.routeId}]</span>}
                                                                </h4>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    {route.createdAt ? new Date(route.createdAt).toLocaleDateString() : 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className={`text-xs font-black uppercase ${(!route.zone || route.zone === 'Unknown') ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {(() => {
                                                                    if (route.zone && route.zone !== 'Unknown') return route.zone;
                                                                    const trimmedWard = String(route.ward).trim();
                                                                    const foundWard = wards.find(w => 
                                                                        w.name.toLowerCase().trim() === trimmedWard.toLowerCase() ||
                                                                        (trimmedWard.length <= 3 && w.name.startsWith(trimmedWard.padStart(2, '0') + '-')) ||
                                                                        w.name.toLowerCase().includes(trimmedWard.toLowerCase())
                                                                    );
                                                                    return foundWard ? (foundWard.zoneName || foundWard.zone) : 'Unknown';
                                                                })()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{route.ward}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {(() => {
                                                            const assignedVehicles = allVehicles.filter(v => {
                                                                const routeStr = v.allAssignedRoutes || v.assignedRouteId || '';
                                                                if (!routeStr) return false;
                                                                const routes = routeStr.toString().split(/[;,]/).map((r: string) => r.trim());
                                                                return routes.includes(route.routeId || '');
                                                            });
                                                            
                                                            if (assignedVehicles.length === 0) return <span className="text-[10px] text-gray-400 font-bold uppercase italic">No Vehicles</span>;
                                                            
                                                            return (
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black rounded-full shadow-sm shadow-orange-500/20">
                                                                            {assignedVehicles.length}
                                                                        </span>
                                                                        <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">Linked</span>
                                                                    </div>
                                                                    <p className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]" title={assignedVehicles.map(v => v.plateNumber || v.name).join(', ')}>
                                                                        {assignedVehicles.map(v => v.plateNumber || v.name).join(', ')}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full w-fit uppercase">
                                                                {stats.paths} Paths
                                                            </span>
                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full w-fit uppercase">
                                                                {stats.nodes} Nodes
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleViewOnMap(route)}
                                                                className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl"
                                                            >
                                                                <MapIcon size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(route.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RouteMasterPage;
