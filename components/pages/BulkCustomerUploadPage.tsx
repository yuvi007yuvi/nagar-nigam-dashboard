import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Upload, FileText, Download, CheckCircle, AlertCircle, 
    X, Trash2, Database, Users, ArrowRight, Loader2,
    FileSpreadsheet, HelpCircle, Save, RefreshCw
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { db, auth } from '../../services/firebaseConfig';
import { collection, writeBatch, doc, getDocs, query, where } from 'firebase/firestore';
import { useData } from '../../services/DataContext';

import * as XLSX from 'xlsx';

interface CustomerData {
    customerId: string;
    name: string;
    propertyType: string;
    ward: string;
    phone: string;
    email: string;
    address?: string;
    kycStatus: 'Completed' | 'Pending';
    lat?: number;
    lng?: number;
    zone?: string;
    serviceStart?: string;
    kycDate?: string;
    supervisor?: string;
    gazetteRate?: number;
    revisedRate?: number;
    lastPayment?: string;
    bill?: string;
    dues?: number;
    routeId?: string;
}

const WARD_LIST = [
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

const ZONE_LIST = [
    "1-CITY", "2-BHUTESHWAR", "3-AURANGABAD", "4-VRINDAVAN"
];

const BulkCustomerUploadPage = () => {
    const { wards } = useData();
    const [file, setFile] = useState<File | null>(null);
    const [previewRows, setPreviewRows] = useState<CustomerData[]>([]);
    const [totalDetected, setTotalDetected] = useState(0);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'ready' | 'uploading' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [isRepairing, setIsRepairing] = useState(false);
    
    const fullDataRef = useRef<CustomerData[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const normalizeWard = (input: string) => {
        if (!input) return 'Unknown';
        const trimmed = input.trim();
        
        // 1. Direct match
        const directMatch = WARD_LIST.find(w => w.toLowerCase() === trimmed.toLowerCase());
        if (directMatch) return directMatch;
        
        // 2. Number match (if input is "1" or "01")
        const num = parseInt(trimmed);
        if (!isNaN(num)) {
            const paddedNum = num.toString().padStart(2, '0');
            const numMatch = WARD_LIST.find(w => w.startsWith(paddedNum + '-'));
            if (numMatch) return numMatch;
        }
        
        // 3. Name match (if input is "Birjapur")
        const nameMatch = WARD_LIST.find(w => w.toLowerCase().includes(trimmed.toLowerCase()));
        if (nameMatch) return nameMatch;
        
        return trimmed;
    };

    const normalizeZone = (input: string) => {
        if (!input) return '';
        const trimmed = input.trim();
        const match = ZONE_LIST.find(z => z.toLowerCase() === trimmed.toLowerCase());
        return match || trimmed;
    };

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setStatus('parsing');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) throw new Error('File is empty or invalid.');

                const mappedData: CustomerData[] = json.map((row, i) => {
                    const getValue = (keys: string[]) => {
                        const foundKey = Object.keys(row).find(k => 
                            keys.some(searchKey => k.toLowerCase().replace(/\s/g, '') === searchKey.toLowerCase().replace(/\s/g, ''))
                        );
                        return foundKey ? row[foundKey] : '';
                    };

                    const rawWard = String(getValue(['ward', 'wardno', 'wardname']) || '');
                    const normalizedWard = normalizeWard(rawWard);
                    const rawZone = String(getValue(['zone', 'zonename']) || '');
                    const normalizedZone = normalizeZone(rawZone);
                    const lat = parseFloat(getValue(['latitude', 'lat']));
                    const lng = parseFloat(getValue(['longitude', 'lng', 'long']));

                    // Fallback Zone Lookup from Ward
                    let finalZone = normalizedZone;
                    if (!finalZone && normalizedWard) {
                        const foundWard = wards.find(w => w.name === normalizedWard);
                        if (foundWard) finalZone = foundWard.zoneName || foundWard.zone || '';
                    }

                    return {
                        customerId: String(getValue(['custid', 'id', 'customerid']) || `CUST-${Date.now()}-${i}`),
                        name: String(getValue(['name', 'customername', 'ownername']) || 'Unknown'),
                        propertyType: String(getValue(['propertytype', 'type']) || 'Residential'),
                        ward: normalizedWard,
                        zone: finalZone,
                        phone: String(getValue(['mobile', 'phone', 'contact', 'mob', 'mobileno', 'mobilenumber', 'contactno', 'phoneno']) || ''),
                        email: String(getValue(['email']) || ''),
                        address: String(getValue(['address']) || ''),
                        kycStatus: (getValue(['kycstatus']) || 'Pending') as 'Completed' | 'Pending',
                        lat: isNaN(lat) ? undefined : lat,
                        lng: isNaN(lng) ? undefined : lng,
                        serviceStart: String(getValue(['servicestart']) || ''),
                        kycDate: String(getValue(['kycdate']) || ''),
                        supervisor: String(getValue(['supervisor']) || ''),
                        gazetteRate: parseFloat(getValue(['gazettemonthlyrate', 'gazetterate'])) || 0,
                        revisedRate: parseFloat(getValue(['revisedmonthlyrate', 'revisedrate'])) || 0,
                        routeId: String(getValue(['routeid', 'route', 'routecode']) || ''),
                        lastPayment: String(getValue(['lastpayment']) || ''),
                        bill: String(getValue(['bill']) || ''),
                        dues: parseFloat(getValue(['dues'])) || 0
                    };
                });
                
                fullDataRef.current = mappedData;
                setTotalDetected(mappedData.length);
                setPreviewRows(mappedData.slice(0, 100));
                setStatus('ready');
            } catch (err: any) {
                console.error('Parsing error:', err);
                setErrorMsg(err.message || 'Failed to parse file.');
                setStatus('error');
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleUpload = async () => {
        const data = fullDataRef.current;
        if (data.length === 0) return;
        
        setStatus('uploading');
        setProgress(0);
        setUploadedCount(0);
        
        const batchSize = 100;
        const total = data.length;
        
        try {
            for (let i = 0; i < total; i += batchSize) {
                if (i % 500 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }

                const batch = writeBatch(db);
                const currentBatch = data.slice(i, i + batchSize);
                const currentUser = auth.currentUser;
                const userId = currentUser ? currentUser.uid : 'unknown';
                
                currentBatch.forEach(customer => {
                    const docRef = doc(db, 'customers', customer.customerId);
                    batch.set(docRef, {
                        ...customer,
                        userId,
                        updatedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString()
                    });
                });
                
                await batch.commit();
                
                const processedSoFar = i + currentBatch.length;
                setUploadedCount(processedSoFar);
                setProgress(Math.round((processedSoFar / total) * 100));
            }
            
            setStatus('completed');
            refreshData();
        } catch (err: any) {
            console.error('Upload error:', err);
            setErrorMsg(`Upload stopped at ${uploadedCount} records: ${err.message}`);
            setStatus('error');
        }
    };

    const handleRepairMissingIds = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        if (!window.confirm("This will link all existing customer records that have no owner to your account. This is usually needed after the first import to make them visible. Continue?")) return;

        setIsRepairing(true);
        try {
            const q = query(collection(db, 'customers'));
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            let count = 0;

            snap.forEach(d => {
                const data = d.data();
                if (!data.userId) {
                    batch.update(d.ref, { userId: currentUser.uid });
                    count++;
                }
            });

            if (count > 0) {
                await batch.commit();
                alert(`Successfully linked ${count} records to your account!`);
                refreshData();
            } else {
                alert("No orphaned records found.");
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsRepairing(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['Cust Id', 'Name', 'Mobile', 'Property Type', 'Zone', 'Ward', 'Latitude', 'Longitude', 'Service Start', 'KYC Date', 'Supervisor', 'Gazette Monthly Rate(₹)', 'Revised Monthly Rate(₹)', 'Last Payment', 'Bill', 'Dues(₹)'];
        const sampleRow = ['CUST001', 'John Doe', '9876543210', 'Residential', 'Zone A', 'Ward 1', '27.4924', '77.6737', '2024-01-01', '2024-01-10', 'Supv 1', '500', '450', '2024-02-01', 'FEB-2024', '0'];
        
        const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "customer_template.xlsx");
    };

    const reset = () => {
        setFile(null);
        setPreviewRows([]);
        setStatus('idle');
        setProgress(0);
        setErrorMsg('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-start">
                <PageHeader 
                    title="Bulk Customer Upload" 
                    description="Import thousands of customers instantly using CSV or Excel files"
                />
                <button
                    onClick={handleRepairMissingIds}
                    disabled={isRepairing}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={isRepairing ? "animate-spin" : ""} />
                    {isRepairing ? "Repairing..." : "Sync Missing Records"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Upload Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                        <div className="p-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                            <h3 className="text-xl font-black">Upload Configuration</h3>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Step 1: Select Data Source</p>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div 
                                onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all ${
                                    file ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                />
                                {file ? (
                                    <div className="space-y-2">
                                        <FileSpreadsheet size={48} className="mx-auto text-emerald-500" />
                                        <p className="font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                                        <p className="text-xs text-emerald-600 font-black uppercase">File Selected</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload size={48} className="mx-auto text-gray-300" />
                                        <p className="font-bold text-gray-500">Drop Excel or CSV file here</p>
                                        <p className="text-[10px] text-gray-400 font-black uppercase">Or click to browse</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={downloadTemplate}
                                className="w-full py-4 border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Download Excel Template
                            </button>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
                                <HelpCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-black text-blue-900 dark:text-blue-300">Important Note</h4>
                                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed mt-1">
                                        Make sure your file contains headers like: <strong>Cust Id, Name, Mobile, Ward, Route ID, Latitude, Longitude</strong>. 
                                        Excel files (.xlsx) are now fully supported.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {status === 'ready' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-gray-100 dark:border-gray-700 shadow-xl"
                        >
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Total Records</span>
                                    <span className="text-lg font-black text-emerald-600">{totalDetected.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={handleUpload}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Import to Database
                                </button>
                                <button 
                                    onClick={reset}
                                    className="w-full py-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500"
                                >
                                    Cancel & Clear
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right: Preview Area */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Data Preview</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Review before final submission</p>
                            </div>
                            {totalDetected > 0 && (
                                <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-black rounded-full uppercase">
                                    {totalDetected.toLocaleString()} Records Detected
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto">
                            {status === 'idle' && (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400">
                                    <Users size={64} strokeWidth={1} className="mb-4 opacity-20" />
                                    <h4 className="font-bold">No Data Loaded</h4>
                                    <p className="text-sm">Upload a CSV file to see a preview of the customers here.</p>
                                </div>
                            )}

                            {status === 'parsing' && (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                                    <h4 className="font-bold">Parsing File...</h4>
                                </div>
                            )}

                            {(status === 'ready' || status === 'uploading' || status === 'completed') && (
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Name</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Property</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Ward</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Route</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Mobile</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {previewRows.map((customer, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{customer.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium">{customer.customerId}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-black uppercase">
                                                        {customer.propertyType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-600 dark:text-gray-300">{customer.ward}</td>
                                                <td className="px-6 py-4">
                                                    {customer.routeId ? (
                                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black">
                                                            {customer.routeId}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 italic">No Route</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-400">{customer.phone}</td>
                                            </tr>
                                        ))}
                                        {totalDetected > 100 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-gray-400 text-xs font-medium italic">
                                                    Showing first 100 of {totalDetected.toLocaleString()} records...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <AnimatePresence>
                            {status === 'uploading' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    className="p-8 bg-emerald-600 text-white"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <Loader2 size={24} className="animate-spin" />
                                            <div>
                                                <h3 className="font-black text-lg">Uploading {totalDetected.toLocaleString()} records...</h3>
                                                <p className="text-xs font-bold opacity-70">{uploadedCount.toLocaleString()} saved</p>
                                            </div>
                                        </div>
                                        <span className="font-black text-2xl">{progress}%</span>
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-white"
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest mt-4 opacity-80">Please do not close this window or refresh the page</p>
                                </motion.div>
                            )}

                            {status === 'completed' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 flex flex-col items-center text-center"
                                >
                                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">Import Successful!</h3>
                                    <p className="font-medium max-w-md">
                                        Successfully imported all {totalDetected.toLocaleString()} customers to the database. 
                                        They are now available in the Customer Management module.
                                    </p>
                                    <button 
                                        onClick={reset}
                                        className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-red-600 text-white flex flex-col items-center text-center"
                                >
                                    <AlertCircle size={48} className="mb-4" />
                                    <h3 className="text-xl font-black mb-2">Upload Failed</h3>
                                    <p className="font-medium opacity-90">{errorMsg}</p>
                                    <button 
                                        onClick={() => setStatus('ready')}
                                        className="mt-6 px-8 py-3 bg-white text-red-600 rounded-xl font-black uppercase text-xs tracking-widest"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkCustomerUploadPage;
