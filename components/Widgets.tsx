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
import { 
  Cloud, Sun, CloudRain, Thermometer, 
  Plus, FileText, UserPlus, MapPin, 
  ChevronRight, TrendingUp, Award, Zap
} from 'lucide-react';

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

export const ColoredStatCard: React.FC<ColoredStatCardProps> = React.memo(({ title, value, icon: Icon, image, color, delay = 0, onClick }) => {
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
  );
});

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
export const UserChargeWidget: React.FC<{ data?: { label: string; value: string; color: string }[] }> = React.memo(({ data = [] }) => {
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
});

// --- Vehicle Status Widget ---
export const VehicleStatusWidget: React.FC<{ data?: { label: string; value: number; color: string }[] }> = React.memo(({ data = [] }) => {
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
});

// --- Complaint Donut Chart ---
export const ComplaintChart: React.FC<{ data?: any[] }> = React.memo(({ data = [] }) => {
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
            <div className="relative w-[140px] h-[140px] flex-shrink-0" style={{ minHeight: '140px', minWidth: '140px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
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
});

// --- Bulk Collection Chart ---
export const BulkCollectionChart: React.FC<{ data?: { segments: any[] } }> = React.memo(({ data }) => {
  const segments = data?.segments || [];
  const total = segments.reduce((a: number, b: any) => a + (isNaN(b.value) ? 0 : b.value), 0);

  return (
    <WidgetContainer>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2 relative z-10 font-display">
        <span className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-sm"></span>
        Bulk Collection
      </h3>

      {total > 0 ? (
        <div className="flex-1 flex items-center relative z-10 min-h-0">
          <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
            <BinIllustration className="w-40 h-40" />
          </div>

          <div className="flex items-center w-full gap-4">
            {/* Donut Chart */}
            <div className="relative w-[130px] h-[130px] flex-shrink-0" style={{ minHeight: '130px', minWidth: '130px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={130}>
                <PieChart>
                  <Pie
                    data={segments}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {segments.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800 dark:text-white leading-none font-display">
                  {total}
                </span>
                <span className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 flex flex-col gap-2.5 pr-2">
              {segments.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
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
        <EmptyState illustration={BinIllustration} message="No bulk collection data" />
      )}
    </WidgetContainer>
  );
});

// --- POI Widget ---
export const POIWidget: React.FC<{ total?: number, assigned?: number, visited?: number }> = React.memo(({ total = 0, assigned = 0, visited = 0 }) => {
  const percentage = assigned > 0 ? Math.round((visited / assigned) * 100) : 0;

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

      <div className="space-y-4 relative z-10">
        <div className="absolute top-10 -right-6 opacity-10 pointer-events-none">
          <MapIllustration className="w-40 h-40" />
        </div>
        
        {/* Line 1: Total Customer */}
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">Total Customer</span>
          <span className="text-lg font-black text-gray-800 dark:text-white font-display">{total.toLocaleString()}</span>
        </div>

        {/* Line 2: Assigned on Route */}
        <div className="flex justify-between items-center py-1 border-t border-dashed border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">Assigned on Route</span>
          <span className="text-lg font-black text-teal-600 dark:text-teal-400 font-display">{assigned.toLocaleString()}</span>
        </div>

        {/* Line 3: Covered POI */}
        <div className="flex justify-between items-center py-1 border-t border-dashed border-gray-100 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider">Covered POI</span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] text-green-600 font-black uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-gray-800 dark:text-white block font-display">{visited.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-gray-400">Completion: {percentage}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2 overflow-hidden mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full shadow-sm"
          ></motion.div>
        </div>
      </div>

      <div className="mt-auto pt-4 text-[10px] text-gray-400 font-bold hover:text-teal-600 flex items-center gap-1 cursor-pointer group relative z-10 transition-colors uppercase tracking-widest">
        View Detailed Report <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </WidgetContainer>
  );
});

// --- Customer Chart ---
export const CustomerChart: React.FC<{ data?: any[] }> = React.memo(({ data = [] }) => {
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
            <div className="relative w-[130px] h-[130px] flex-shrink-0" style={{ minHeight: '130px', minWidth: '130px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={130}>
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
                  {data.reduce((acc, curr) => acc + (isNaN(curr.value) ? 0 : curr.value), 0)}
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
                    {item.value}
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
});

// --- Weather Widget ---
export const WeatherWidget: React.FC = () => {
  // Mock weather data - in a real app this would come from an API
  const weather = {
    temp: 32,
    condition: 'Sunny',
    location: 'Mathura, UP',
    humidity: '45%',
    wind: '12 km/h',
    icon: Sun
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-4 rounded-2xl border border-white/40 shadow-xl flex items-center gap-4 bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-gray-800/80 dark:to-blue-900/20 backdrop-blur-xl"
    >
      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400 shadow-inner">
        <weather.icon size={28} className="animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-black text-gray-800 dark:text-white font-display">{weather.temp}°C</span>
          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md border border-amber-100/50">
            {weather.condition}
          </span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter flex items-center gap-1 mt-0.5">
          <MapPin size={10} />
          {weather.location}
        </p>
      </div>
      <div className="ml-auto flex flex-col gap-1 items-end border-l border-gray-200 dark:border-gray-700 pl-4">
        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
          <Thermometer size={10} />
          {weather.humidity} Hum
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500">
          <Zap size={10} />
          {weather.wind} Wind
        </div>
      </div>
    </motion.div>
  );
};

// --- Quick Action Card ---
export const QuickActionCard: React.FC<{ title: string, icon: React.ElementType, color: string, onClick?: () => void }> = ({ title, icon: Icon, color, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border border-white/40 shadow-lg transition-all group relative overflow-hidden h-full w-full bg-white dark:bg-gray-800`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${color} transition-opacity`} />
      <div className={`p-3 rounded-xl mb-3 ${color.replace('from-', 'bg-').replace('to-', '').split(' ')[0]} bg-opacity-10 text-gray-700 dark:text-gray-200 group-hover:scale-110 transition-transform shadow-inner`}>
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest text-center leading-tight">
        {title}
      </span>
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </motion.button>
  );
};

// --- Top Performing Wards Widget ---
export const TopWardsWidget: React.FC<{ data?: { name: string, score: number, trend: string }[] }> = React.memo(({ data = [] }) => {
  const wards = data.length > 0 ? data : [
    { name: 'N/A', score: 0, trend: 'neutral' },
  ];

  return (
    <WidgetContainer>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 font-display">
          <Award size={18} className="text-yellow-500" />
          Top Performing Wards
        </h3>
        <TrendingUp size={16} className="text-emerald-500" />
      </div>
      
      <div className="space-y-3 relative z-10">
        {wards.map((ward, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                {idx + 1}
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{ward.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-emerald-600">{ward.score}%</span>
              <div className={`w-1.5 h-1.5 rounded-full ${ward.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-auto pt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
        Full Rankings <ArrowRight size={10} />
      </button>
    </WidgetContainer>
  );
});