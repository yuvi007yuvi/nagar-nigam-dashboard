import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Search, Plus, Filter, 
  AlertCircle, ArrowRight, ShoppingCart, 
  Boxes, History, ChevronRight,
  TrendingDown, TrendingUp
} from 'lucide-react';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('stock');

  const stock = [
    { id: 'SKU-001', name: 'Engine Oil (10W-40)', category: 'Lubricants', stock: 15, unit: 'Liters', min: 20, price: '₹450/L' },
    { id: 'SKU-002', name: 'Brake Pads (Rear)', category: 'Brakes', stock: 2, unit: 'Sets', min: 10, price: '₹2,500/Set' },
    { id: 'SKU-003', name: 'Air Filter', category: 'Filters', stock: 12, unit: 'Units', min: 15, price: '₹800/Unit' },
    { id: 'SKU-004', name: 'Hydraulic Seal Kit', category: 'Hydraulics', stock: 5, unit: 'Kits', min: 5, price: '₹4,200/Kit' },
    { id: 'SKU-005', name: 'Tyre 10.00-20', category: 'Tyres', stock: 8, unit: 'Units', min: 6, price: '₹18,500/Unit' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Items', value: '142', icon: Boxes, color: 'blue' },
          { label: 'Low Stock', value: '08', icon: AlertCircle, color: 'rose' },
          { label: 'Pending Requests', value: '03', icon: ShoppingCart, color: 'amber' },
          { label: 'Monthly Spend', value: '₹1.2L', icon: TrendingUp, color: 'emerald' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-bold text-gray-800 dark:text-white">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Inventory Master</h3>
            <div className="flex bg-gray-50 p-1 rounded-xl ml-4">
              <button onClick={() => setActiveTab('stock')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'stock' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>Current Stock</button>
              <button onClick={() => setActiveTab('requests')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'requests' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>Purchase Requests</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" placeholder="Search SKU..." className="bg-transparent border-none focus:ring-0 text-xs w-32" />
            </div>
            <button className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"><Plus size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Part Name / SKU</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stock</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stock.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-[10px] font-medium text-gray-400">{item.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.price}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black ${item.stock <= item.min ? 'text-rose-500' : 'text-gray-800'}`}>
                        {item.stock} {item.unit}
                      </span>
                      <div className="w-20 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.stock <= item.min ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((item.stock / item.min) * 50, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter 
                      ${item.stock <= item.min ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {item.stock <= item.min ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1 mx-auto">
                      Issue <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Workflow Visualizer */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h4 className="text-xl font-bold mb-2">Automated Inventory Workflow</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              When stock falls below threshold, the system automatically triggers a Purchase Request. 
              Once approved, vendor bills are tracked against job cards.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/50">
                <TrendingDown size={20} className="text-rose-400" />
              </div>
              <span className="text-[10px] font-black uppercase mt-2">Threshold</span>
            </div>
            <ArrowRight size={20} className="text-gray-600" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
                <AlertCircle size={20} className="text-amber-400" />
              </div>
              <span className="text-[10px] font-black uppercase mt-2">Alert</span>
            </div>
            <ArrowRight size={20} className="text-gray-600" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                <ShoppingCart size={20} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase mt-2">P. Request</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
