import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, FileText, Trash2, CheckCircle, XCircle, 
    RefreshCw, Map as MapIcon, Plus, Info, Layers, 
    ChevronRight, Save, X, AlertCircle
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAllAdminData, createAdminData, deleteAdminData, updateAdminData, createLargeDocument } from '../../services/databaseService';
import toGeoJSON from '@mapbox/togeojson';

interface MapLayer {
    id: string;
    name: string;
    description: string;
    type: 'kml' | 'geojson';
    data: any; // GeoJSON string (re-assembled if chunked)
    isChunked?: boolean;
    featureCount?: number;
    active: boolean;
    createdAt: any;
}

const MapLayersPage = () => {
    const [layers, setLayers] = useState<MapLayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newLayer, setNewLayer] = useState({
        name: '',
        description: '',
        file: null as File | null
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLayers();
    }, []);

    const fetchLayers = async () => {
        setLoading(true);
        const result = await getAllAdminData('mapLayers');
        if (result.success) {
            setLayers(result.data as MapLayer[]);
        }
        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.name.endsWith('.kml') || file.name.endsWith('.geojson')) {
                setNewLayer({ ...newLayer, file });
                setError(null);
            } else {
                setError('Please upload a .kml or .geojson file');
            }
        }
    };

    const handleUpload = async () => {
        if (!newLayer.name || !newLayer.file) {
            setError('Please provide a name and select a file');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target?.result as string;
                let geojsonData;

                if (newLayer.file!.name.endsWith('.kml')) {
                    const parser = new DOMParser();
                    const kmlDoc = parser.parseFromString(content, 'text/xml');
                    geojsonData = toGeoJSON.kml(kmlDoc);
                } else {
                    geojsonData = JSON.parse(content);
                }

                const featureCount = geojsonData.features?.length || 0;

                const layerData = {
                    name: newLayer.name,
                    description: newLayer.description,
                    type: newLayer.file!.name.endsWith('.kml') ? 'kml' : 'geojson',
                    data: JSON.stringify(geojsonData),
                    featureCount: featureCount,
                    active: true
                };

                // Use createLargeDocument which handles chunking if content > 1MB
                const result = await createLargeDocument('mapLayers', layerData, 'data');
                
                if (result.success) {
                    setShowUploadModal(false);
                    setNewLayer({ name: '', description: '', file: null });
                    fetchLayers();
                } else {
                    setError('Failed to save layer: ' + result.error);
                }
                setUploading(false);
            };
            reader.readAsText(newLayer.file);
        } catch (err: any) {
            setError('Error processing file: ' + err.message);
            setUploading(false);
        }
    };

    const toggleLayerStatus = async (layer: MapLayer) => {
        const result = await updateAdminData('mapLayers', layer.id, { active: !layer.active });
        if (result.success) {
            setLayers(layers.map(l => l.id === layer.id ? { ...l, active: !l.active } : l));
        }
    };

    const handleDeleteLayer = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this layer?')) {
            const result = await deleteAdminData('mapLayers', id);
            if (result.success) {
                setLayers(layers.filter(l => l.id !== id));
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
            <div className="flex justify-between items-start">
                <div>
                    <PageHeader 
                        title="Map Layers Management" 
                        description="Upload and manage KML/GeoJSON boundaries for map overlays." 
                    />
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-sm"
                >
                    <Plus size={18} />
                    Add New Layer
                </button>
            </div>

            {/* Layers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <RefreshCw size={40} className="animate-spin text-emerald-500 opacity-50" />
                    </div>
                ) : layers.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-gray-800 rounded-3xl p-20 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-full mb-6">
                            <Layers size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Map Layers Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                            Upload KML or GeoJSON files to define ward boundaries, zones, or other geographical landmarks.
                        </p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="mt-8 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
                        >
                            <Upload size={18} />
                            Upload First Layer
                        </button>
                    </div>
                ) : (
                    layers.map((layer) => (
                        <motion.div
                            key={layer.id}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${layer.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                                        <MapIcon size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => toggleLayerStatus(layer)}
                                            className={`p-2 rounded-xl transition-all ${layer.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:text-emerald-500'}`}
                                            title={layer.active ? 'Disable Layer' : 'Enable Layer'}
                                        >
                                            {layer.active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteLayer(layer.id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                            title="Delete Layer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight mb-1">{layer.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">{layer.description || 'No description provided.'}</p>
                                
                                <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded uppercase tracking-widest">
                                            {layer.type}
                                        </span>
                                        <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded uppercase tracking-widest">
                                            {layer.featureCount !== undefined ? (
                                                `${layer.featureCount} Features`
                                            ) : (
                                                (() => {
                                                    try {
                                                        const d = typeof layer.data === 'string' ? JSON.parse(layer.data) : layer.data;
                                                        return (d.features?.length || 0) + ' Features';
                                                    } catch (e) {
                                                        return '0 Features';
                                                    }
                                                })()
                                            )}
                                        </span>

                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {layer.createdAt?.toDate ? layer.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Upload Map Layer</h2>
                                    <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <X size={24} className="text-gray-400" />
                                    </button>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Layer Name</label>
                                        <input
                                            type="text"
                                            value={newLayer.name}
                                            onChange={(e) => setNewLayer({ ...newLayer, name: e.target.value })}
                                            placeholder="e.g. Ward Boundaries 2024"
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-gray-800 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Description</label>
                                        <textarea
                                            value={newLayer.description}
                                            onChange={(e) => setNewLayer({ ...newLayer, description: e.target.value })}
                                            placeholder="Optional description of the boundaries..."
                                            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-gray-800 dark:text-white h-24 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Upload File (.kml, .geojson)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept=".kml,.geojson"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className={`
                                                w-full px-5 py-10 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center gap-4
                                                ${newLayer.file 
                                                    ? 'bg-emerald-50/50 border-emerald-500/30' 
                                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 group-hover:border-emerald-500/30 group-hover:bg-emerald-50/10'}
                                            `}>
                                                <div className={`p-4 rounded-full ${newLayer.file ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                                    <Upload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">
                                                        {newLayer.file ? newLayer.file.name : 'Click or Drag File'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                                        Max size 10MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading || !newLayer.file || !newLayer.name}
                                        className={`
                                            flex-2 py-4 px-8 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                            ${uploading || !newLayer.file || !newLayer.name
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105'}
                                        `}
                                    >
                                        {uploading ? (
                                            <RefreshCw size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save Layer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MapLayersPage;
