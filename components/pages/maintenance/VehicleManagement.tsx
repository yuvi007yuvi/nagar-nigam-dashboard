import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, Plus, Search, Filter, 
  FileText, Shield, Activity, 
  ChevronRight, MoreVertical, Upload,
  Calendar, CheckCircle2, AlertCircle
} from 'lucide-react';

const VehicleManagement = () => {
  const [showForm, setShowForm] = useState(false);

  const vehicles = [
    { 
      id: 'V-001', 
      number: 'UP81-AT-1234', 
      type: 'Refuse Compactor', 
      model: 'Tata Prima 2825.K',
      status: 'Active', 
      nextService: '2024-05-15',
      insurance: '2025-01-20',
      fitness: '2024-11-10'
    },
    { 
      id: 'V-002', 
      number: 'UP81-BT-5678', 
      type: 'Dumper Placer', 
      model: 'Ashok Leyland Ecomet',
      status: 'In-Shop', 
      nextService: 'Overdue',
      insurance: '2024-06-15',
      fitness: '2024-09-05'
    },
    { 
      id: 'V-003', 
      number: 'UP81-CT-9012', 
      type: 'JCB / Loader', 
      model: 'JCB 3DX Eco',
      status: 'Active', 
      nextService: '2024-06-01',
      insurance: '2024-12-30',
      fitness: '2025-02-20'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 w-full md:w-96">
          <div className="p-2 text-gray-400"><Search size={18} /></div>
          <input 
            type="text" 
            placeholder="Search by vehicle number or type..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-2"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300">
            <Filter size={16} />
            Filters
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{v.number}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{v.type}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full 
                ${v.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {v.status}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Model Number</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{v.model}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Next Service</span>
                <span className={`font-bold ${v.nextService === 'Overdue' ? 'text-rose-500' : 'text-gray-700 dark:text-gray-300'}`}>{v.nextService}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                <Shield size={14} className="mx-auto mb-1 text-blue-500" />
                <p className="text-[8px] font-black text-gray-400 uppercase">Insurance</p>
                <p className="text-[9px] font-bold text-gray-700 dark:text-gray-300 mt-0.5 truncate">Jan 2025</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                <FileText size={14} className="mx-auto mb-1 text-emerald-500" />
                <p className="text-[8px] font-black text-gray-400 uppercase">RC Docs</p>
                <p className="text-[9px] font-bold text-gray-700 dark:text-gray-300 mt-0.5">Verified</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center border border-gray-100 dark:border-gray-700">
                <Activity size={14} className="mx-auto mb-1 text-amber-500" />
                <p className="text-[8px] font-black text-gray-400 uppercase">Fitness</p>
                <p className="text-[9px] font-bold text-gray-700 dark:text-gray-300 mt-0.5">Nov 2024</p>
              </div>
            </div>

            <button className="w-full mt-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
              View Fleet Profile <ChevronRight size={12} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal (Simplified) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Register New Vehicle</h3>
                <p className="text-xs text-gray-500 mt-1">Complete the fleet registration details below</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full text-gray-400"
              >
                <Plus className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vehicle Number</label>
                  <input type="text" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. UP81-AT-1234" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vehicle Type</label>
                  <select className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm">
                    <option>Refuse Compactor</option>
                    <option>Dumper Placer</option>
                    <option>Tipper</option>
                    <option>Sewer Jetting</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Model Number</label>
                  <input type="text" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. Tata Prima 2825.K" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">RC Details</label>
                  <input type="text" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="RC Number" />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} /> Compliance & Expiry
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500">Insurance Expiry</label>
                    <input type="date" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500">PUC Expiry</label>
                    <input type="date" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500">Fitness Expiry</label>
                    <input type="date" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2 text-xs" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <Upload size={14} /> Document Uploads
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['RC Copy', 'Insurance', 'PUC', 'Fitness'].map((doc) => (
                    <div key={doc} className="aspect-square border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer group">
                      <div className="p-2 bg-gray-50 rounded-full group-hover:bg-white transition-colors">
                        <Plus size={16} className="text-gray-400 group-hover:text-emerald-600" />
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex gap-3">
              <button 
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-[2] py-3 px-4 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">
                Save Vehicle Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
