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
}

export const ColoredStatCard: React.FC<ColoredStatCardProps> = ({ title, value, icon: Icon, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl shadow-lg text-white ${color} min-h-[160px] flex flex-col justify-between group cursor-pointer`}
    >
      <div className="p-5 relative z-10 flex flex-col h-full">
         <div className="flex justify-between items-start">
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
                <Icon size={24} className="text-white" />
            </div>
         </div>
         
         <div className="mt-auto">
             <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
             <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
         </div>
      </div>
      
      {/* Footer Link */}
      <div className="relative z-10 bg-black/10 px-5 py-2.5 flex items-center justify-between backdrop-blur-sm group-hover:bg-black/20 transition-colors">
         <span className="text-xs font-medium tracking-wide">View Details</span>
         <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Decorative Large Icon */}
      <div className="absolute -top-6 -right-6 text-white opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
          <Icon size={140} />
      </div>
      
      {/* Shine Effect */}
      <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
    </motion.div>
  )
}

// --- Helper for Empty State ---
const EmptyState = ({ illustration: Illustration, message }: { illustration: React.ElementType, message: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[150px] opacity-70">
        <div className="scale-75 mb-2">
            <Illustration />
        </div>
        <p className="text-xs text-gray-500 font-medium">{message}</p>
    </div>
);

// --- User Charge Collection Widget ---
export const UserChargeWidget: React.FC<{ data?: { label: string; value: string; color: string }[] }> = ({ data = [] }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
          User Charge Collection
        </h3>
        <button className="text-xs text-purple-600 font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors">Details</button>
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
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color} ring-2 ring-white shadow-sm group-hover:scale-125 transition-transform`}></div>
                  <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{item.value}</span>
              </motion.div>
            ))}
          </div>
      ) : (
          <EmptyState illustration={WalletIllustration} message="No collection data available" />
      )}
    </motion.div>
  );
};

// --- Vehicle Status Widget ---
export const VehicleStatusWidget: React.FC<{ data?: { label: string; value: number; color: string }[] }> = ({ data = [] }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
          Vehicles
        </h3>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">Live</span>
      </div>

      {data.length > 0 ? (
          <>
            <div className="absolute -bottom-2 -right-6 opacity-20 pointer-events-none transform scale-x-[-1]">
                <TruckIllustration className="w-48 h-32" />
            </div>
            <div className="space-y-2 relative z-10">
                {data.map((stat, idx) => (
                <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx + 0.4 }}
                    className={`flex justify-between items-center p-2.5 rounded-lg border border-transparent hover:border-gray-100 transition-all ${idx % 2 === 0 ? 'bg-white/80' : 'bg-gray-50/50'}`}
                >
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full min-w-[30px] text-center shadow-sm ${stat.color}`}>
                    {stat.value}
                    </span>
                </motion.div>
                ))}
            </div>
          </>
      ) : (
          <EmptyState illustration={TruckIllustration} message="No active vehicles found" />
      )}
    </motion.div>
  );
};

// --- Complaint Donut Chart ---
export const ComplaintChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden"
    >
      <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 relative z-10">
         <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
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
                cornerRadius={4}
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
                </Pie>
                <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px' }}
                />
                <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry: any) => (
                        <span className="text-xs text-gray-600 ml-1 font-medium">{entry.payload.value} {value}</span>
                    )}
                />
            </PieChart>
            </ResponsiveContainer>
             <div className="absolute left-[34%] top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-xl font-bold text-gray-800 block leading-none">{data.reduce((acc, curr) => acc + curr.value, 0)}</span>
                <span className="text-[10px] text-gray-400">Total</span>
            </div>
        </div>
      ) : (
        <EmptyState illustration={AlertIllustration} message="No complaints filed" />
      )}
    </motion.div>
  );
};

// --- Bulk Collection Chart ---
export const BulkCollectionChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
    return (
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden"
      >
        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 relative z-10">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
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
                    cornerRadius={4}
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px' }}
                />
                <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry: any) => (
                        <span className="text-xs text-gray-600 ml-1 font-medium">{entry.payload.value} {value}</span>
                    )}
                />
                </PieChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <EmptyState illustration={BinIllustration} message="No bulk collection data" />
        )}
      </motion.div>
    );
};

// --- POI Widget ---
export const POIWidget: React.FC<{ total?: number, visited?: number }> = ({ total = 0, visited = 0 }) => {
    const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between relative overflow-hidden"
        >
             <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
                    POI Coverage
                </h3>
                <motion.div 
                    whileHover={{ rotate: 90 }}
                    className="p-2 bg-teal-50 rounded-full text-teal-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </motion.div>
             </div>
             
             {total > 0 ? (
                 <div className="space-y-6 relative z-10">
                    <div className="absolute top-10 -right-6 opacity-10 pointer-events-none">
                        <MapIllustration className="w-40 h-40" />
                    </div>
                    <div className="flex justify-between items-end border-b border-dashed border-gray-200 pb-3">
                        <span className="text-gray-500 text-sm font-medium">Total POIs</span>
                        <span className="text-xl font-bold text-gray-800">{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-sm font-medium">Visited Today</span>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs text-green-600 font-bold">Live</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-gray-800 block">{visited.toLocaleString()}</span>
                            <span className="text-xs font-medium text-gray-400">Target: {total.toLocaleString()} ({percentage}%)</span>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-full"
                        ></motion.div>
                    </div>
                 </div>
             ) : (
                <EmptyState illustration={MapIllustration} message="No POI data loaded" />
             )}
             
             <div className="mt-auto pt-4 text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer group relative z-10">
                 View Detailed Report <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
             </div>
        </motion.div>
    );
};

// --- Customer Chart ---
export const CustomerChart: React.FC<{ data?: any[] }> = ({ data = [] }) => {
    return (
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden"
      >
        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2 relative z-10">
            <span className="w-1 h-4 bg-orange-400 rounded-full"></span>
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
                    cornerRadius={4}
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px' }}
                />
                <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry: any) => (
                        <span className="text-[10px] text-gray-600 ml-1 font-medium">{value}</span>
                    )}
                />
                </PieChart>
            </ResponsiveContainer>
            </div>
        ) : (
             <EmptyState illustration={PeopleIllustration} message="No customer data" />
        )}
      </motion.div>
    );
  };