import React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../shared/PageHeader';

// --- KPI Dashboard Page ---

// Helper Component for Gauge
const KPIGauge = ({ value, color }: { value: number, color: string }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                {/* Track */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="transparent"
                    className="dark:stroke-gray-700"
                />
                {/* Progress */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${value === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>{value}%</span>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, type = 'chart', color = "#e5e7eb" }: any) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[180px] hover:shadow-md transition-shadow">
            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-xs sm:text-sm mb-4 h-8 leading-tight">{title}</h4>
            <div className="flex-1 flex items-center justify-center">
                {type === 'chart' ? (
                    <KPIGauge value={typeof value === 'number' ? value : 0} color={color} />
                ) : (
                    <div className="text-xl font-bold text-gray-600 dark:text-gray-300">{value}</div>
                )}
            </div>
            <div className="mt-4 pt-2 border-t border-gray-50 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                View More <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[8px] pb-0.5">@</div>
            </div>
        </div>
    )
}

const KPIDashboardPage = () => {
    const kpiSections = [
        {
            title: "Customer Engagement & Transactions",
            cards: [
                { title: "KYC Completion", value: 87, color: "#10b981" },
                { title: "User Charge Collection", value: 72, color: "#f59e0b" },
                { title: "Receipt Generation", value: 95, color: "#3b82f6" }
            ]
        },
        {
            title: "Fleet & Fuel Operations",
            cards: [
                { title: "Fuel Refill", value: 91, color: "#8b5cf6" },
                { title: "Trip Completion", value: 88, color: "#10b981" },
                { title: "On-Time Vehicle Dispatch", value: "94%", type: "text" },
                { title: "Vehicle Breakdown", value: "2", type: "text" },
                { title: "GPS Connectivity", value: 97, color: "#06b6d4" }
            ]
        },
        {
            title: "Waste Collection & Coverage",
            cards: [
                { title: "Waste Collection", value: 84, color: "#059669" },
                { title: "Bulk Collection Scan", value: 79, color: "#f59e0b" },
                { title: "Pol Coverage", value: 92, color: "#3b82f6" },
                { title: "Distance Coverage", value: 86, color: "#8b5cf6" }
            ]
        },
        {
            title: "Workforce Performance & Attendance",
            cards: [
                { title: "Workforce Attendance", value: 93, color: "#10b981" },
                { title: "UCC Supervisor Attendance", value: 96, color: "#3b82f6" },
                { title: "C&T Supervisor Attendance", value: 94, color: "#8b5cf6" },
                { title: "Uniform Compliance", value: "98%", type: "text" }
            ]
        },
        {
            title: "Customer Service & Compilance",
            cards: [
                { title: "Complaint Resolution", value: 89, color: "#10b981" },
                { title: "IEC Campaign Execution", value: "Active", type: "text" },
                { title: "Waste Segregation Compliance", value: "76%", type: "text" }
            ]
        }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-2 space-y-8">
            <PageHeader title="KPI Dashboard" description="Overview of key performance metrics across departments." />

            {kpiSections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium pl-1">{section.title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {section.cards.map((card, cIdx) => (
                            <KPICard key={cIdx} {...card} />
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-4 text-[10px] text-gray-400">
                All Rights Reserved
            </div>
        </motion.div>
    );
};

export default KPIDashboardPage;
