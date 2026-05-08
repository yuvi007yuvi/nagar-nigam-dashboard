import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Polygon, Marker, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { 
    Plus, Trash2, MapPin, Navigation, Save, X, 
    Layers, Search, Edit, Map as MapIcon, 
    Shield, Info, AlertCircle, CheckCircle,
    CircleParking, RotateCcw, MousePointer2, 
    Pencil, Upload, ChevronDown, Satellite
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAllAdminData, createAdminData, deleteAdminData, updateAdminData } from '../../services/databaseService';
import { useData } from '../../services/DataContext';

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

interface Location {
    id: string;
    name: string;
    type: 'Parking' | 'Dump';
    subType?: string;
    latitude?: string;
    longitude?: string;
    coordinates?: any; // For polygons (Array of latlngs)
    zone?: string;
    ward?: string;
    status: 'Active' | 'Disabled';
    createdAt: any;
}

// Geoman Helper Component
const GeomanControls = ({ onCreated, onEdited, activeMode }: any) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        map.pm.addControls({
            position: 'topleft',
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawCircle: false,
            drawText: false,
            cutPolygon: false,
            rotateMode: false,
        });

        map.on('pm:create', (e: any) => {
            const layer = e.layer;
            if (e.shape === 'Polygon') {
                const latlngs = layer.getLatLngs()[0].map((ll: any) => ({ lat: ll.lat, lng: ll.lng }));
                onCreated(latlngs, 'Polygon');
            } else if (e.shape === 'Marker') {
                const ll = layer.getLatLng();
                onCreated({ lat: ll.lat, lng: ll.lng }, 'Marker');
            }
            // Remove the layer after getting data, we'll render it ourselves through state
            map.removeLayer(layer);
        });

        return () => {
            map.pm.removeControls();
            map.off('pm:create');
        };
    }, [map, onCreated]);

    useEffect(() => {
        if (!map) return;
        if (activeMode === 'draw-polygon') {
            map.pm.enableDraw('Polygon');
        } else if (activeMode === 'draw-marker') {
            map.pm.enableDraw('Marker');
        } else {
            map.pm.disableDraw();
        }
    }, [activeMode, map]);

    return null;
};

const ParkingDumpMasterPage = () => {
    const { zones, wards } = useData();
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Parking' | 'Dump'>('Parking');
    const [searchTerm, setSearchTerm] = useState('');
    const [mapMode, setMapMode] = useState<'view' | 'draw-polygon' | 'draw-marker'>('view');
    const [selectedLocationId, setSelectedLocationId] = useState<string>('');
    const [mapType, setMapType] = useState<'street' | 'satellite'>('satellite');
    const [visibleLayers, setVisibleLayers] = useState({
        parking: true,
        dump: true
    });

    const [formData, setFormData] = useState({
        name: '',
        type: 'Parking' as 'Parking' | 'Dump',
        latitude: '',
        longitude: '',
        coordinates: [] as any[],
        zone: '',
        ward: '',
        status: 'Active' as 'Active' | 'Disabled'
    });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setLoading(true);
        const result = await getAllAdminData('parking_dump_locations');
        if (result.success) {
            setLocations(result.data as Location[]);
        }
        setLoading(false);
    };

    const handleLocationSelect = (id: string) => {
        setSelectedLocationId(id);
        const loc = locations.find(l => l.id === id);
        if (loc) {
            setFormData({
                name: loc.name,
                type: loc.type,
                latitude: loc.latitude || '',
                longitude: loc.longitude || '',
                coordinates: Array.isArray(loc.coordinates) ? loc.coordinates : [],
                zone: loc.zone || '',
                ward: loc.ward || '',
                status: loc.status || 'Active'
            });
            setActiveTab(loc.type);
        }
    };

    const handleCreated = (data: any, shape: string) => {
        if (shape === 'Polygon') {
            setFormData(prev => ({ 
                ...prev, 
                coordinates: data,
                latitude: data[0].lat.toString(),
                longitude: data[0].lng.toString()
            }));
        } else {
            setFormData(prev => ({ 
                ...prev, 
                latitude: data.lat.toString(), 
                longitude: data.lng.toString(),
                coordinates: []
            }));
        }
        setMapMode('view');
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert("Please enter a name");
            return;
        }

        setLoading(true);
        try {
            if (selectedLocationId && selectedLocationId !== 'new') {
                await updateAdminData('parking_dump_locations', selectedLocationId, formData);
            } else {
                await createAdminData('parking_dump_locations', {
                    ...formData,
                    type: activeTab,
                    createdAt: new Date().toISOString()
                });
            }
            setSelectedLocationId('');
            setFormData({
                name: '',
                type: activeTab,
                latitude: '',
                longitude: '',
                coordinates: [],
                zone: '',
                ward: '',
                status: 'Active'
            });
            fetchLocations();
        } catch (error) {
            console.error("Error saving location:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLocationId) return;
        if (window.confirm('Are you sure you want to delete this location?')) {
            setLoading(true);
            await deleteAdminData('parking_dump_locations', selectedLocationId);
            setSelectedLocationId('');
            fetchLocations();
        }
    };

    const filteredLocations = locations.filter(loc => loc.type === activeTab);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            <PageHeader 
                title="Municipal Asset Management" 
                description="Interactive map-based tool for defining dump sites and parking geofences." 
            />

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 flex flex-col gap-4 overflow-y-auto">
                    {/* Mode Selector */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start with</p>
                        
                        <button 
                            onClick={() => {
                                setSelectedLocationId('new');
                                setFormData({
                                    name: '', type: activeTab, latitude: '', longitude: '', coordinates: [], zone: '', ward: '', status: 'Active'
                                });
                                setMapMode(activeTab === 'Parking' ? 'draw-polygon' : 'draw-marker');
                            }}
                            className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${selectedLocationId === 'new' ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-500/10' : 'bg-gray-50 border-gray-100 hover:border-blue-200'}`}
                        >
                            <div className={`p-2 rounded-xl ${selectedLocationId === 'new' ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                                <Plus size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Draw {activeTab} Site</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Define boundaries on the map.</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setMapMode('view')}
                            className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${selectedLocationId !== 'new' && selectedLocationId ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : 'bg-gray-50 border-gray-100 hover:border-emerald-200'}`}
                        >
                            <div className={`p-2 rounded-xl ${selectedLocationId !== 'new' && selectedLocationId ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                                <Edit size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-800 uppercase tracking-tight">Edit Existing {activeTab}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Update saved site data.</p>
                            </div>
                        </button>
                    </div>

                    {/* Site Selection & Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex-1 space-y-6">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('Parking')}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Parking' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Parking
                            </button>
                            <button 
                                onClick={() => setActiveTab('Dump')}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Dump' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                Dump
                            </button>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select {activeTab} Site</label>
                            <div className="relative">
                                <select 
                                    value={selectedLocationId}
                                    onChange={(e) => handleLocationSelect(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm appearance-none outline-none focus:ring-4 focus:ring-blue-500/10"
                                >
                                    <option value="">Choose a site...</option>
                                    <option value="new">+ Create New</option>
                                    {filteredLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{activeTab} Site Name</label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter site name..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Latitude</label>
                                <input 
                                    type="text"
                                    value={formData.latitude}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-50 rounded-2xl font-mono text-[10px] text-gray-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Longitude</label>
                                <input 
                                    type="text"
                                    value={formData.longitude}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-50 rounded-2xl font-mono text-[10px] text-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                <button 
                                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'Active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    Active
                                </button>
                                <button 
                                    onClick={() => setFormData({ ...formData, status: 'Disabled' })}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'Disabled' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                                >
                                    Disabled
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'Parking' ? 'bg-blue-600 shadow-blue-500/20 hover:bg-blue-700' : 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700'}`}
                            >
                                <Upload size={18} />
                                {selectedLocationId && selectedLocationId !== 'new' ? 'Update Database' : 'Upload to Database'}
                            </button>
                            
                            {selectedLocationId && selectedLocationId !== 'new' && (
                                <button 
                                    onClick={handleDelete}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    Delete Site
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-inner relative group">
                    <MapContainer
                        center={[27.4924, 77.6737]}
                        zoom={13}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        <TileLayer
                            url={mapType === 'street' 
                                ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' 
                                : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'}
                        />
                        
                        <GeomanControls 
                            activeMode={mapMode}
                            onCreated={handleCreated}
                        />

                        {/* Render Active Site */}
                        {formData.coordinates.length > 0 && (
                            <Polygon 
                                positions={formData.coordinates.map((ll: any) => [ll.lat, ll.lng])}
                                color={activeTab === 'Parking' ? '#3b82f6' : '#10b981'}
                                fillOpacity={0.3}
                            />
                        )}
                        {formData.latitude && formData.longitude && formData.coordinates.length === 0 && (
                            <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                        )}

                        {/* Render Other Sites */}
                        {locations.filter(l => l.id !== selectedLocationId).map(loc => {
                            const isVisible = (loc.type === 'Parking' && visibleLayers.parking) || 
                                            (loc.type === 'Dump' && visibleLayers.dump);
                            
                            if (!isVisible) return null;

                            return loc.coordinates?.length > 0 ? (
                                <Polygon 
                                    key={loc.id}
                                    positions={loc.coordinates.map((ll: any) => [ll.lat, ll.lng])}
                                    color={loc.type === 'Parking' ? '#3b82f6' : '#10b981'}
                                    fillOpacity={0.1}
                                    weight={2}
                                    eventHandlers={{ click: () => handleLocationSelect(loc.id) }}
                                />
                            ) : (
                                <Marker 
                                    key={loc.id}
                                    position={[parseFloat(loc.latitude!), parseFloat(loc.longitude!)]}
                                    opacity={0.6}
                                    eventHandlers={{ click: () => handleLocationSelect(loc.id) }}
                                />
                            );
                        })}
                    </MapContainer>

                    {/* Map Controls Overlay */}
                    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                        <div className="bg-white p-1 rounded-xl shadow-lg border border-gray-100 flex overflow-hidden">
                            <button 
                                onClick={() => setMapType('street')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapType === 'street' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                Map
                            </button>
                            <button 
                                onClick={() => setMapType('satellite')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mapType === 'satellite' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                Satellite
                            </button>
                        </div>

                        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-100 space-y-1">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">Layers</p>
                            <button 
                                onClick={() => setVisibleLayers(prev => ({ ...prev, parking: !prev.parking }))}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${visibleLayers.parking ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${visibleLayers.parking ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-gray-300'}`} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Parking</span>
                            </button>
                            <button 
                                onClick={() => setVisibleLayers(prev => ({ ...prev, dump: !prev.dump }))}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${visibleLayers.dump ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${visibleLayers.dump ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Dump Sites</span>
                            </button>
                        </div>
                    </div>

                    {/* Drawing Helper Hint */}
                    {mapMode !== 'view' && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                            <MousePointer2 size={18} className="text-blue-400" />
                            <p className="text-xs font-black uppercase tracking-widest">
                                {mapMode === 'draw-polygon' ? 'Click on map to start drawing boundaries' : 'Click on map to set location'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParkingDumpMasterPage;
