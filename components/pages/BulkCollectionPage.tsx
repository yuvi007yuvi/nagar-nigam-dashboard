import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Download, MapPin,
    CheckCircle, XCircle, Clock, AlertTriangle, User,
    Save, Plus, FileText, ChevronDown, Calendar,
    RefreshCw, Camera, QrCode, Trash2, Edit, X,
    Image as ImageIcon, ArrowRight, ArrowLeft, Building2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import KMLLayers from '../shared/KMLLayers';
import PageHeader from '../shared/PageHeader';
import { useData } from '../../services/DataContext';
import { createAdminData, getAllAdminData, updateAdminData, deleteAdminData, createBulkCollection } from '../../services/databaseService';
import { auth } from '../../services/firebaseConfig';

const BulkCollectionPage = () => {
    const { bulkCollections, refreshData, zones, wards } = useData();
    const currentUser = auth.currentUser;
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'reports'
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [qrModalSite, setQrModalSite] = useState<any>(null);
    const [bulkSites, setBulkSites] = useState<any[]>([]);
    const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
    const [filterZone, setFilterZone] = useState('All');
    const [filterWard, setFilterWard] = useState('All');
    
    // Collection workflow state
    const [collectionStep, setCollectionStep] = useState(1);
    const [selectedSite, setSelectedSite] = useState<any>(null);
    const [beforeImage, setBeforeImage] = useState<string | null>(null);
    const [afterImage, setAfterImage] = useState<string | null>(null);
    const [fillLevel, setFillLevel] = useState(50);
    const [feedback, setFeedback] = useState('');


    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        const result = await getAllAdminData('bulk_collection_sites');
        if (result.success) {
            setBulkSites(result.data);
        }
    };


    const handleSubmitCollection = async () => {
        if (!selectedSite || !beforeImage || !afterImage) return;
        setLoading(true);
        const result = await createBulkCollection({
            siteId: selectedSite.siteId,
            siteName: selectedSite.name,
            qr: selectedSite.siteId,
            createdAt: new Date(),
            beforeImage: beforeImage,
            afterImage: afterImage,
            fillLevel: fillLevel,
            feedback: feedback,
            ward: selectedSite.ward,
            supervisor: selectedSite.supervisor || currentUser?.displayName || 'Unknown',
            sid: currentUser?.uid || 'N/A'
        });

        if (result.success) {
            refreshData();
            setIsCollectionModalOpen(false);
            resetWorkflow();
        }
        setLoading(false);
    };

    const resetWorkflow = () => {
        setCollectionStep(1);
        setSelectedSite(null);
        setBeforeImage(null);
        setAfterImage(null);
        setFillLevel(50);
        setFeedback('');
    };

    const handleExportCSV = () => {
        if (bulkCollections.length === 0) return;
        
        const headers = ['Site Name', 'Ward', 'Fill Level', 'Timestamp', 'Supervisor', 'Feedback'];
        const rows = bulkCollections.map((col: any) => [
            col.siteName,
            col.ward,
            `${col.fillLevel}%`,
            col.createdAt?.toDate ? col.createdAt.toDate().toLocaleString() : 'N/A',
            col.supervisor,
            col.feedback?.replace(/,/g, ';') || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Bulk_Collection_Report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const summaryCards = [
        { title: 'Today', total: 40, unique: 40, tat: '1030 m', color: 'bg-purple-500', icon: Calendar },
        { title: 'Yesterday', total: 44, unique: 44, tat: '1231 m', color: 'bg-pink-500', icon: Calendar },
        { title: 'Till Month', total: 262, unique: 63, tat: '8525 m', color: 'bg-green-500', icon: Calendar },
        { title: 'Previous Month', total: 1143, unique: 64, tat: '46815 m', color: 'bg-emerald-500', icon: Calendar },
    ];

    const collectionTypes = [
        { label: 'Hawker', color: '#ff0000' },
        { label: 'Dhalao Ghar', color: '#00ff00' },
        { label: 'Refuse Compactor', color: '#0000ff' },
        { label: 'Parking', color: '#ffff00' },
        { label: 'Dump Site', color: '#ff00ff' },
        { label: 'FCTS', color: '#00ffff' },
        { label: 'Underground Dustbin', color: '#ffa500' },
        { label: 'Dustbin', color: '#800080' },
        { label: 'Mechanised Urinal / Toilet Cleaning', color: '#008000' },
    ];

    return (
        <div className="space-y-6 p-4 bg-gray-50/50 min-h-screen">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                <span className="hover:underline cursor-pointer">Home</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Bulk Collection</span>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col p-5 group hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl ${card.color} text-white shadow-lg shadow-${card.color.split('-')[1]}-200`}>
                                <card.icon size={20} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{card.title}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-500">Total Scans</span>
                                <span className="text-blue-900">{card.total}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-500">Unique Scans</span>
                                <span className="text-blue-900">{card.unique}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="text-gray-500">TAT</span>
                                <span className="text-blue-900">{card.tat}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <button className="text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 uppercase tracking-widest">
                                View More <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Collection Types Legend */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm text-[11px] font-bold text-gray-700">
                <span className="text-gray-500 uppercase tracking-widest text-[10px]">Bulk Collection Types:</span>
                {collectionTypes.map((type, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: type.color }}></div>
                        {type.label}
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Tabs & Controls Header */}
                <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center bg-white gap-4">
                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Analytics Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Collection Reports
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {activeTab === 'analytics' && (
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setMapType('street')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${mapType === 'street' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                > Street </button>
                                <button 
                                    onClick={() => setMapType('satellite')}
                                    className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${mapType === 'satellite' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                                > Satellite </button>
                            </div>
                        )}
                        <button 
                            onClick={() => setIsCollectionModalOpen(true)}
                            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <Plus size={16} /> New Collection
                        </button>
                    </div>
                </div>

                <div className="relative min-h-[600px]">
                    {activeTab === 'analytics' ? (
                        <div className="h-[600px] w-full relative z-0">
                            <MapContainer center={[27.4924, 77.6737]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url={mapType === 'street' ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'}
                                />
                                <KMLLayers visible={true} />
                                {/* Markers for collection sites */}
                                {bulkSites.map(site => (
                                    <Marker key={site.id} position={[27.4924 + (Math.random() - 0.5) * 0.1, 77.6737 + (Math.random() - 0.5) * 0.1]}>
                                        <Popup>
                                            <div className="p-2">
                                                <h3 className="font-bold">{site.name}</h3>
                                                <p className="text-xs text-gray-500">{site.address}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="flex flex-wrap items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filters:</span>
                                </div>
                                <select
                                    value={filterZone}
                                    onChange={(e) => {
                                        setFilterZone(e.target.value);
                                        setFilterWard('All');
                                    }}
                                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 rounded-lg outline-none"
                                >
                                    <option value="All">All Zones</option>
                                    {zones.map((z: any) => <option key={z.id} value={z.name}>{z.name}</option>)}
                                </select>
                                <select
                                    value={filterWard}
                                    onChange={(e) => setFilterWard(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 rounded-lg outline-none"
                                    disabled={filterZone === 'All'}
                                >
                                    <option value="All">All Wards</option>
                                    {wards
                                        .filter((w: any) => w.zoneName === filterZone)
                                        .map((w: any) => <option key={w.id} value={w.name}>{w.name}</option>)
                                    }
                                </select>
                                <button 
                                    onClick={handleExportCSV}
                                    className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all"
                                >
                                    <Download size={14} /> Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Site Details</th>
                                            <th className="px-6 py-4 text-center">Images (Before/After)</th>
                                            <th className="px-6 py-4">Fill Level</th>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bulkCollections
                                            .filter((col: any) => {
                                                const zoneMatch = filterZone === 'All' || col.zone === filterZone;
                                                const wardMatch = filterWard === 'All' || col.ward === filterWard;
                                                return zoneMatch && wardMatch;
                                            })
                                            .map((col: any) => (
                                                <tr key={col.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                <Building2 size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{col.siteName}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{col.ward}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <img src={col.beforeImage} className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm ring-1 ring-gray-100" />
                                                            <ArrowRight size={14} className="text-gray-300" />
                                                            <img src={col.afterImage} className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm ring-1 ring-gray-100" />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className={`h-full ${col.fillLevel > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${col.fillLevel}%` }}></div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-700">{col.fillLevel}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                                                        {col.createdAt?.toDate ? col.createdAt.toDate().toLocaleString() : 'Just now'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black uppercase tracking-widest">Verified</span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collection Workflow Modal */}
            <AnimatePresence>
                {isCollectionModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 bg-blue-600 text-white">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg uppercase tracking-widest text-sm flex items-center gap-2">
                                        <QrCode size={18} /> Collection Entry
                                    </h3>
                                    <button onClick={() => setIsCollectionModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                                </div>
                                <div className="flex gap-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-500" style={{ width: `${(collectionStep / 3) * 100}%` }}></div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-3 opacity-80 text-center">Step {collectionStep} of 3</p>
                            </div>

                            <div className="p-6">
                                {collectionStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center py-4">
                                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                                                <QrCode size={32} />
                                            </div>
                                            <h4 className="font-bold text-gray-800">Identify Site</h4>
                                            <p className="text-xs text-gray-500 mt-1">Scan QR code or select from the list</p>
                                        </div>
                                        <div className="space-y-3">
                                            {bulkSites.map(site => (
                                                <button 
                                                    key={site.id}
                                                    onClick={() => { setSelectedSite(site); setCollectionStep(2); }}
                                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedSite?.id === site.id ? 'border-blue-500 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-blue-200'}`}
                                                >
                                                    <p className="font-bold text-gray-800 text-sm">{site.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{site.siteId}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {collectionStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h4 className="font-bold text-gray-800">Before Collection</h4>
                                            <p className="text-xs text-gray-500 mt-1">Capture evidence and fill level</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group">
                                                {beforeImage ? (
                                                    <img src={beforeImage} className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <Camera size={32} className="text-gray-400 mb-2" />
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to Capture</p>
                                                    </>
                                                )}
                                                <input type="file" accept="image/*" capture="environment" onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setBeforeImage(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <div className="space-y-2 px-2">
                                                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase">
                                                    <span>Fill Level</span>
                                                    <span className="text-blue-600">{fillLevel}% Full</span>
                                                </div>
                                                <input type="range" className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-blue-600 cursor-pointer" value={fillLevel} onChange={e => setFillLevel(parseInt(e.target.value))} />
                                            </div>
                                            <button onClick={() => setCollectionStep(3)} disabled={!beforeImage} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 disabled:opacity-50 transition-all">Next: Take After Image</button>
                                        </div>
                                    </div>
                                )}

                                {collectionStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h4 className="font-bold text-gray-800">After Collection</h4>
                                            <p className="text-xs text-gray-500 mt-1">Capture cleaning verification</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group">
                                                {afterImage ? (
                                                    <img src={afterImage} className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <Camera size={32} className="text-gray-400 mb-2" />
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to Capture</p>
                                                    </>
                                                )}
                                                <input type="file" accept="image/*" capture="environment" onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setAfterImage(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <textarea 
                                                placeholder="Supervisor notes..."
                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm min-h-[100px] resize-none"
                                                value={feedback}
                                                onChange={e => setFeedback(e.target.value)}
                                            />
                                            <button 
                                                onClick={handleSubmitCollection} 
                                                disabled={loading || !afterImage} 
                                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                {loading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                                Complete & Submit
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default BulkCollectionPage;
