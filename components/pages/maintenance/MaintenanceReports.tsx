import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, FileText, Download, 
  TrendingUp, TrendingDown, Calendar,
  Filter, Printer, Share2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const MaintenanceReports = () => {
  const data = [
    { name: 'Jan', fuel: 4000, repair: 2400 },
    { name: 'Feb', fuel: 3000, repair: 1398 },
    { name: 'Mar', fuel: 2000, repair: 9800 },
    { name: 'Apr', fuel: 2780, repair: 3908 },
    { name: 'May', fuel: 1890, repair: 4800 },
  ];

  const pieData = [
    { name: 'Routine', value: 400, color: '#10b981' },
    { name: 'Breakdown', value: 300, color: '#f59e0b' },
    { name: 'Accident', value: 100, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Analytical Reports</h3>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">
            <Calendar size={14} /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-lg">
            <Download size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Fuel vs Repair Cost</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 20 }} />
                <Bar dataKey="fuel" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="repair" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Repair Category Distribution</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Vehicle History Report', icon: FileText },
          { title: 'Maintenance Cost Analysis', icon: BarChart3 },
          { title: 'Driver Performance Log', icon: Printer },
        ].map((report, idx) => (
          <button key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50">
                <report.icon size={20} />
              </div>
              <span className="text-sm font-bold text-gray-700">{report.title}</span>
            </div>
            <Share2 size={16} className="text-gray-300 group-hover:text-emerald-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceReports;
