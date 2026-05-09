import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Plus, Search, Mail, 
  Phone, CreditCard, Calendar,
  CheckCircle2, AlertCircle, MoreVertical,
  UserPlus, Award
} from 'lucide-react';

const DriverManagement = () => {
  const [showForm, setShowForm] = useState(false);

  const drivers = [
    { 
      id: 'D-001', 
      name: 'Rajesh Kumar', 
      phone: '+91 98765 43210',
      license: 'UP81 20210001234',
      licenseExpiry: '2028-10-15',
      status: 'Active',
      assignedVehicle: 'UP81-AT-1234',
      experience: '12 Years'
    },
    { 
      id: 'D-002', 
      name: 'Amit Singh', 
      phone: '+91 87654 32109',
      license: 'UP81 20190005678',
      licenseExpiry: '2024-05-20',
      status: 'On Leave',
      assignedVehicle: 'None',
      experience: '8 Years'
    },
    { 
      id: 'D-003', 
      name: 'Suresh Yadav', 
      phone: '+91 76543 21098',
      license: 'UP81 20220009012',
      licenseExpiry: '2032-12-05',
      status: 'Active',
      assignedVehicle: 'UP81-CT-9012',
      experience: '15 Years'
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
            placeholder="Search by driver name or license..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-2"
          />
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
        >
          <UserPlus size={18} />
          Register Driver
        </button>
      </div>

      {/* Driver List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">License Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignment</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {drivers.map((d, idx) => (
                <motion.tr 
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">{d.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {d.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <CreditCard size={12} className="text-gray-400" />
                        {d.license}
                      </p>
                      <p className={`text-[10px] font-medium ${new Date(d.licenseExpiry) < new Date() ? 'text-rose-500' : 'text-gray-400'}`}>
                        Expires: {d.licenseExpiry}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {d.assignedVehicle !== 'None' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{d.assignedVehicle}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">Not Assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full 
                      ${d.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Experience</p>
            <h4 className="text-xl font-bold text-gray-800">45+ Years</h4>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Drivers</p>
            <h4 className="text-xl font-bold text-gray-800">12 Drivers</h4>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">License Alerts</p>
            <h4 className="text-xl font-bold text-rose-600">2 Pending</h4>
          </div>
        </div>
      </div>

      {/* Registration Modal (Simplified) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Driver Registration</h3>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-50 rounded-full text-gray-400"
              >
                <Plus className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input type="text" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Driver Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</label>
                  <input type="text" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="+91" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience (Years)</label>
                  <input type="number" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">License Number</label>
                <input type="text" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="UP..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">License Expiry Date</label>
                <input type="date" className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-[2] py-3 px-4 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">
                Register & Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
