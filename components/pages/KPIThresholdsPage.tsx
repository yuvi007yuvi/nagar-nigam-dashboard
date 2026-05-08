import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Save, CheckCircle, Activity,
    Truck, Trash2, Users, LifeBuoy
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAppSettings, updateAppSettings } from '../../services/databaseService';

const DEFAULT_THRESHOLDS = {
    kyc: 100,
    userChargeCount: 500,
    receipts: 100,
    fuelRefills: 40,
    onTimeDispatch: 90,
    gpsConnectivity: 95,
    bulkSites: 60,
    routeAdherence: 85,
    attendance: 95,
    supervisorAttendance: 95,
    uniformCompliance: 90,
    complaintResolution: 95,
    segregation: 70,
    iecCampaign: 100
};

const KPIThresholdsPage = () => {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // KPI Thresholds State
    const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

    useEffect(() => {
        const fetchThresholds = async () => {
            try {
                const result = await getAppSettings('kpiThresholds');
                if (result.success && result.data) {
                    const { id, userId, userName, updatedAt, ...cleanData } = result.data as any;
                    if (Object.keys(cleanData).length > 0) {
                        setThresholds(prev => {
                            const merged = { ...prev };
                            Object.keys(cleanData).forEach(key => {
                                // Only accept positive numbers to prevent loading accidental zeros
                                if (typeof cleanData[key] === 'number' && cleanData[key] > 0) {
                                    merged[key] = cleanData[key];
                                }
                            });
                            return merged;
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading thresholds:", error);
            }
        };
        fetchThresholds();
    }, []);

    const handleSave = async () => {
        // Check for any zeros in thresholds
        const hasZeros = Object.values(thresholds).some(v => v === 0);
        if (hasZeros && !window.confirm('Some benchmarks are set to 0. This will make KPIs show as 100% or NaN. Are you sure you want to save?')) {
            return;
        }

        setLoading(true);
        const result = await updateAppSettings('kpiThresholds', thresholds);
        if (result.success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setLoading(false);
    };

    const handleReset = () => {
        if (window.confirm('Reset all benchmarks to system defaults?')) {
            setThresholds(DEFAULT_THRESHOLDS);
        }
    };

    const handleThresholdChange = (key: string, value: string) => {
        const numValue = value === '' ? 0 : parseInt(value);
        setThresholds(prev => ({ ...prev, [key]: isNaN(numValue) ? 0 : numValue }));
    };

    return (
        <div className="space-y-6 p-4">
            <PageHeader 
                title="KPI Thresholds Configuration" 
                description="Set departmental performance targets that drive the KPI Dashboard gauges." 
            />

            <div className="flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-gray-700/30">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Target size={20} className="text-emerald-500" />
                        Benchmark Configuration
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage departmental performance targets for KPI gauges</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                    >
                        Reset Defaults
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg transition-all text-sm ${saved ? 'bg-green-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <><CheckCircle size={16} /> Applied</> : <><Save size={16} /> Save Benchmarks</>}
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Group 1 */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/50 p-6"
                >
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border-b border-emerald-50 dark:border-emerald-900/30 pb-3 mb-4">
                        <Users size={16} /> Engagement & Revenue
                    </div>
                    <div className="space-y-4">
                        <ThresholdInput label="KYC Completion Target (%)" value={thresholds.kyc} onChange={v => handleThresholdChange('kyc', v)} />
                        <ThresholdInput label="User Charge Count Target" value={thresholds.userChargeCount} onChange={v => handleThresholdChange('userChargeCount', v)} />
                        <ThresholdInput label="Receipt Generation Target (%)" value={thresholds.receipts} onChange={v => handleThresholdChange('receipts', v)} />
                    </div>
                </motion.div>

                {/* Group 2 */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/50 p-6"
                >
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border-b border-blue-50 dark:border-blue-900/30 pb-3 mb-4">
                        <Truck size={16} /> Fleet & Fuel
                    </div>
                    <div className="space-y-4">
                        <ThresholdInput label="Fuel Refill Count Target" value={thresholds.fuelRefills} onChange={v => handleThresholdChange('fuelRefills', v)} />
                        <ThresholdInput label="On-Time Dispatch Target (%)" value={thresholds.onTimeDispatch} onChange={v => handleThresholdChange('onTimeDispatch', v)} />
                        <ThresholdInput label="GPS Connectivity Target (%)" value={thresholds.gpsConnectivity} onChange={v => handleThresholdChange('gpsConnectivity', v)} />
                    </div>
                </motion.div>

                {/* Group 3 */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/50 p-6"
                >
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 border-b border-orange-50 dark:border-orange-900/30 pb-3 mb-4">
                        <Trash2 size={16} /> Waste & Coverage
                    </div>
                    <div className="space-y-4">
                        <ThresholdInput label="Bulk Site Target Count" value={thresholds.bulkSites} onChange={v => handleThresholdChange('bulkSites', v)} />
                        <ThresholdInput label="Route Adherence Target (%)" value={thresholds.routeAdherence} onChange={v => handleThresholdChange('routeAdherence', v)} />
                        <ThresholdInput label="Waste Segregation Target (%)" value={thresholds.segregation} onChange={v => handleThresholdChange('segregation', v)} />
                    </div>
                </motion.div>

                {/* Group 4 */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/50 p-6"
                >
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 border-b border-purple-50 dark:border-purple-900/30 pb-3 mb-4">
                        <LifeBuoy size={16} /> HR & Compliance
                    </div>
                    <div className="space-y-4">
                        <ThresholdInput label="Worker Attendance Target (%)" value={thresholds.attendance} onChange={v => handleThresholdChange('attendance', v)} />
                        <ThresholdInput label="Supervisor Attendance Target (%)" value={thresholds.supervisorAttendance} onChange={v => handleThresholdChange('supervisorAttendance', v)} />
                        <ThresholdInput label="Uniform Compliance Target (%)" value={thresholds.uniformCompliance} onChange={v => handleThresholdChange('uniformCompliance', v)} />
                        <ThresholdInput label="Complaint Resolution Target (%)" value={thresholds.complaintResolution} onChange={v => handleThresholdChange('complaintResolution', v)} />
                    </div>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm rounded-2xl border border-amber-100 dark:border-amber-800/20"
            >
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Activity size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Dynamic Thresholds</h4>
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/50 mt-1">
                            Targets for <b>Trip Completion</b> and <b>POI Coverage</b> are calculated automatically based on your total vehicle fleet and registered QR sites.
                        </p>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

const ThresholdInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
    <div>
        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
        <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold text-gray-700 dark:text-gray-200"
        />
    </div>
);

export default KPIThresholdsPage;
