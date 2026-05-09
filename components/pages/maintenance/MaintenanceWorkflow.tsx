import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, Plus, Search, Filter, 
  AlertTriangle, Clock, CheckCircle2, 
  User, Wrench, Camera, FileText,
  ChevronRight, ArrowRight, Settings2,
  ThumbsUp, ThumbsDown, Truck
} from 'lucide-react';

const MaintenanceWorkflow = () => {
  const [activeStep, setActiveStep] = useState('tickets');
  const [showRaiseForm, setShowRaiseForm] = useState(false);

  const tickets = [
    { 
      id: 'TIC-2024-001', 
      vehicle: 'UP81-AT-1234', 
      category: 'Engine', 
      priority: 'Emergency', 
      status: 'Awaiting Approval',
      raisedBy: 'Operator Ravi',
      time: '10 mins ago'
    },
    { 
      id: 'TIC-2024-002', 
      vehicle: 'UP81-BT-5678', 
      category: 'Brake', 
      priority: 'High', 
      status: 'Approved',
      raisedBy: 'Driver Amit',
      time: '2 hours ago'
    },
    { 
      id: 'TIC-2024-003', 
      vehicle: 'UP81-CT-9012', 
      category: 'Electrical', 
      priority: 'Medium', 
      status: 'Job Card Generated',
      raisedBy: 'Operator Sunil',
      time: '5 hours ago'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Navigation */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto scrollbar-hide">
        {[
          { id: 'tickets', name: 'Active Tickets', icon: ClipboardList },
          { id: 'tracking', name: 'Track Status', icon: Settings2 },
          { id: 'approvals', name: 'Manager Approvals', icon: ThumbsUp },
          { id: 'jobcards', name: 'Job Cards', icon: Wrench },
          { id: 'qc', name: 'QC Inspection', icon: CheckCircle2 },
        ].map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeStep === step.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <step.icon size={16} />
            {step.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeStep === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Live Tickets</h3>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">12 Active</span>
              </div>
              <button 
                onClick={() => setShowRaiseForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
              >
                <Plus size={18} />
                Raise New Complaint
              </button>
            </div>

            {/* Ticket Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((t, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${
                    t.priority === 'Emergency' ? 'bg-rose-500' : 
                    t.priority === 'High' ? 'bg-amber-500' : 'bg-blue-500'}`} 
                  />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t.id}</span>
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {t.time}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{t.vehicle}</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase">{t.category}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase 
                      ${t.priority === 'Emergency' ? 'bg-rose-50 text-rose-600' : 
                        t.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                      {t.priority}
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-gray-50 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Raised By</span>
                      <span className="text-xs font-bold text-gray-700">{t.raisedBy}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Workflow Status</span>
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter italic">{t.status}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveStep('tracking')}
                    className="w-full mt-5 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                  >
                    Track Progress <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeStep === 'tracking' && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">Tracking: TIC-2024-001</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Truck size={14} /> UP81-AT-1234 (Refuse Compactor)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Completion</p>
                    <p className="text-sm font-bold text-gray-800">Today, 04:30 PM</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 -z-10 hidden md:block"></div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {[
                    { step: 'Complaint', status: 'completed', date: '09:15 AM' },
                    { step: 'Manager Approval', status: 'completed', date: '10:00 AM' },
                    { step: 'Garage Assignment', status: 'active', date: 'Processing' },
                    { step: 'Repairing', status: 'pending', date: '--' },
                    { step: 'Quality Check', status: 'pending', date: '--' },
                  ].map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all
                        ${s.status === 'completed' ? 'bg-emerald-500 border-emerald-100 text-white' : 
                          s.status === 'active' ? 'bg-white border-emerald-500 text-emerald-600 scale-125' : 
                          'bg-white border-gray-100 text-gray-300'}`}>
                        {s.status === 'completed' ? <CheckCircle2 size={18} /> : <span className="text-xs font-black">{idx + 1}</span>}
                      </div>
                      <p className={`mt-4 text-[11px] font-black uppercase tracking-widest ${s.status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>
                        {s.step}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{s.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Mechanic</p>
                    <p className="text-sm font-bold text-gray-800">Waiting for assignment...</p>
                  </div>
                </div>
                <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold shadow-lg">
                  Notify Manager
                </button>
              </div>
            </div>

            <button 
              onClick={() => setActiveStep('tickets')}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" /> Back to Tickets
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Raise Complaint Modal (Workflow Step 1 & 2) */}
      {showRaiseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Raise Vehicle Complaint</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">Step 1: Ticket Generation</p>
              </div>
              <button onClick={() => setShowRaiseForm(false)} className="p-2 hover:bg-white rounded-full text-gray-400">
                <Plus className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Vehicle</label>
                  <select className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold">
                    <option>UP81-AT-1234</option>
                    <option>UP81-BT-5678</option>
                    <option>UP81-CT-9012</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Category</label>
                  <select className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold">
                    <option>Engine</option>
                    <option>Brake</option>
                    <option>Tyre</option>
                    <option>Battery</option>
                    <option>Electrical</option>
                    <option>Accident</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Low', 'Medium', 'High', 'Emergency'].map((p) => (
                    <button key={p} className="py-2 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Problem Description</label>
                <textarea className="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm min-h-[100px]" placeholder="Describe the issue in detail..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Proof (Photo)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer">
                  <Camera size={32} className="text-gray-300" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Click to capture or upload</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setShowRaiseForm(false)}
                className="flex-1 py-3 px-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowRaiseForm(false);
                  setActiveStep('tickets');
                  alert('Ticket Generated Successfully!');
                }}
                className="flex-[2] py-3 px-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg flex items-center justify-center gap-2"
              >
                Generate Ticket <Settings2 size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceWorkflow;
