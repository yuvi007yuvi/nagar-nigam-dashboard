import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, Navigation, Gauge, 
  Fuel, MapPin, Play, Square,
  CheckCircle2, XCircle, Search,
  Plus, History, ArrowRight
} from 'lucide-react';

const InspectionTripManagement = () => {
  const [activeTab, setActiveTab] = useState('monthly');

  const checklist = [
    { name: 'Engine Health & Lubrication', status: 'pass' },
    { name: 'Brake System Deep Check', status: 'pass' },
    { name: 'Tyre Rotation & Tread Depth', status: 'pass' },
    { name: 'Electrical & Battery Life', status: 'fail', remark: 'Weak battery detected' },
    { name: 'Hydraulic System Integrity', status: 'pass' },
    { name: 'Suspension & Chassis Inspection', status: 'pass' },
    { name: 'Monthly Fuel Efficiency Audit', status: 'pass' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit shadow-sm">
        <button onClick={() => setActiveTab('monthly')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'monthly' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400'}`}>Monthly Maintenance</button>
      </div>

      {activeTab === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="text-emerald-500" size={18} />
                Monthly Service Checklist
              </h4>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle: UP81-AT-1234</span>
            </div>

            <div className="space-y-4">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-50 group hover:border-emerald-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.status === 'pass' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {item.status === 'pass' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700">{item.name}</p>
                      {item.remark && <p className="text-[10px] text-rose-500 font-medium">{item.remark}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded-lg bg-white border border-gray-100 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50">Verify</button>
                    <button className="px-3 py-1 rounded-lg bg-white border border-gray-100 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50">Issue</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/20">
              Submit Monthly Audit
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Maintenance Summary</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Gauge size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance Score</p>
                    <p className="text-lg font-bold text-gray-800">94.2%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audits Completed</p>
                    <p className="text-lg font-bold text-gray-800">112 / 124 Vehicles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionTripManagement;
