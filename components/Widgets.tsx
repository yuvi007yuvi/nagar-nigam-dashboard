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
  icon?: React.ElementType;
  image?: string;
  color: string;
  delay?: number;
  onClick?: () => void;
}

export const ColoredStatCard: React.FC<ColoredStatCardProps> = ({ title, value, icon: Icon, image, color, delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover:shadow-${color.split('-')[1]}-500/10 transition-all duration-300 text-white ${color} min-h-[130px] flex flex-col justify-between group ${onClick ? 'cursor-pointer' : ''} border border-white/40`}
    >
      <div className="p-5 relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-inner border border-white/20 overflow-hidden">
            {image ? (
              <img src={image} alt={title} className="w-8 h-8 object-contain drop-shadow-lg" />
            ) : Icon ? (
              <Icon size={24} className="text-white drop-shadow-sm" />
            ) : null}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-sm font-medium text-white/90 mb-1 tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight font-display drop-shadow-md">{value}</h3>
        </div>
      </div>

      {/* Footer Link */}
      <div className="relative z-10 bg-black/10 px-4 py-2 flex items-center justify-between backdrop-blur-sm group-hover:bg-black/20 transition-colors border-t border-white/10">
        <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">View Details</span>
        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform opacity-90" />
      </div>

      {/* Decorative Large Icon */}
      <div className="absolute -top-6 -right-6 text-white opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 ease-out">
        {image ? (
          <img src={image} alt="" className="w-32 h-32 object-contain opacity-20" />
        ) : Icon ? (
          <Icon size={140} />
        ) : null}
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
    className={`glass shadow-lg hover:shadow-xl dark:bg-gray-800/50 dark:border-gray-700 rounded-2xl p-4 h-full flex flex-col relative overflow-hidden transition-all duration-300 border border-gray-100 dark:border-gray-700 ${className}`}
  >
    {children}
  </motion.div>
);

// --- User Charge Collection Widget ---
export const UserChargeWidget: React.FC<{ data?: { label: string; value: string; color: string }[] }> = ({ data = [] }) => {
  return (
    <WidgetContainer>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 flex items-center gap-2 uppercase tracking-widest">
          <span className="w-1 h-3.5 bg-purple-500 rounded-full"></span>
          Collection
        </h3>
        <button className="text-[10px] text-purple-600 font-bold hover:bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 transition-colors">Details</button>
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
        <div className="flex-1 flex items-center relative z-10 min-h-0">
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <AlertIllustration className="w-40 h-40" />
          </div>

          <div className="flex items-center w-full gap-4">
            {/* Chart Container */}
            <div className="relative w-[140px] h-[140px] flex-shrink-0" style={{ minHeight: '140px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={140}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Perfectly Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800 dark:text-white leading-none font-display">
                  {data.reduce((acc, curr) => acc + (isNaN(curr.value) ? 0 : curr.value), 0)}
                </span>
                <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Total</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 flex flex-col gap-2.5 pr-2">
              {[...data].reverse().map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState illustration={AlertIllustration} message="No complaints filed" />
      )}
    </WidgetContainer>
  );
};

// --- Bulk Collection Chart ---
export const BulkCollectionChart: React.FC<{ data?: { segments: any[], binStatus: any[] } }> = ({ data }) => {
  const segments = data?.segments || [];
  const binStatus = data?.binStatus || [];

  return (
    <WidgetContainer>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 font-display">
          <span className="w-1.5 h-5 bg-blue-500 rounded-full shadow-sm"></span>
          Bulk & Smart Bins
        </h3>
        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">IoT Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        {/* Top: Minimal Pie Chart */}
        <div className="h-[105px] relative" style={{ minHeight: '105px' }}>
          <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
            <BinIllustration className="w-24 h-24" />
          </div>
          <ResponsiveContainer width="100%" height="100%" minHeight={105}>
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={48}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {segments.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-gray-800 dark:text-white leading-none">
              {segments.reduce((a: any, b: any) => a + (isNaN(b.value) ? 0 : b.value), 0)}
            </span>
            <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Units</span>
          </div>
        </div>

        {/* Bottom: Smart Bin Status */}
        <div className="space-y-2.5 px-1">
          {binStatus.map((bin, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 dark:text-gray-400 tracking-tight">{bin.location}</span>
                <span className={`${bin.fill > 80 ? 'text-rose-500' : 'text-gray-700 dark:text-gray-200'}`}>{bin.fill}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bin.fill}%` }}
                  transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                  className={`h-full ${bin.color} rounded-full shadow-sm`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
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

      <div className="mt-auto pt-4 text-[10px] text-gray-400 font-bold hover:text-teal-600 flex items-center gap-1 cursor-pointer group relative z-10 transition-colors uppercase tracking-widest">
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
        <div className="flex-1 flex items-center relative z-10 min-h-0">
          <div className="absolute top-10 right-0 opacity-5 pointer-events-none">
            <PeopleIllustration className="w-32 h-32" />
          </div>

          <div className="flex items-center w-full gap-4">
            {/* Chart Container */}
            <div className="relative w-[130px] h-[130px] flex-shrink-0" style={{ minHeight: '130px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={130}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered % */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-gray-800 dark:text-white leading-none font-display">
                  {data.reduce((acc, curr) => acc + (isNaN(curr.value) ? 0 : curr.value), 0)}%
                </span>
                <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Users</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 flex flex-col gap-2 pr-2">
              {data.map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 group-hover:text-gray-800 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-gray-700 dark:text-gray-200">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState illustration={PeopleIllustration} message="No customer data" />
      )}
    </WidgetContainer>
  );
};