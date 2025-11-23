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
                <span className={`text-xl font-bold ${value === 0 ? 'text-gray-400' : 'text-gray-800'}`}>{value}%</span>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, type = 'chart', color = "#e5e7eb" }: any) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[180px] hover:shadow-md transition-shadow">
            <h4 className="font-bold text-gray-700 text-xs sm:text-sm mb-4 h-8 leading-tight">{title}</h4>
            <div className="flex-1 flex items-center justify-center">
                {type === 'chart' ? (
                    <KPIGauge value={typeof value === 'number' ? value : 0} color={color} />
                ) : (
                    <div className="text-xl font-bold text-gray-600">{value}</div>
                )}
            </div>
            <div className="mt-4 pt-2 border-t border-gray-50 text-[10px] text-gray-400 cursor-pointer hover:text-blue-600 flex items-center gap-1">
                View More <div className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center text-[8px] pb-0.5">@</div>
            </div>
        </div>
    )
}

const KPIDashboardPage = () => {
    const kpiSections = [
        {
            title: "Customer Engagement & Transactions",
            cards: [
                { title: "KYC Completion", value: 0, color: "#e5e7eb" },
                { title: "User Charge Collection", value: 0, color: "#e5e7eb" },
                { title: "Receipt Generation", value: 0, color: "#e5e7eb" }
            ]
        },
        {
            title: "Fleet & Fuel Operations",
            cards: [
                { title: "Fuel Refill", value: 0, color: "#e5e7eb" },
                { title: "Trip Completion", value: 0, color: "#e5e7eb" },
                { title: "On-Time Vehicle Dispatch", value: "NA", type: "text" },
                { title: "Vehicle Breakdown", value: "NA", type: "text" },
                { title: "GPS Connectivity", value: 0, color: "#e5e7eb" }
            ]
        },
        {
            title: "Waste Collection & Coverage",
            cards: [
                { title: "Waste Collection", value: 0, color: "#e5e7eb" },
                { title: "Bulk Collection Scan", value: 0, color: "#e5e7eb" },
                { title: "Pol Coverage", value: 0, color: "#e5e7eb" },
                { title: "Distance Coverage", value: 0, color: "#e5e7eb" }
            ]
        },
        {
            title: "Workforce Performance & Attendance",
            cards: [
                { title: "Workforce Attendance", value: 0, color: "#e5e7eb" },
                { title: "UCC Supervisor Attendance", value: 0, color: "#e5e7eb" },
                { title: "C&T Supervisor Attendance", value: 0, color: "#e5e7eb" },
                { title: "Uniform Compliance", value: "NA", type: "text" }
            ]
        },
        {
            title: "Customer Service & Compilance",
            cards: [
                { title: "Complaint Resolution", value: 0, color: "#e5e7eb" },
                { title: "IEC Campaign Execution", value: "NA", type: "text" },
                { title: "Waste Segregation Compliance", value: "NA", type: "text" }
            ]
        }
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-2 space-y-8">
            <PageHeader title="KPI Dashboard" description="Overview of key performance metrics across departments." />

            {kpiSections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                    <h3 className="text-gray-600 text-sm font-medium pl-1">{section.title}</h3>
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
