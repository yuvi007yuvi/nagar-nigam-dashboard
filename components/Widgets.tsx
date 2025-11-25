import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import {
  TruckIllustration,
  WalletIllustration,
  MapIllustration,
  AlertIllustration,
  PeopleIllustration,
  BinIllustration
} from './Illustrations';

// --- Colored Stat Card ---
interface ColoredStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
  onClick?: () => void;
}

export const ColoredStatCard: React.FC<ColoredStatCardProps> = ({ title, value, icon: Icon, color, delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-${color.split('-')[1]}-500/20 transition-all duration-300 text-white ${color} min-h-[160px] flex flex-col justify-between group ${onClick ? 'cursor-pointer' : ''} border border-white/30`}
    >
      <div className="p-5 relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner border border-white/20">
            <Icon size={24} className="text-white drop-shadow-sm" />
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-sm font-medium text-white/90 mb-1 tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight font-display drop-shadow-md">{value}</h3>
        </div>
      </div>

      {/* Footer Link */}
      <div className="relative z-10 bg-black/10 px-5 py-3 flex items-center justify-between backdrop-blur-sm group-hover:bg-black/20 transition-colors border-t border-white/10">
        <span className="text-xs font-medium tracking-wide uppercase opacity-90">View Details</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform opacity-90" />
      </div>

      {/* Decorative Large Icon */}
      <div className="absolute -top-6 -right-6 text-white opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 ease-out">
        <Icon size={140} />
      </div>

      {/* Shine Effect */}
      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
    </motion.div>
  )
}

// --- Helper for Empty State ---
const EmptyState = ({ illustration: Illustration, message }: { illustration: React.ElementType, message: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] opacity-60 grayscale-[0.5] transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105">
    <div className="scale-75 mb-2 drop-shadow-md">
      <Illustration />
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">{message}</p>
  </div>
);

// --- Widget Container Wrapper ---
const WidgetContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className={`glass shadow-xl hover:shadow-2xl dark:bg-gray-800/50 dark:border-gray-700 rounded-2xl p-5 h-full flex flex-col relative overflow-hidden transition-all duration-300 border border-white/40 ${className}`}
  >
    {children}
  </motion.div>
);

// --- User Charge Collection Widget ---
export const UserChargeWidget: React.FC<{ data?: { label: string; value: string; color: string }[] }> = ({ data = [] }) => {
  return (
    <WidgetContainer>
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 font-display">
          <span className="w-1.5 h-5 bg-purple-500 rounded-full shadow-sm"></span>
          User Charge Collection
        </h3>
        <button className="text-xs text-purple-600 font-medium hover:bg-purple-50 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-purple-100">Details</button>
      </div>

      {data.length > 0 ? (
        <div className="space-y-5 flex-1 flex flex-col justify-center relative z-10">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <WalletIllustration className="w-48 h-48" />
          </div>
          {data.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx + 0.3 }}
              className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/40 transition-colors shadow-sm hover:shadow-md border border-transparent hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color} ring-2 ring-white shadow-sm group-hover:scale-125 transition-transform`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors font-display">{item.value}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState illustration={WalletIllustration} message="No collection data available" />
      )}
    </WidgetContainer>
  );
};

// --- Vehicle Status Widget ---
export const VehicleStatusWidget: React.FC<{ data?: { label: string; value: number; color: string }[] }> = ({ data = [] }) => {
  return (
    <WidgetContainer>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 font-display">
          <span className="w-1.5 h-5 bg-blue-500 rounded-full shadow-sm"></span>
          Vehicles
        </h3>
        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          LIVE
        </span>
      </div>

      {data.length > 0 ? (
        <>
          <div className="absolute -bottom-2 -right-6 opacity-10 pointer-events-none transform scale-x-[-1]">
            <TruckIllustration className="w-48 h-32" />
          </div>
          <div className="space-y-2.5 relative z-10">
            {data.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx + 0.4 }}
                className={`flex justify-between items-center p-3 rounded-xl border border-transparent hover:border-white/40 transition-all shadow-sm hover:shadow-md ${idx % 2 === 0 ? 'bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm' : 'bg-gray-50/30 dark:bg-gray-800/30'}`}
              >
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full min-w-[30px] text-center shadow-sm ${stat.color}`}>
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState illustration={TruckIllustration} message="No active vehicles found" />
      )}
    </WidgetContainer>
  );
};

// --- Complaint Donut Chart ---
export const ComplaintChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
  return (
    <WidgetContainer>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2 relative z-10 font-display">
        <span className="w-1.5 h-5 bg-amber-500 rounded-full shadow-sm"></span>
        Complaints
      </h3>

      {data.length > 0 ? (
        <div className="flex-1 min-h-[150px] flex items-center relative z-10">
          <div className="absolute -top-6 -right-6 opacity-10">
            <AlertIllustration className="w-40 h-40" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={5}
                dataKey="value"
                cornerRadius={6}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-gray-600 dark:text-gray-300 ml-1 font-medium">{entry.payload.value} {value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute left-[34%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-800 dark:text-white block leading-none font-display">{data.reduce((acc, curr) => acc + curr.value, 0)}</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total</span>
          </div>
        </div>
      ) : (
        <EmptyState illustration={AlertIllustration} message="No complaints filed" />
      )}
    </WidgetContainer>
  );
};

// --- Bulk Collection Chart ---
export const BulkCollectionChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
  return (
    <WidgetContainer>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2 relative z-10 font-display">
        <span className="w-1.5 h-5 bg-purple-500 rounded-full shadow-sm"></span>
        Bulk Collection
      </h3>

      {data.length > 0 ? (
        <div className="flex-1 min-h-[150px] flex items-center relative z-10">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <BinIllustration className="w-40 h-40" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                cornerRadius={6}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                  <span className="text-xs text-gray-600 dark:text-gray-300 ml-1 font-medium">{entry.payload.value} {value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState illustration={BinIllustration} message="No bulk collection data" />
      )}
    </WidgetContainer>
  );
};

// --- POI Widget ---
export const POIWidget: React.FC<{ total?: number, visited?: number }> = ({ total = 0, visited = 0 }) => {
  const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;

  return (
    <WidgetContainer>
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 font-display">
          <span className="w-1.5 h-5 bg-teal-500 rounded-full shadow-sm"></span>
          POI Coverage
        </h3>
        <motion.div
          whileHover={{ rotate: 90 }}
          className="p-2 bg-teal-50 rounded-full text-teal-600 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
        </motion.div>
      </div>

      {total > 0 ? (
        <div className="space-y-6 relative z-10">
          <div className="absolute top-10 -right-6 opacity-10 pointer-events-none">
            <MapIllustration className="w-40 h-40" />
          </div>
          <div className="flex justify-between items-end border-b border-dashed border-gray-200 dark:border-gray-700 pb-3">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total POIs</span>
            <span className="text-xl font-bold text-gray-800 dark:text-white font-display">{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Visited Today</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-xs text-green-600 font-bold">Live</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-gray-800 dark:text-white block font-display">{visited.toLocaleString()}</span>
              <span className="text-xs font-medium text-gray-400">Target: {total.toLocaleString()} ({percentage}%)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full shadow-sm"
            ></motion.div>
          </div>
        </div>
      ) : (
        <EmptyState illustration={MapIllustration} message="No POI data loaded" />
      )}

      <div className="mt-auto pt-4 text-[10px] text-gray-400 hover:text-teal-600 flex items-center gap-1 cursor-pointer group relative z-10 transition-colors">
        View Detailed Report <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </WidgetContainer>
  );
};

// --- Customer Chart ---
export const CustomerChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
  return (
    <WidgetContainer>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2 relative z-10 font-display">
        <span className="w-1.5 h-5 bg-orange-400 rounded-full shadow-sm"></span>
        Customer Distribution
      </h3>

      {data.length > 0 ? (
        <div className="flex-1 min-h-[150px] flex items-center relative z-10">
          <div className="absolute top-10 right-0 opacity-10 pointer-events-none">
            <PeopleIllustration className="w-32 h-32" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                cx="40%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                cornerRadius={6}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}
              />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry: any) => (
                  <span className="text-[10px] text-gray-600 dark:text-gray-300 ml-1 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState illustration={PeopleIllustration} message="No customer data" />
      )}
    </WidgetContainer>
  );
};