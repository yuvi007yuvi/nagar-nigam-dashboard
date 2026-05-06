import React, { useState } from 'react';
import { db } from '../../services/firebaseConfig';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const wardData = [
    { id: "1", name: "Birjapur", zone: "3-AURANGABAD" },
    { id: "2", name: "Ambedkar Nagar", zone: "1-CITY" },
    { id: "3", name: "Girdharpur", zone: "2-BHUTESHWAR" },
    { id: "4", name: "Ishapur Yamunapar", zone: "1-CITY" },
    { id: "5", name: "Bharatpur Gate", zone: "1-CITY" },
    { id: "6", name: "Aduki", zone: "3-AURANGABAD" },
    { id: "7", name: "Lohvan", zone: "1-CITY" },
    { id: "8", name: "Atas", zone: "4-VRINDAVAN" },
    { id: "9", name: "Gandhi Nagar", zone: "4-VRINDAVAN" },
    { id: "10", name: "Aurangabad First", zone: "3-AURANGABAD" },
    { id: "11", name: "Tarsi", zone: "3-AURANGABAD" },
    { id: "12", name: "Radhe Shyam Colony", zone: "2-BHUTESHWAR" },
    { id: "13", name: "Sunrakh", zone: "4-VRINDAVAN" },
    { id: "14", name: "Lakshmi Nagar Yamunapar", zone: "1-CITY" },
    { id: "15", name: "Maholi First", zone: "3-AURANGABAD" },
    { id: "16", name: "Bakalpur", zone: "2-BHUTESHWAR" },
    { id: "17", name: "Bairaagpura", zone: "2-BHUTESHWAR" },
    { id: "18", name: "General Ganj", zone: "1-CITY" },
    { id: "19", name: "Ramnagar Yamunapar", zone: "1-CITY" },
    { id: "20", name: "Krishna Nagar First", zone: "2-BHUTESHWAR" },
    { id: "21", name: "Chaitanya Bihar", zone: "4-VRINDAVAN" },
    { id: "22", name: "Badhri Nagar", zone: "1-CITY" },
    { id: "23", name: "Aheer Pada", zone: "1-CITY" },
    { id: "24", name: "Sarai Azamabad", zone: "2-BHUTESHWAR" },
    { id: "25", name: "Chharaura", zone: "4-VRINDAVAN" },
    { id: "26", name: "Naya Nagla", zone: "1-CITY" },
    { id: "27", name: "Baad", zone: "3-AURANGABAD" },
    { id: "28", name: "Aurangabad Second", zone: "3-AURANGABAD" },
    { id: "29", name: "Koyla Alipur", zone: "3-AURANGABAD" },
    { id: "30", name: "Krishna Nagar Second", zone: "2-BHUTESHWAR" },
    { id: "31", name: "Navneet Nagar", zone: "2-BHUTESHWAR" },
    { id: "32", name: "Ranchibagar", zone: "3-AURANGABAD" },
    { id: "33", name: "Palikhera", zone: "3-AURANGABAD" },
    { id: "34", name: "Radhaniwas", zone: "4-VRINDAVAN" },
    { id: "35", name: "Bankhandi", zone: "1-CITY" },
    { id: "36", name: "Jaisingh Pura", zone: "2-BHUTESHWAR" },
    { id: "37", name: "Baldevpuri", zone: "2-BHUTESHWAR" },
    { id: "38", name: "Civil Lines", zone: "3-AURANGABAD" },
    { id: "39", name: "Mahavidhya Colony", zone: "2-BHUTESHWAR" },
    { id: "40", name: "Rajkumar", zone: "1-CITY" },
    { id: "41", name: "Dhaulipiau", zone: "3-AURANGABAD" },
    { id: "42", name: "Manoharpur", zone: "1-CITY" },
    { id: "43", name: "Ganeshra", zone: "2-BHUTESHWAR" },
    { id: "44", name: "Radhika Bihar", zone: "2-BHUTESHWAR" },
    { id: "45", name: "Birla Mandir", zone: "2-BHUTESHWAR" },
    { id: "46", name: "Radha Nagar", zone: "2-BHUTESHWAR" },
    { id: "47", name: "Dwarkapuri", zone: "2-BHUTESHWAR" },
    { id: "48", name: "Satoha Asangpur", zone: "2-BHUTESHWAR" },
    { id: "49", name: "Daimpiriyal Nagar", zone: "1-CITY" },
    { id: "50", name: "Patharpura", zone: "4-VRINDAVAN" },
    { id: "51", name: "Gaushala Nagar", zone: "4-VRINDAVAN" },
    { id: "52", name: "Chandrapuri", zone: "3-AURANGABAD" },
    { id: "53", name: "Krishna Puri", zone: "1-CITY" },
    { id: "54", name: "Pratap Nagar", zone: "2-BHUTESHWAR" },
    { id: "55", name: "Govind Nagar", zone: "2-BHUTESHWAR" },
    { id: "56", name: "Mandi Randas", zone: "2-BHUTESHWAR" },
    { id: "57", name: "Balajipuram", zone: "3-AURANGABAD" },
    { id: "58", name: "Gau Ghat", zone: "2-BHUTESHWAR" },
    { id: "59", name: "Maholi Second", zone: "3-AURANGABAD" },
    { id: "60", name: "Jagannath Puri", zone: "2-BHUTESHWAR" },
    { id: "61", name: "Chaubia Para", zone: "1-CITY" },
    { id: "62", name: "Mathura Darwaza", zone: "4-VRINDAVAN" },
    { id: "63", name: "Maliyaan Sadar", zone: "1-CITY" },
    { id: "64", name: "Ghati Bahalray", zone: "1-CITY" },
    { id: "65", name: "Holi Gali", zone: "1-CITY" },
    { id: "66", name: "Keshighat", zone: "4-VRINDAVAN" },
    { id: "67", name: "Kemar Van", zone: "4-VRINDAVAN" },
    { id: "68", name: "Shanti Nagar", zone: "1-CITY" },
    { id: "69", name: "Ratan Chhatri", zone: "4-VRINDAVAN" },
    { id: "70", name: "Biharipur", zone: "4-VRINDAVAN" }
];

const zones = ["1-CITY", "2-BHUTESHWAR", "3-AURANGABAD", "4-VRINDAVAN"];

const DataMigrationPage = () => {
    const [status, setStatus] = useState<string>('idle');
    const [progress, setProgress] = useState(0);

    const runMigration = async () => {
        setStatus('running');
        try {
            // 1. Upload Zones
            for (const zone of zones) {
                await setDoc(doc(db, 'zones', zone), { name: zone });
            }
            
            // 2. Upload Wards in batches
            const batchSize = 20;
            for (let i = 0; i < wardData.length; i += batchSize) {
                const batch = writeBatch(db);
                const currentBatch = wardData.slice(i, i + batchSize);
                
                currentBatch.forEach(ward => {
                    const wardRef = doc(db, 'wards', ward.id);
                    batch.set(wardRef, {
                        id: ward.id,
                        name: `Ward ${ward.id}: ${ward.name}`,
                        zoneName: ward.zone,
                        wardNo: ward.id,
                        updatedAt: new Date().toISOString()
                    });
                });
                
                await batch.commit();
                setProgress(Math.round(((i + currentBatch.length) / wardData.length) * 100));
            }
            
            setStatus('completed');
        } catch (error) {
            console.error('Migration failed:', error);
            setStatus('error');
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Database size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Data Migration</h1>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Zone & Ward Batch Upload</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        This tool will upload 70 wards and 4 zones to your Firestore database automatically. 
                        It uses batched writes for maximum efficiency.
                    </p>

                    {status === 'idle' && (
                        <button 
                            onClick={runMigration}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            Start Upload
                        </button>
                    )}

                    {status === 'running' && (
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-xs font-black text-emerald-600 uppercase tracking-widest">
                                Uploading... {progress}%
                            </p>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center gap-4 text-center">
                            <CheckCircle size={48} className="text-emerald-600" />
                            <div>
                                <h3 className="font-black text-emerald-900">Upload Complete!</h3>
                                <p className="text-sm text-emerald-700 font-medium">70 Wards and 4 Zones have been successfully added.</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center gap-4 text-center">
                            <AlertCircle size={48} className="text-red-600" />
                            <div>
                                <h3 className="font-black text-red-900">Upload Failed</h3>
                                <p className="text-sm text-red-700 font-medium">Please check the console for details and try again.</p>
                            </div>
                            <button onClick={runMigration} className="text-xs font-black uppercase underline text-red-600">Retry</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataMigrationPage;
