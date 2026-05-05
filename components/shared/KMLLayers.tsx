import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { getAllAdminData } from '../../services/databaseService';
import L from 'leaflet';

interface KMLLayersProps {
    visible: boolean;
}

const KMLLayers: React.FC<KMLLayersProps> = ({ visible }) => {
    const [layers, setLayers] = useState<any[]>([]);

    useEffect(() => {
        const fetchLayers = async () => {
            const result = await getAllAdminData('mapLayers');
            if (result.success) {
                // Only show active layers
                const activeLayers = (result.data as any[]).filter(l => l.active);
                setLayers(activeLayers);
            }
        };

        if (visible) {
            fetchLayers();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <>
            {layers.map((layer) => {
                let geojsonData = layer.data;
                if (typeof layer.data === 'string') {
                    try {
                        geojsonData = JSON.parse(layer.data);
                    } catch (e) {
                        console.error('Failed to parse GeoJSON for layer', layer.id, e);
                        return null;
                    }
                }
                
                return (
                    <GeoJSON
                        key={layer.id}
                        data={geojsonData}
                        style={{
                            color: '#10b981', // emerald-500
                            weight: 2,
                            opacity: 0.6,
                            fillColor: '#10b981',
                            fillOpacity: 0.1
                        }}
                        onEachFeature={(feature, leafletLayer) => {
                            if (feature.properties && feature.properties.name) {
                                leafletLayer.bindPopup(`<strong>${feature.properties.name}</strong>`);
                            }
                        }}
                    />
                );
            })}
        </>
    );

};

export default KMLLayers;
