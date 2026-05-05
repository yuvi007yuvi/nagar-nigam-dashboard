import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Layers, X, Map as MapIcon, Globe } from 'lucide-react';

interface MapSettingsOverlayProps {
    mapType: 'street' | 'satellite';
    setMapType: (type: 'street' | 'satellite') => void;
    showKMLLayers: boolean;
    setShowKMLLayers: (show: boolean) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const MapSettingsOverlay: React.FC<MapSettingsOverlayProps> = ({
    mapType,
    setMapType,
    showKMLLayers,
    setShowKMLLayers,
    position = 'top-right'
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const posClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    return (
        <div className={`absolute ${posClasses[position]} z-[1001]`}>
            <div className="flex flex-col items-end gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
                        isOpen 
                        ? 'bg-emerald-600 text-white rotate-90 scale-110' 
                        : 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl text-gray-700 dark:text-gray-200 border border-white/20'
                    }`}
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -10, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, y: -10, filter: 'blur(10px)' }}
                            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl p-5 rounded-[2rem] shadow-2xl border border-white/20 min-w-[200px] space-y-5"
                        >
                            {/* Map Type Section */}
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 px-1">Map Style</h4>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl">
                                    <button
                                        onClick={() => setMapType('street')}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                                            mapType === 'street' 
                                            ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <MapIcon size={18} />
                                        <span className="text-[10px] font-black uppercase">Street</span>
                                    </button>
                                    <button
                                        onClick={() => setMapType('satellite')}
                                        className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                                            mapType === 'satellite' 
                                            ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <Globe size={18} />
                                        <span className="text-[10px] font-black uppercase">Satellite</span>
                                    </button>
                                </div>
                            </div>

                            {/* Layers Section */}
                            <div className="pt-2">
                                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 px-1">Overlays</h4>
                                <button
                                    onClick={() => setShowKMLLayers(!showKMLLayers)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                        showKMLLayers 
                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Layers size={18} />
                                        <span className="text-xs font-black uppercase tracking-tight">Boundaries</span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${showKMLLayers ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                        <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${showKMLLayers ? 'left-5' : 'left-1'}`}></div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MapSettingsOverlay;
