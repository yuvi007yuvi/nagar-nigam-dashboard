import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Truck, Clock, Map as MapIcon, 
  ChevronLeft, ChevronRight, Play, Pause, 
  RotateCcw, History, Search, Filter, Activity,
  Navigation, Signal, MapPin, X, Eye, EyeOff, Layers
} from 'lucide-react';
import KMLLayers from '../shared/KMLLayers';
import MapSettingsOverlay from '../shared/MapSettingsOverlay';

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
  const [showRoutePoints, setShowRoutePoints] = useState(false);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [showKMLLayers, setShowKMLLayers] = useState(false);


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
      const snapshotsCol = collection(db, 'vehicle_history_snapshots');
      const q = query(
        snapshotsCol,
        where('day', '==', selectedDate),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const allSnapshots = querySnapshot.docs.map(doc => doc.data());
      
      // Extract data for specific IMEI from the snapshots
      const data = allSnapshots
        .map(snap => {
            const vehicle = snap.vehicles?.find((v: any) => v.imei === imei);
            if (vehicle) {
                return {
                    ...vehicle,
                    timestamp: snap.timestamp // Use the snapshot's timestamp
                };
            }
            return null;
        })
        .filter(Boolean);

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

  const totalDistance = useMemo(() => {
    if (historyData.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < historyData.length - 1; i++) {
      const p1 = historyData[i];
      const p2 = historyData[i + 1];
      const R = 6371; // km
      const dLat = (parseFloat(p2.lat) - parseFloat(p1.lat)) * Math.PI / 180;
      const dLon = (parseFloat(p2.lng) - parseFloat(p1.lng)) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(parseFloat(p1.lat) * Math.PI / 180) * Math.cos(parseFloat(p2.lat) * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      dist += R * c;
    }
    return dist.toFixed(2);
  }, [historyData]);

  const stops = useMemo(() => {
    const detectedStops: any[] = [];
    if (historyData.length < 2) return detectedStops;
    
    let stopStart = -1;
    for (let i = 1; i < historyData.length; i++) {
      const p = historyData[i];
      const lat = parseFloat(p.lat);
      const lng = parseFloat(p.lng);
      
      // Skip invalid coordinates
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) continue;

      const speed = parseFloat(p.speed);
      if (speed < 1.5) { // Threshold for stop
        if (stopStart === -1) stopStart = i;
        
        // Only mark a stop every 20 points (approx 100 seconds) to avoid clutter
        if (i - stopStart > 10 && (i - stopStart) % 50 === 0) { 
           detectedStops.push(p);
        }
      } else {
        stopStart = -1;
      }
    }
    return detectedStops;
  }, [historyData]);

  const pathSegments = useMemo(() => {
    const segments: [number, number][][] = [];
    if (historyData.length === 0) return segments;

    let currentSegment: [number, number][] = [];
    
    for (let i = 0; i < historyData.length; i++) {
      const p = historyData[i];
      const lat = parseFloat(p.lat);
      const lng = parseFloat(p.lng);
      
      // Filter invalid
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0 || lat < 5) continue;

      const pos: [number, number] = [lat, lng];

      if (currentSegment.length > 0) {
        const prevPoint = historyData[i - 1];
        const timeDiff = new Date(p.timestamp).getTime() - new Date(prevPoint.timestamp).getTime();
        
        // If gap is more than 15 minutes, start a new segment
        if (timeDiff > 15 * 60 * 1000) {
          segments.push(currentSegment);
          currentSegment = [pos];
        } else {
          currentSegment.push(pos);
        }
      } else {
        currentSegment.push(pos);
      }
    }
    
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }
    
    return segments;
  }, [historyData]);

  const pathPositions = useMemo(() => pathSegments.flat(), [pathSegments]);
  
  // Auto-scroll the sidebar to the current point
  useEffect(() => {
    if (historyData.length > 0) {
      const activeElement = document.getElementById(`log-point-${currentFrame}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [currentFrame, historyData.length]);

  const calculateAngle = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  const stopIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div style="background: #f59e0b; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  const currentAngle = useMemo(() => {
    if (historyData.length === 0 || !historyData[currentFrame]) return 0;
    
    // Try using reported angle first if it's non-zero
    const reportedAngle = parseFloat(historyData[currentFrame].angle);
    if (reportedAngle > 0) return reportedAngle;

    // Otherwise calculate based on movement
    if (currentFrame < historyData.length - 1) {
      const next = historyData[currentFrame + 1];
      const curr = historyData[currentFrame];
      return calculateAngle(
        parseFloat(curr.lat), parseFloat(curr.lng),
        parseFloat(next.lat), parseFloat(next.lng)
      );
    } else if (currentFrame > 0) {
      const prev = historyData[currentFrame - 1];
      const curr = historyData[currentFrame];
      return calculateAngle(
        parseFloat(prev.lat), parseFloat(prev.lng),
        parseFloat(curr.lat), parseFloat(curr.lng)
      );
    }
    return 0;
  }, [historyData, currentFrame]);

  const currentPosition = useMemo(() => {
    if (historyData.length === 0 || !historyData[currentFrame]) return [27.4924, 77.6737] as [number, number];
    const lat = parseFloat(historyData[currentFrame].lat);
    const lng = parseFloat(historyData[currentFrame].lng);
    
    if (isNaN(lat) || isNaN(lng)) return [27.4924, 77.6737] as [number, number];
    return [lat, lng] as [number, number];
  }, [historyData, currentFrame]);

  const vehicleIcon = (angle: string, time: string) => L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="position: relative; width: 50px; height: 50px;">
            <div style="transform: rotate(${angle || 0}deg); width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Main Chassis -->
                <rect x="18" y="8" width="28" height="48" rx="2" fill="#991b1b"/>
                
                <!-- Compactor Body -->
                <path d="M20 22H44V50C44 51.1046 43.1046 52 42 52H22C20.8954 52 20 51.1046 20 50V22Z" fill="#ef4444"/>
                
                <!-- Rear Hopper (Specific to Garbage Trucks) -->
                <path d="M20 50H44V54C44 55.1046 43.1046 56 42 56H22C20.8954 56 20 55.1046 20 54V50Z" fill="#dc2626"/>
                <rect x="24" y="51" width="16" height="3" rx="1" fill="#991b1b" fill-opacity="0.5"/>
                
                <!-- Cab Section -->
                <rect x="20" y="10" width="24" height="12" rx="2" fill="#dc2626"/>
                <!-- Windshield -->
                <path d="M22 11.5C22 10.9477 22.4477 10.5 23 10.5H41C41.5523 10.5 42 10.9477 42 11.5V15C42 16.1046 41.1046 17 40 17H24C22.8954 17 22 16.1046 22 15V11.5Z" fill="#bae6fd" fill-opacity="0.9"/>
                
                <!-- Roof Details -->
                <rect x="28" y="11" width="8" height="1" rx="0.5" fill="white" fill-opacity="0.3"/>
                
                <!-- Compactor Ridges -->
                <rect x="22" y="26" width="20" height="2" fill="#991b1b" fill-opacity="0.3"/>
                <rect x="22" y="32" width="20" height="2" fill="#991b1b" fill-opacity="0.3"/>
                <rect x="22" y="38" width="20" height="2" fill="#991b1b" fill-opacity="0.3"/>
                <rect x="22" y="44" width="20" height="2" fill="#991b1b" fill-opacity="0.3"/>

                <!-- Wheels -->
                <rect x="15" y="14" width="4" height="10" rx="1" fill="#111827"/>
                <rect x="45" y="14" width="4" height="10" rx="1" fill="#111827"/>
                <rect x="15" y="40" width="4" height="12" rx="1" fill="#111827"/>
                <rect x="45" y="40" width="4" height="12" rx="1" fill="#111827"/>
              </svg>
            </div>
            <div style="position: absolute; top: -32px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 900; white-space: nowrap; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5); border: 2px solid white; z-index: 50; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; background: white; border-radius: 50%; animation: pulse 2s infinite;"></span>
              ${time}
            </div>
          </div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25]
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
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Map View */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 relative">
          <MapSettingsOverlay 
            mapType={mapType}
            setMapType={setMapType}
            showKMLLayers={showKMLLayers}
            setShowKMLLayers={setShowKMLLayers}
            position="top-left"
          />

          <MapContainer 
            center={[27.4924, 77.6737]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution={mapType === 'street' ? '&copy; OpenStreetMap contributors' : '&copy; Google Maps'}
              url={mapType === 'street'
                  ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
              }
            />
            <KMLLayers visible={showKMLLayers} />
            
            {historyData.length > 0 && (
              <>
                <ChangeView center={currentPosition} zoom={15} />
                
                {/* Route Segments and Gap Connectors */}
                {pathSegments.map((segment, idx) => {
                  const nextSegment = pathSegments[idx + 1];
                  return (
                    <React.Fragment key={`segment-group-${idx}`}>
                      {/* Real Path (Solid Red) */}
                      <Polyline 
                        positions={segment} 
                        color="#ff0000" 
                        weight={6} 
                        opacity={0.8} 
                        fill={false}
                        lineCap="round"
                        lineJoin="round"
                      />

                      {/* Signal Loss Gap (Solid Dark Blue Connector) */}
                      {nextSegment && (
                        <Polyline 
                          positions={[segment[segment.length - 1], nextSegment[0]]} 
                          color="#1e3a8a" 
                          weight={6} 
                          opacity={0.8} 
                          fill={false}
                          lineCap="round"
                          lineJoin="round"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* Route Points Toggleable (Interactive Yellow Dots) */}
                {showRoutePoints && historyData.map((point, idx) => {
                  const lat = parseFloat(point.lat);
                  const lng = parseFloat(point.lng);
                  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;

                  return (
                    <CircleMarker 
                      key={`point-${idx}`} 
                      center={[lat, lng]} 
                      radius={3} 
                      fillColor="#f59e0b" 
                      color="#ffffff" 
                      weight={1.5} 
                      fillOpacity={0.9} 
                    >
                      <Popup>
                        <div className="p-2 min-w-[120px]">
                          <div className="flex items-center gap-2 mb-1 border-b border-gray-100 pb-1">
                            <Clock size={12} className="text-amber-500" />
                            <span className="font-black text-xs">{new Date(point.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="space-y-1 mt-2">
                            <p className="text-[10px] uppercase text-gray-500 font-bold">Velocity</p>
                            <p className="text-sm font-black text-emerald-600">{point.speed} km/h</p>
                          </div>
                          <button 
                            onClick={() => setCurrentFrame(idx)}
                            className="w-full mt-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Jump to this point
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {/* Stop Markers */}
                {stops.map((stop, idx) => (
                  <Marker 
                    key={`stop-${idx}`} 
                    position={[parseFloat(stop.lat), parseFloat(stop.lng)]} 
                    icon={stopIcon}
                  >
                    <Popup>
                      <div className="p-1 text-xs font-bold">
                        <p className="text-amber-600">Stopped here</p>
                        <p>{new Date(stop.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <Marker 
                  position={currentPosition} 
                  icon={vehicleIcon(
                    `${currentAngle}`,
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
                {/* Close Button */}
                <button 
                  onClick={() => {
                    setHistoryData([]);
                    setCurrentFrame(0);
                    setIsPlaying(false);
                    setSelectedImei('');
                  }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-[1001]"
                >
                  <X size={16} />
                </button>

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
                    className="bg-transparent font-bold text-sm outline-none cursor-pointer"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1">1.0x</option>
                    <option value="2">2.0x</option>
                    <option value="4">4.0x</option>
                  </select>

                  <button 
                    onClick={() => setShowRoutePoints(!showRoutePoints)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      showRoutePoints 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                    }`}
                    title="Toggle Route Points"
                  >
                    {showRoutePoints ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
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
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: History Log */}
        <AnimatePresence>
          {historyData.length > 0 && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-full lg:w-72 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white">History Log</h3>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black rounded-full">
                    {historyData.length} Points
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Chronological path data</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {historyData.map((point, index) => {
                  const isActive = currentFrame === index;
                  return (
                    <button
                      key={index}
                      id={`log-point-${index}`}
                      onClick={() => setCurrentFrame(index)}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all border ${
                        isActive 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-50 dark:border-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className={isActive ? 'text-emerald-100' : 'text-emerald-500'} />
                          <span className="text-[11px] font-black tracking-tight">
                            {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 ml-5 text-[9px] font-bold ${isActive ? 'text-emerald-100/70' : 'text-gray-400'}`}>
                          <span>{parseFloat(point.lat).toFixed(4)}</span>
                          <span className="opacity-40">|</span>
                          <span>{parseFloat(point.lng).toFixed(4)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity size={10} className={isActive ? 'text-emerald-100' : 'text-gray-400'} />
                        <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                          {point.speed} <span className="opacity-60">km/h</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatMiniCard 
            label="Total Distance" 
            value={`${totalDistance} km`} 
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
