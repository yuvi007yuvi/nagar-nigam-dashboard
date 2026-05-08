import React, { useEffect, useState } from 'react';
import { Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { getAllAdminData } from '../../services/databaseService';

// Custom icons for assets
const parkingIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const dumpIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(16,185,129,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

interface Location {
    id: string;
    name: string;
    type: 'Parking' | 'Dump';
    latitude?: string;
    longitude?: string;
    coordinates?: any[];
    status: string;
}

interface AssetLayersProps {
    showParking: boolean;
    showDump: boolean;
}

const AssetLayers: React.FC<AssetLayersProps> = ({ showParking, showDump }) => {
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        const fetchAssets = async () => {
            const result = await getAllAdminData('parking_dump_locations');
            if (result.success) {
                setLocations(result.data as Location[]);
            }
        };
        fetchAssets();
    }, []);

    if (!showParking && !showDump) return null;

    return (
        <>
            {locations.map(loc => {
                const isParking = loc.type === 'Parking';
                const isDump = loc.type === 'Dump';
                
                if (isParking && !showParking) return null;
                if (isDump && !showDump) return null;
                if (loc.status === 'Disabled') return null;

                const color = isParking ? '#3b82f6' : '#10b981';

                if (loc.coordinates && loc.coordinates.length > 0) {
                    return (
                        <Polygon 
                            key={loc.id}
                            positions={loc.coordinates.map((ll: any) => [ll.lat, ll.lng])}
                            color={color}
                            fillOpacity={0.2}
                            weight={2}
                        >
                            <Popup>
                                <div className="p-2 min-w-[120px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{loc.type}</p>
                                    <p className="text-sm font-bold text-gray-800">{loc.name}</p>
                                </div>
                            </Popup>
                        </Polygon>
                    );
                }

                if (loc.latitude && loc.longitude) {
                    return (
                        <Marker 
                            key={loc.id}
                            position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                            icon={isParking ? parkingIcon : dumpIcon}
                        >
                            <Popup>
                                <div className="p-2 min-w-[120px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{loc.type}</p>
                                    <p className="text-sm font-bold text-gray-800">{loc.name}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }

                return null;
            })}
        </>
    );
};

export default AssetLayers;
