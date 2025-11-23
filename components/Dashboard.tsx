import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Wallet, Fuel, Truck, Car,
  CalendarCheck, AlertTriangle, Sparkles, Plus, Minus,
  Recycle, IndianRupee, Shield
} from 'lucide-react';
import {
  ColoredStatCard, UserChargeWidget, VehicleStatusWidget,
  ComplaintChart, BulkCollectionChart, POIWidget, CustomerChart
} from './Widgets';


interface DashboardProps {
  onGenerateInsight: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerateInsight }) => {


  // Stagger container for children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Overview</h2>
        <div className="flex gap-3 w-full sm:w-auto">

          <motion.button
            onClick={onGenerateInsight}
            whileHover={{ scale: 1.05, boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-semibold border border-purple-400/20"
          >
            <Sparkles size={16} className="animate-pulse" />
            AI Insights
          </motion.button>
        </div>
      </motion.div>

      {/* Top Colored Stats Grid - Values reset to 0/empty */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <ColoredStatCard
          title="Waste(Ton.)"
          value="0"
          icon={Recycle}
          color="bg-gradient-to-br from-blue-400 to-blue-600"
          delay={0.1}
        />
        <ColoredStatCard
          title="Vehicles"
          value="0"
          icon={Truck}
          color="bg-gradient-to-br from-teal-400 to-teal-600"
          delay={0.2}
        />
        <ColoredStatCard
          title="Fuel(Ltr/Cost)"
          value="0L/₹0"
          icon={Fuel}
          color="bg-gradient-to-br from-orange-300 to-orange-500"
          delay={0.3}
        />
        <ColoredStatCard
          title="Attendance"
          value="0/0"
          icon={CalendarCheck}
          color="bg-gradient-to-br from-indigo-500 to-blue-700"
          delay={0.4}
        />
        <ColoredStatCard
          title="Complaints"
          value="0"
          icon={AlertTriangle}
          color="bg-gradient-to-br from-rose-400 to-pink-600"
          delay={0.5}
        />
        <ColoredStatCard
          title="User Fees"
          value="₹0"
          icon={IndianRupee}
          color="bg-gradient-to-br from-purple-500 to-violet-600"
          delay={0.6}
        />
      </div>

      {/* Middle Section Grid - Widgets will default to empty state */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 h-full">
          <UserChargeWidget />
        </div>
        <div className="lg:col-span-1 h-full">
          <VehicleStatusWidget />
        </div>
        <div className="lg:col-span-1 h-full">
          <ComplaintChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <BulkCollectionChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <POIWidget total={0} visited={0} />
        </div>
        <div className="lg:col-span-1 h-full">
          <CustomerChart />
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
            Live Ward Monitoring
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="relative inline-block w-8 h-4 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-green-500 right-0" defaultChecked />
                <span className="toggle-label block overflow-hidden h-4 rounded-full bg-green-500"></span>
              </div>
              <span className="font-medium text-gray-600">Switch Map</span>
            </label>
          </div>
        </div>
        <div className="relative w-full h-[350px] sm:h-[500px] rounded-xl overflow-hidden">
          {/* Free OpenStreetMap Implementation */}
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=77.6537,27.4724,77.6937,27.5124&layer=mapnik"
            className="w-full h-full border-0"
            title="Live Ward Monitoring Map"
          ></iframe>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden opacity-70">
            <button className="p-2 text-gray-600 border-b border-gray-200 hover:bg-gray-50">
              <Plus size={16} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-50">
              <Minus size={16} />
            </button>
          </div>

          {/* Map Attribution */}
          <div className="absolute bottom-1 left-2 bg-white/80 px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium shadow-sm">
            Map data © <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;