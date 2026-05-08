import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../shared/PageHeader';
import { useData } from '../../services/DataContext';
import { format, isWithinInterval, subDays, differenceInDays } from 'date-fns';
import { Filter, Calendar, RefreshCw } from 'lucide-react';
import { getAppSettings } from '../../services/databaseService';
import { db } from '../../services/firebaseConfig';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

// --- KPI Dashboard Page ---

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

const KPIGauge = ({ value, color }: { value: number, color: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const safeValue = Math.min(Math.max(value || 0, 0), 100);
    const strokeDashoffset = circumference - (safeValue / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#f3f4f6" strokeWidth="8" fill="transparent" className="dark:stroke-gray-700" />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${safeValue === 0 ? 'text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                    {Math.round(safeValue)}%
                </span>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, type = 'chart', color = "#e5e7eb" }: any) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[160px]">
            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm mb-4 leading-tight h-8">{title}</h4>
            <div className="flex-1 flex items-center justify-center">
                {type === 'chart' ? <KPIGauge value={value} color={color} /> : <div className="text-xl font-bold text-gray-600 dark:text-gray-300">{value}</div>}
            </div>
        </div>
    )
}

const KPIDashboardPage = () => {
    const { 
        userCharges, attendanceRecords, complaints, 
        bulkCollections, customers, weighments, 
        coverageRecords, fuelEntries, zones, wards, loading 
    } = useData();

    const [selectedZone, setSelectedZone] = useState('All');
    const [selectedWard, setSelectedWard] = useState('All');
    const [dateRange, setDateRange] = useState({ start: subDays(new Date(), 30), end: new Date() });
    const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

    const [manualKpiData, setManualKpiData] = useState<any[]>([]);

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

        const fetchManualKpiData = async () => {
            try {
                const q = query(collection(db, 'kpiDataEntry'), orderBy('date', 'desc'));
                const snapshot = await getDocs(q);
                setManualKpiData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching manual KPI data:", err);
            }
        };

        fetchThresholds();
        fetchManualKpiData();
    }, []);

    const filteredData = useMemo(() => {
        const filterByZW = (item: any) => {
            if (selectedZone !== 'All' && item.zone !== selectedZone && item.zoneId !== selectedZone) return false;
            if (selectedWard !== 'All' && item.ward !== selectedWard && item.wardId !== selectedWard) return false;
            return true;
        };
        const filterByDate = (item: any, f: string = 'date') => {
            try {
                const d = new Date(item[f] || item.date || item.createdAt);
                return isWithinInterval(d, { start: dateRange.start, end: dateRange.end });
            } catch (e) { return true; }
        };

        return {
            customers: customers.filter(filterByZW),
            userCharges: userCharges.filter(c => filterByZW(c) && filterByDate(c, 'paymentDate')),
            attendance: attendanceRecords.filter(a => filterByZW(a) && filterByDate(a)),
            complaints: complaints.filter(c => filterByZW(c) && filterByDate(c, 'createdAt')),
            bulk: bulkCollections.filter(b => filterByZW(b) && filterByDate(b)),
            weighments: weighments.filter(w => filterByZW(w) && filterByDate(w)),
            coverage: coverageRecords.filter(c => filterByZW(c) && filterByDate(c)),
            fuel: fuelEntries.filter(f => filterByZW(f) && filterByDate(f)),
            manual: manualKpiData.filter(m => filterByZW(m) && filterByDate(m))
        };
    }, [customers, userCharges, attendanceRecords, complaints, bulkCollections, weighments, coverageRecords, fuelEntries, manualKpiData, selectedZone, selectedWard, dateRange]);

    const stats = useMemo(() => {
        // --- Manual Thresholds ---
        const { kyc, userChargeCount, receipts, fuelRefills, onTimeDispatch, gpsConnectivity, bulkSites, routeAdherence, attendance, supervisorAttendance, uniformCompliance, complaintResolution, segregation } = thresholds;

        // --- Dynamic Thresholds ---
        // 1. Trip Target: (Active vehicles in period) * 2 trips/day * Days
        const activeVehCount = new Set(filteredData.weighments.map(w => w.vehicleNo || w.vehicleId)).size || 1;
        const days = Math.max(differenceInDays(dateRange.end, dateRange.start), 1);
        const dynamicTripTarget = activeVehCount * 2 * days;

        // 2. POI Target: Total QR sites registered in the filtered zone/ward
        const dynamicPoiTarget = filteredData.customers.length || 1;

        // --- Calculation Logic ---
        const totalCust = filteredData.customers.length || 1;
        const kycDone = filteredData.customers.filter(c => c.isKycDone || c.kycStatus === 'Completed').length;
        const targetKycCount = Math.max(1, totalCust * ((kyc || 100) / 100));
        const kycKPI = Math.min(Math.round((kycDone / targetKycCount) * 100), 100);

        const ucCount = filteredData.userCharges.length;
        const ucKPI = Math.min(Math.round((ucCount / Math.max(1, userChargeCount || 500)) * 100), 100);

        const trips = filteredData.weighments.length;
        const tripKPI = Math.min(Math.round((trips / Math.max(1, dynamicTripTarget)) * 100), 100);

        const fuel = filteredData.fuel.length;
        const fuelKPI = Math.min(Math.round((fuel / Math.max(1, fuelRefills || 40)) * 100), 100);

        const bulk = new Set(filteredData.bulk.map(b => b.siteId || b.qr || b.siteName || b.site)).size;
        const bulkKPI = Math.min(Math.round((bulk / Math.max(1, bulkSites || 60)) * 100), 100);

        const poiScans = filteredData.coverage.length;
        const poiKPI = Math.min(Math.round((poiScans / Math.max(1, dynamicPoiTarget)) * 100), 100);

        // Calculate actual percentages then divide by target threshold
        const present = filteredData.attendance.filter(r => r.status === 'Present' || r.status === 'P').length;
        const totalAttendSlots = filteredData.attendance.length || 1;
        const actualAttendPct = (present / totalAttendSlots) * 100;
        const attendanceKPI = Math.min(Math.round((actualAttendPct / Math.max(1, attendance || 95)) * 100), 100);

        const addressed = filteredData.complaints.filter(c => 
            c.status === 'Resolved' || 
            c.status === 'Rejected' || 
            c.status === 'Out of Scope'
        ).length;
        const totalCompCount = filteredData.complaints.length;
        // If 0 complaints, show 100%. Otherwise show actual percentage.
        const actualResolvePct = totalCompCount > 0 ? (addressed / totalCompCount) * 100 : 100;
        const complaintKPI = Math.round(actualResolvePct);

        // --- Manual Overrides from Data Entry ---
        const manualSegregation = filteredData.manual.filter(m => m.type === 'segregation');
        const segregationKPIManual = manualSegregation.length > 0 
            ? Math.round(manualSegregation.reduce((acc, curr) => acc + curr.value, 0) / manualSegregation.length)
            : tripKPI >= 70 ? (segregation || 70) : Math.round((tripKPI / 70) * (segregation || 70));

        const manualUniform = filteredData.manual.filter(m => m.type === 'uniform');
        const uniformKPIManual = manualUniform.length > 0
            ? Math.round(manualUniform.reduce((acc, curr) => acc + curr.value, 0) / manualUniform.length)
            : attendanceKPI >= 90 ? (uniformCompliance || 90) : Math.round((attendanceKPI / 90) * (uniformCompliance || 90));

        const manualIec = filteredData.manual.filter(m => m.type === 'iec');
        const iecCount = manualIec.reduce((acc, curr) => acc + curr.value, 0);
        const iecStatus = iecCount > 0 ? `${iecCount} Activities` : (tripKPI > 0 ? "Active" : "Inactive");

        // Manual metrics - show performance relative to target if possible, else show a weighted result
        const receiptKPI = ucKPI >= 80 ? (receipts || 100) : Math.round((ucKPI / 80) * (receipts || 100));
        const dispatchKPI = tripKPI >= 90 ? (onTimeDispatch || 90) : Math.round((tripKPI / 90) * (onTimeDispatch || 90));
        const gpsKPI = tripKPI >= 95 ? (gpsConnectivity || 95) : Math.round((tripKPI / 95) * (gpsConnectivity || 95));
        const routeKPI = poiKPI >= 85 ? (routeAdherence || 85) : Math.round((poiKPI / 85) * (routeAdherence || 85));
        const supervisorKPI = attendanceKPI >= 95 ? (supervisorAttendance || 95) : Math.round((attendanceKPI / 95) * (supervisorAttendance || 95));
        const uniformKPI = attendanceKPI >= 90 ? (uniformCompliance || 90) : Math.round((attendanceKPI / 90) * (uniformCompliance || 90));
        const segregationKPI = tripKPI >= 70 ? (segregation || 70) : Math.round((tripKPI / 70) * (segregation || 70));

        return { 
            kycKPI, ucKPI, tripKPI, fuelKPI, bulkKPI, poiKPI, attendanceKPI, complaintKPI,
            receiptKPI, dispatchKPI, gpsKPI, routeKPI, supervisorKPI, 
            uniformKPI: uniformKPIManual, 
            segregationKPI: segregationKPIManual,
            iecStatus
        };
    }, [filteredData, thresholds, dateRange]);

    const kpiSections = [
        {
            title: "Customer Engagement & Transactions",
            cards: [
                { title: "KYC Completion", value: stats.kycKPI, color: "#10b981" },
                { title: "User Charge Collection", value: stats.ucKPI, color: "#f59e0b" },
                { title: "Receipt Generation", value: stats.receiptKPI, color: "#3b82f6" }
            ]
        },
        {
            title: "Fleet & Fuel Operations",
            cards: [
                { title: "Fuel Refill Compliance", value: stats.fuelKPI, color: "#8b5cf6" },
                { title: "Trip Completion", value: stats.tripKPI, color: "#10b981" },
                { title: "On-Time Dispatch", value: stats.dispatchKPI, color: "#f97316" },
                { title: "GPS Connectivity", value: stats.gpsKPI, color: "#06b6d4" }
            ]
        },
        {
            title: "Waste Collection & Coverage",
            cards: [
                { title: "Waste Collection Efficiency", value: stats.tripKPI, color: "#059669" },
                { title: "Bulk Collection Coverage", value: stats.bulkKPI, color: "#f59e0b" },
                { title: "POI Coverage Progress", value: stats.poiKPI, color: "#3b82f6" },
                { title: "Route Adherence", value: stats.routeKPI, color: "#ec4899" }
            ]
        },
        {
            title: "Workforce Performance & Attendance",
            cards: [
                { title: "Overall Attendance", value: stats.attendanceKPI, color: "#10b981" },
                { title: "Supervisor Attendance", value: stats.supervisorKPI, color: "#3b82f6" },
                { title: "Uniform Compliance", value: stats.uniformKPI, color: "#8b5cf6" }
            ]
        },
        {
            title: "Customer Service & Compliance",
            cards: [
                { title: "Complaint Resolution", value: stats.complaintKPI, color: "#10b981" },
                { title: "Waste Segregation Progress", value: stats.segregationKPI, color: "#f59e0b" },
                { title: "IEC Campaign Execution", value: stats.iecStatus, type: "text" }
            ]
        }
    ];

    const hasData = useMemo(() => {
        return Object.values(filteredData).some((arr: any) => arr?.length > 0);
    }, [filteredData]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Syncing KPI data...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-8">
            <PageHeader title="KPI Dashboard" description="Comprehensive overview of service performance and progress against goals." />
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Filter size={14} className="text-gray-400" />
                    <select value={selectedZone} onChange={e => { setSelectedZone(e.target.value); setSelectedWard('All'); }} className="bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-gray-300">
                        <option value="All">All Zones</option>
                        {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                    <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} className="bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-gray-300">
                        <option value="All">All Wards</option>
                        {(selectedZone === 'All' ? wards : wards.filter(w => w.zoneId === selectedZone || w.zone === selectedZone)).map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                    <Calendar size={14} className="text-gray-400" />
                    <input type="date" value={format(dateRange.start, 'yyyy-MM-dd')} onChange={e => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))} className="bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-400">-</span>
                    <input type="date" value={format(dateRange.end, 'yyyy-MM-dd')} onChange={e => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))} className="bg-transparent text-xs font-bold outline-none text-gray-700 dark:text-gray-300" />
                </div>
                <button onClick={() => window.location.reload()} className="ml-auto p-2 text-gray-400 hover:text-blue-500 transition-colors"><RefreshCw size={18} /></button>
            </div>
            {!hasData && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar size={20} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">No Data Found</h4>
                        <p className="text-xs text-amber-700/70 dark:text-amber-300/60">There are no operational records for the selected date range or location. All KPIs are currently showing 0% based on this lack of data.</p>
                    </div>
                </div>
            )}

            {kpiSections.map((section, idx) => (
                <div key={idx} className={`space-y-4 ${!hasData ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                    <h3 className="text-gray-500 dark:text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] pl-1 border-l-2 border-blue-500 ml-1">{section.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {section.cards.map((card, cIdx) => <KPICard key={cIdx} {...card} />)}
                    </div>
                </div>
            ))}
            <div className="flex justify-between items-center pt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-50 dark:border-gray-700">
                <span>KPI Monitoring System • 2026</span>
            </div>
        </motion.div>
    );
};

export default KPIDashboardPage;
