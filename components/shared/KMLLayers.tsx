import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { getAllAdminData, getLargeDocument } from '../../services/databaseService';

interface KMLLayersProps {
    visible: boolean;
}

// Vibrant colors for different polygons
const VIBRANT_COLORS = [
    '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6', 
    '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6', 
    '#10B981', '#22C55E', '#84CC16', '#EAB308', '#F59E0B', 
    '#F97316', '#EF4444'
];

const getColorByString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % VIBRANT_COLORS.length;
    return VIBRANT_COLORS[index];
};

const KMLLayers: React.FC<KMLLayersProps> = ({ visible }) => {
    const [layers, setLayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLayers = async () => {
            if (!visible) return;
            
            setLoading(true);
            try {
                const result = await getAllAdminData('mapLayers');
                if (result.success) {
                    const activeLayers = (result.data as any[]).filter(l => l.active);
                    console.log(`Found ${activeLayers.length} active map layers`);
                    
                    const processedLayers = await Promise.all(activeLayers.map(async (layer) => {
                        if (layer.isChunked) {
                            console.log(`Fetching chunks for layer: ${layer.name}`);
                            const fullDoc = await getLargeDocument('mapLayers', layer.id, 'data');
                            return fullDoc.success ? fullDoc.data : layer;
                        }
                        return layer;
                    }));

                    setLayers(processedLayers);
                } else {
                    console.error('Failed to fetch map layers:', result.error);
                }
            } catch (err) {
                console.error('Error in KMLLayers fetch:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLayers();
    }, [visible]);

    if (!visible) return null;

    return (
        <>
            {layers.map((layer) => {
                if (!layer.data) return null;
                
                let geojsonData = layer.data;
                if (typeof layer.data === 'string') {
                    try {
                        geojsonData = JSON.parse(layer.data);
                    } catch (e) {
                        console.error('Failed to parse GeoJSON for layer', layer.id, e);
                        return null;
                    }
                }
                
                // Ensure we have a valid GeoJSON object
                if (!geojsonData || (geojsonData.type !== 'FeatureCollection' && geojsonData.type !== 'Feature')) {
                    console.warn(`Invalid GeoJSON type for layer ${layer.name}:`, geojsonData?.type);
                    return null;
                }
                
                return (
                    <GeoJSON
                        key={`${layer.id}-${visible}`}
                        data={geojsonData}
                        style={(feature: any) => {
                            const name = feature.properties?.name || 'Unknown';
                            const color = getColorByString(name);
                            return {
                                color: color,
                                weight: 2,
                                opacity: 0.8,
                                fillColor: color,
                                fillOpacity: 0.2
                            };
                        }}
                        onEachFeature={(feature, leafletLayer) => {
                            const name = feature.properties?.name || '';
                            if (name) {
                                // Add popup
                                leafletLayer.bindPopup(`
                                    <div style="font-family: 'Inter', sans-serif; padding: 5px;">
                                        <div style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Ward / Area</div>
                                        <div style="font-size: 14px; font-weight: 900; color: #1e293b;">${name}</div>
                                    </div>
                                `);
                            }
                        }}
                    />
                );
            })}
        </>
    );

};

export default KMLLayers;
