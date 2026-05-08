import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    X, 
    Truck, 
    Database,
    RefreshCw,
    Download
} from 'lucide-react';
import Papa from 'papaparse';
import { db } from '../../services/firebaseConfig';
import { collection, query, where, getDocs, writeBatch, doc, Timestamp } from 'firebase/firestore';
import PageHeader from '../shared/PageHeader';

const BulkVehicleUploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
    const [stats, setStats] = useState({ total: 0, updated: 0, created: 0, failed: 0 });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setData(results.data);
                    setStatus({ msg: `Parsed ${results.data.length} vehicles. Ready to upload.`, type: 'info' });
                }
            });
        }
    };

    const handleUpload = async () => {
        if (data.length === 0) return;
        setIsUploading(true);
        setStatus({ msg: 'Processing bulk assignment...', type: 'info' });
        
        let updated = 0;
        let created = 0;
        let failed = 0;

        const batch = writeBatch(db);
        const vehiclesRef = collection(db, 'vehicles');

        try {
            // Process in chunks of 500 (Firestore limit)
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const plateNumber = row['Vehicle Number']?.trim();
                if (!plateNumber) {
                    failed++;
                    continue;
                }

                // Find existing vehicle by plate number
                const q = query(vehiclesRef, where('plateNumber', '==', plateNumber));
                const snap = await getDocs(q);

                const vehicleData = {
                    plateNumber,
                    ward: row['Ward'] || '',
                    assignedRouteId: row['Route']?.split(';')[0]?.trim() || '', // Use first route if multiple
                    allAssignedRoutes: row['Route'] || '', // Keep full string for reference
                    driverName: row['Driver Name'] || '',
                    driverPhone: row['Driver Number'] || '',
                    type: row['Vehicle Type'] || '',
                    fuelType: row['Fuel Type'] || '',
                    updatedAt: Timestamp.now()
                };

                if (!snap.empty) {
                    // Update existing
                    const docRef = doc(db, 'vehicles', snap.docs[0].id);
                    batch.update(docRef, vehicleData);
                    updated++;
                } else {
                    // Skip if vehicle doesn't exist in master
                    failed++;
                }

                // Commit batch every 400 docs to be safe
                if ((updated + created + failed) % 400 === 0) {
                    await batch.commit();
                }
            }

            await batch.commit();
            setStatus({ msg: `Successfully processed ${updated + created} vehicles.`, type: 'success' });
            setStats({ total: data.length, updated, created, failed });
        } catch (error: any) {
            console.error('Upload error:', error);
            setStatus({ msg: `Error: ${error.message}`, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Bulk Vehicle Assignment" 
                description="Upload CSV to bulk update vehicle-route mapping, driver details, and ward assignments."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500">
                                <Upload size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tight">Select CSV File</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Upload the Vehicles.csv file with route assignments</p>
                            </div>

                            <div className="w-full relative group">
                                <input 
                                    type="file" 
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl group-hover:border-emerald-400 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/10 transition-all flex flex-col items-center justify-center gap-2">
                                    <FileText className="text-gray-400" size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {file ? file.name : 'Click to Browse'}
                                    </span>
                                </div>
                            </div>

                            <AnimatePresence>
                                {status && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`w-full p-4 rounded-2xl flex items-start gap-3 ${
                                            status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}
                                    >
                                        {status.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                                        <p className="text-xs font-bold leading-tight">{status.msg}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleUpload}
                                disabled={data.length === 0 || isUploading}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 ${
                                    isUploading || data.length === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                                }`}
                            >
                                {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Database size={18} />}
                                {isUploading ? 'Uploading...' : 'Process Assignments'}
                            </button>
                        </div>
                    </div>

                    {stats.total > 0 && (
                        <div className="bg-gray-900 rounded-3xl p-6 text-white space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Processing Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">{stats.updated}</p>
                                    <p className="text-[9px] font-bold uppercase text-emerald-400 tracking-widest">Updated</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">{stats.created}</p>
                                    <p className="text-[9px] font-bold uppercase text-blue-400 tracking-widest">Created</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">{stats.failed}</p>
                                    <p className="text-[9px] font-bold uppercase text-red-400 tracking-widest">Failed/Empty</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black">{stats.total}</p>
                                    <p className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Total Rows</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-2">
                                <Truck className="text-emerald-500" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-white">Data Preview</h3>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {data.length} Rows Parsed
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-auto">
                            {data.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Vehicle</th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Ward</th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Route</th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Driver</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {data.slice(0, 50).map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-[11px] font-black text-gray-800 dark:text-white">{row['Vehicle Number']}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{row['Ward']}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{row['Route']}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-gray-800 dark:text-white">{row['Driver Name']}</span>
                                                        <span className="text-[9px] font-medium text-gray-400">{row['Driver Number']}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 py-20">
                                    <FileText size={48} strokeWidth={1} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No file selected for preview</p>
                                </div>
                            )}
                        </div>
                        {data.length > 50 && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 dark:border-gray-800">
                                Showing first 50 rows only
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkVehicleUploadPage;
