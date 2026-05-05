import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Truck, Clock, Map as MapIcon, 
  ChevronLeft, ChevronRight, Play, Pause, 
  RotateCcw, History, Search, Filter, Activity,
  Navigation, Signal, MapPin
} from 'lucide-react';
import { useVehicleData, VehicleData } from '../../services/vehicleService';
import { db } from '../../services/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Custom Map center update component
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const VehicleHistoryPage: React.FC = () => {
  const { vehicles } = useVehicleData();
  const [selectedImei, setSelectedImei] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.imei.includes(searchQuery)
      )
      .sort((a, b) => {
        const speedA = parseFloat(a.speed) || 0;
        const speedB = parseFloat(b.speed) || 0;
        return speedB - speedA; // Higher speed (moving) first
      });
  }, [vehicles, searchQuery]);

  const fetchHistory = async (imei: string) => {
    setSelectedImei(imei);
    setLoading(true);
    setIsPlaying(false);
    try {
      const historyCol = collection(db, 'vehicle_history');
      const q = query(
        historyCol,
        where('imei', '==', imei),
        where('day', '==', selectedDate),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => doc.data());
      setHistoryData(data);
      setCurrentFrame(0);
      
      if (data.length === 0) {
        console.log('No history data found for this date');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && historyData.length > 0) {
      interval = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= historyData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 500 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, historyData, playbackSpeed]);

  const pathPositions: [number, number][] = useMemo(() => {
    return historyData
      .map(point => [parseFloat(point.lat), parseFloat(point.lng)] as [number, number])
      .filter(pos => !isNaN(pos[0]) && !isNaN(pos[1]));
  }, [historyData]);
  
  const currentPosition = useMemo(() => {
    if (historyData.length === 0 || !historyData[currentFrame]) return [27.4924, 77.6737] as [number, number];
    const lat = parseFloat(historyData[currentFrame].lat);
    const lng = parseFloat(historyData[currentFrame].lng);
    
    if (isNaN(lat) || isNaN(lng)) return [27.4924, 77.6737] as [number, number];
    return [lat, lng] as [number, number];
  }, [historyData, currentFrame]);

  const vehicleIcon = (angle: string, time: string) => L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="position: relative; width: 48px; height: 48px;">
            <div style="transform: rotate(${angle || 0}deg); color: #ff0000; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: #ff0000; color: white; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 900; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 1px solid white;">
              ${time}
            </div>
          </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Left Sidebar: Vehicle List */}
      <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
              <History size={20} />
            </div>
            <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Vehicle Fleet</h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
            />
          </div>
          
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Select Date</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold transition-all"
              />
            </div>
            
            <button
              onClick={() => selectedImei && fetchHistory(selectedImei)}
              disabled={!selectedImei || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RotateCcw size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Fetching...' : 'Fetch History'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {filteredVehicles.map(v => {
            const isSelected = selectedImei === v.imei;
            const isMoving = parseFloat(v.speed) > 0;
            
            return (
              <motion.button
                key={v.imei}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedImei(v.imei)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all border ${
                  isSelected 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Truck size={18} className={isSelected ? 'text-white' : 'text-gray-500'} />
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <p className={`font-black text-xs truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {v.name}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isMoving ? 'bg-emerald-400' : 'bg-gray-400'} ${isSelected && isMoving ? 'bg-white animate-pulse' : ''}`}></span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider truncate ${isSelected ? 'text-emerald-50' : 'text-gray-400'}`}>
                        {isMoving ? `${v.speed} km/h` : 'Stopped'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-60">
                      <Clock size={10} />
                      <span className="text-[9px] font-bold truncate">
                        {v.dt_tracker ? new Date(v.dt_tracker).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No Data'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isSelected && loading && <RotateCcw size={14} className="animate-spin flex-shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Area: Map and Stats */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Map View */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 relative">
          <MapContainer center={[27.4924, 77.6737]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {historyData.length > 0 && (
              <>
                <ChangeView center={currentPosition} zoom={15} />
                <Polyline positions={pathPositions} color="#ff0000" weight={6} opacity={0.8} />
                <Marker 
                  position={currentPosition} 
                  icon={vehicleIcon(
                    historyData[currentFrame]?.angle || '0',
                    historyData[currentFrame]?.timestamp ? new Date(historyData[currentFrame].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''
                  )}
                >
                  <Popup>
                    <div className="p-2 font-bold">
                      <p>{historyData[currentFrame]?.name}</p>
                      <p className="text-xs text-gray-500">{new Date(historyData[currentFrame]?.timestamp).toLocaleTimeString()}</p>
                      <p className="text-emerald-600">{historyData[currentFrame]?.speed} km/h</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>

          {/* Playback Controls Overlay */}
          <AnimatePresence>
            {historyData.length > 0 && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-3 min-w-[300px] md:min-w-[500px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button 
                      onClick={() => setCurrentFrame(0)}
                      className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 flex-1 mx-6">
                    <input 
                      type="range" 
                      min="0" 
                      max={historyData.length - 1} 
                      value={currentFrame}
                      onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                      className="w-full h-2 bg-emerald-200 dark:bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <select 
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="bg-transparent font-bold text-sm outline-none"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1">1.0x</option>
                    <option value="2">2.0x</option>
                    <option value="4">4.0x</option>
                  </select>
                </div>
                
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span>Start: {new Date(historyData[0].timestamp).toLocaleTimeString()}</span>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-emerald-500" />
                    <span className="text-emerald-600 font-black">{new Date(historyData[currentFrame].timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span>End: {new Date(historyData[historyData.length-1].timestamp).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedImei && !loading && (
            <div className="absolute inset-0 z-[1001] bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center max-w-sm">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  <Navigation size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Ready to Track</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please select a vehicle from the list on the left to visualize its route history.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 z-[1001] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-emerald-600 uppercase tracking-widest text-xs">Loading History Data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatMiniCard 
            label="Total Points" 
            value={historyData.length} 
            icon={MapPin} 
            color="emerald" 
          />
          <StatMiniCard 
            label="Max Speed" 
            value={historyData.length > 0 ? `${Math.max(...historyData.map(p => parseFloat(p.speed)))} km/h` : '0 km/h'} 
            icon={Signal} 
            color="blue" 
          />
          <StatMiniCard 
            label="Selected Date" 
            value={selectedDate} 
            icon={Calendar} 
            color="indigo" 
          />
          <StatMiniCard 
            label="Fleet Status" 
            value={`${vehicles.length} Active`} 
            icon={Activity} 
            color="amber" 
          />
        </div>
      </div>
    </div>
  );
};

const StatMiniCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} shadow-sm flex items-center gap-4`}>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-sm font-black">{value}</p>
      </div>
    </div>
  );
};

export default VehicleHistoryPage;
