import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    Calendar, 
    Truck, 
    MapPin, 
    Play, 
    CheckCircle, 
    AlertCircle, 
    ChevronRight,
    Search,
    Route as RouteIcon,
    History
} from 'lucide-react';
import { useData } from '../../services/DataContext';
import { db } from '../../services/firebaseConfig';
import { 
    collection, query, where, getDocs, addDoc, 
    Timestamp, writeBatch, doc 
} from 'firebase/firestore';
import PageHeader from '../shared/PageHeader';

// Helper to calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
};

const CoverageReRunPage = () => {
    const { customers, wards, zones } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedWard, setSelectedWard] = useState('All');
    const [selectedRoute, setSelectedRoute] = useState('All');
    const [selectedVehicle, setSelectedVehicle] = useState('All');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusLog, setStatusLog] = useState<{msg: string, type: 'info' | 'success' | 'error'}[]>([]);
    const [results, setResults] = useState<{total: number, newlyCovered: number} | null>(null);

    // Fetch vehicles on mount
    React.useEffect(() => {
        const fetchVehicles = async () => {
            setLoadingVehicles(true);
            try {
                const q = query(collection(db, 'vehicles'));
                const snap = await getDocs(q);
                const vList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setVehicles(vList);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoadingVehicles(false);
            }
        };
        fetchVehicles();
    }, []);

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setStatusLog(prev => [{ msg, type }, ...prev].slice(0, 50));
    };

    const handleRunAnalysis = async () => {
        if (!selectedDate) {
            alert('Please select a date for analysis.');
            return;
        }

        setIsRunning(true);
        setProgress(0);
        setStatusLog([]);
        setResults(null);
        
        const isGlobal = selectedWard === 'All' && (selectedRoute === '' || selectedRoute === 'All');
        
        addLog(`Starting ${isGlobal ? 'GLOBAL' : 'targeted'} analysis for Date: ${selectedDate}...`, 'info');
        if (selectedRoute && selectedRoute !== 'All') addLog(`Target: Route ${selectedRoute}`, 'info');
        else if (selectedWard !== 'All') addLog(`Target: Ward ${selectedWard}`, 'info');
        else addLog('Target: ALL Wards (Global Analysis)', 'info');

        try {
            // 1. Fetch GPS History for ALL vehicles for the day
            addLog(`Fetching all GPS history snapshots for the day...`, 'info');
            const historyQuery = query(
                collection(db, 'vehicle_history_snapshots'),
                where('day', '==', selectedDate)
            );
            const historySnap = await getDocs(historyQuery);
            
            const historyPoints: {lat: number, lng: number, timestamp: any, vId: string}[] = [];
            historySnap.forEach(doc => {
                const data = doc.data();
                data.vehicles?.forEach((v: any) => {
                    if (v.lat && v.lng) {
                        historyPoints.push({
                            lat: parseFloat(v.lat),
                            lng: parseFloat(v.lng),
                            timestamp: data.timestamp,
                            vId: v.plateNumber || v.name || v.imei
                        });
                    }
                });
            });

            if (historyPoints.length === 0) {
                throw new Error('No GPS history found for any vehicle on the selected date.');
            }
            addLog(`Found ${historyPoints.length} total GPS trail points. Filtering POIs...`, 'success');

            // 2. Filter POIs to analyze
            let targetPOIs = customers;
            if (selectedRoute !== 'All' && selectedRoute !== '') {
                targetPOIs = targetPOIs.filter(p => p.routeId === selectedRoute);
            } else if (selectedWard !== 'All') {
                targetPOIs = targetPOIs.filter(p => p.ward === selectedWard);
            }

            if (targetPOIs.length === 0) {
                throw new Error('No POIs found matching the selected filters.');
            }
            addLog(`Analyzing ${targetPOIs.length} POIs against all vehicle trails...`, 'info');

            // 3. Proximity Analysis
            let coveredCount = 0;
            const thresholdMeters = 15; // Tightened from 50m to 15m for precision
            const batch = writeBatch(db);
            let batchCount = 0;

            for (let i = 0; i < targetPOIs.length; i++) {
                const poi = targetPOIs[i];
                if (!poi.lat || !poi.lng) continue;

                setProgress(Math.round(((i + 1) / targetPOIs.length) * 100));

                // Find ANY vehicle point near this POI
                const matchingPoint = historyPoints.find(pt => {
                    const dist = calculateDistance(poi.lat, poi.lng, pt.lat, pt.lng);
                    return dist <= thresholdMeters;
                });

                if (matchingPoint) {
                    try {
                        const newRecordRef = doc(collection(db, 'coverageRecords'));
                        batch.set(newRecordRef, {
                            customerId: poi.customerId || poi.id,
                            customerName: poi.name || poi.ownerName || 'Unknown',
                            vehicleId: matchingPoint.vId, // The specific vehicle that covered it
                            ward: poi.ward,
                            zone: poi.zone,
                            routeId: poi.routeId || selectedRoute,
                            status: 'Visited',
                            createdAt: matchingPoint.timestamp ? Timestamp.fromDate(new Date(matchingPoint.timestamp)) : Timestamp.now(),
                            isAutoReRun: true,
                            reRunType: selectedRoute ? 'Route-wise' : 'Ward-wise',
                            sourceDate: selectedDate
                        });
                        
                        coveredCount++;
                        batchCount++;
                        
                        if (batchCount >= 400) {
                            await batch.commit();
                            batchCount = 0;
                            addLog(`Committed ${coveredCount} records so far...`, 'success');
                        }
                    } catch (e) {
                        console.error('Error creating record:', e);
                    }
                }
            }

            if (batchCount > 0) await batch.commit();

            // Store Re-run activity logs in Firestore database
            try {
                await addDoc(collection(db, 'rerun_history'), {
                    date: selectedDate,
                    ward: selectedWard,
                    route: selectedRoute,
                    vehicle: selectedVehicle,
                    totalPOIs: targetPOIs.length,
                    newlyCovered: coveredCount,
                    timestamp: Timestamp.now(),
                    logs: statusLog.map(l => l.msg).reverse()
                });
                addLog('Analysis logs saved to database history.', 'success');
            } catch (saveError: any) {
                console.error('Error saving rerun logs:', saveError);
            }

            addLog(`Re-run complete! ${coveredCount} POIs were successfully updated.`, 'success');
            setResults({ total: targetPOIs.length, newlyCovered: coveredCount });

        } catch (error: any) {
            addLog(error.message, 'error');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Coverage Analysis Re-run" 
                description="Fix missing coverage by re-analyzing historical GPS data against POI locations."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <History className="text-emerald-500" size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">Analysis Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Analysis Mode</p>
                                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                    This tool will scan <span className="text-emerald-500 font-bold">all vehicles</span> that moved on the selected day to find missed coverage.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ward</label>
                                    <select 
                                        value={selectedWard}
                                        onChange={(e) => setSelectedWard(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none"
                                    >
                                        <option value="All">All Wards</option>
                                        {wards.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Route ID</label>
                                    <input 
                                        type="text"
                                        placeholder="Optional..."
                                        value={selectedRoute}
                                        onChange={(e) => setSelectedRoute(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleRunAnalysis}
                            disabled={isRunning}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 ${
                                isRunning 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                            }`}
                        >
                            {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                            {isRunning ? 'Analyzing History...' : 'Start Coverage Re-run'}
                        </button>
                    </div>

                    {results && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <CheckCircle size={24} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Summary</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-3xl font-black">{results.newlyCovered}</h4>
                                <p className="text-[10px] font-bold uppercase opacity-80">New Coverage Records Created</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/20 text-[10px] font-bold">
                                Analyzed {results.total} points on Route {selectedRoute || 'All'}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Status & Logs Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">Processing Logs</h3>
                            </div>
                            {isRunning && (
                                <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full text-[10px] font-black animate-pulse">
                                    {progress}% Complete
                                </div>
                            )}
                        </div>

                        {isRunning && (
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-6">
                                <motion.div 
                                    className="bg-emerald-500 h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        )}

                        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 font-mono text-[11px] overflow-y-auto max-h-[500px] border border-gray-100 dark:border-gray-700">
                            {statusLog.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <Search size={32} strokeWidth={1.5} />
                                    <p className="font-bold uppercase tracking-widest text-[9px]">No logs generated yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {statusLog.map((log, i) => (
                                        <div key={i} className={`flex gap-3 py-1 border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                                            log.type === 'error' ? 'text-red-500' : 
                                            log.type === 'success' ? 'text-emerald-500' : 
                                            'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            <span className="opacity-40">{new Date().toLocaleTimeString([], { hour12: false })}</span>
                                            <span className="font-bold">{log.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverageReRunPage;
