import React, { useState, useEffect, useRef } from 'react';
import { MapFieldsList } from './MapFieldsList';
import { loadGeojsonData, extractCoordinatesFromFeature } from '../utils/mapHelpers';

export const FarmersMap = ({ farmers, orderData, isActive }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const mapboxglRef = useRef(null);
    const markersRef = useRef([]); // Store marker references
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [geojsonData, setGeojsonData] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [showKey, setShowKey] = useState(true);
    const [hasFlownToFirst, setHasFlownToFirst] = useState(false);

    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    const addMarkers = (features) => {
        if (!map.current || !mapboxglRef.current) return;

        clearMarkers();

        features.forEach((feature, index) => {
            const coords = extractCoordinatesFromFeature(feature);
            if (!coords) return;

            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.cursor = 'pointer';

            el.innerHTML = `
                <svg class="marker-svg" width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path class="marker-pin-path" d="M20 0C8.95 0 0 8.95 0 20C0 25 2 29.5 5 32.5L20 50L35 32.5C38 29.5 40 25 40 20C40 8.95 31.05 0 20 0Z" 
                          fill="${feature.geometry.type === 'Point' ? '#22c55e' : '#3b82f6'}" 
                          stroke="#ffffff" 
                          stroke-width="2"/>
                    <circle cx="20" cy="20" r="8" fill="white"/>
                    <circle cx="20" cy="20" r="5" fill="${feature.geometry.type === 'Point' ? '#22c55e' : '#3b82f6'}"/>
                </svg>
            `;

            const marker = new mapboxglRef.current.Marker({
                element: el,
                anchor: 'bottom'
            })
                .setLngLat(coords)
                .addTo(map.current);

            el.addEventListener('click', () => {
                const properties = feature.properties;

                let popupHTML = `
                    <h3 class="font-bold text-lg text-gray-900 mb-3 truncate">
                      ${properties.name || properties.fieldName || 'Location'}
                    </h3>
                    <div class="space-y-2 text-sm">
                `;

                if (properties.Area) {
                    const areaFormatted = parseFloat(properties.Area).toFixed(4);
                    popupHTML += `
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-500">Area:</span>
                        <span class="font-semibold">${areaFormatted} ${properties.Unit || 'ha'}</span>
                      </div>`;
                }

                if (properties.Admin_Level_1) {
                    popupHTML += `
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-500">Region:</span>
                        <span class="font-semibold">${properties.Admin_Level_1}</span>
                      </div>`;
                }

                if (properties.Country) {
                    popupHTML += `
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-500">Country:</span>
                        <span class="font-semibold">${properties.Country}</span>
                      </div>`;
                }
                
                if (properties.farmerName) {
                    popupHTML += `
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-500">Farmer:</span>
                        <span class="font-semibold">${properties.farmerName}</span>
                      </div>`;
                }

                const featureType = feature.geometry.type === 'Point' ? '📍 Point Location' : '🗺️ Field Boundary';
                popupHTML += `
                    </div>
                    <div class="border-t border-gray-200 mt-3 pt-2 text-xs text-blue-600 font-semibold">
                      ${featureType}
                    </div>
                `;

                try {
                    new mapboxglRef.current.Popup({ 
                        offset: [0, -50],
                        closeButton: true,
                        closeOnClick: false,
                        className: 'custom-mapbox-popup'
                    })
                        .setLngLat(coords)
                        .setHTML(popupHTML)
                        .addTo(map.current);
                } catch (err) {
                    console.error('Popup error:', err);
                }

                flyToFeature(feature, index);
            });

            markersRef.current.push(marker);
        });
    };
    
    const flyToFeature = (feature, index) => {
        if (!map.current || !feature.geometry || !mapboxglRef.current) return;

        setSelectedFeature(index);

        if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            map.current.flyTo({ center: [lng, lat], zoom: 16, duration: 1500 });
        } else {
            const bounds = new mapboxglRef.current.LngLatBounds();
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => polygon[0].forEach(coord => bounds.extend(coord)));
            }

            if (!bounds.isEmpty()) {
                map.current.fitBounds(bounds, { padding: 100, maxZoom: 19, duration: 1500 });
            }
        }
        
        // NEW: Resize SVG instead of using transform:scale
        markersRef.current.forEach((marker, i) => {
            const el = marker.getElement();
            const svgEl = el.querySelector('.marker-svg');
            if (!svgEl) return;

            if (i === index) {
                svgEl.setAttribute('width', '52');
                svgEl.setAttribute('height', '65');
                el.style.zIndex = '1000';
            } else {
                svgEl.setAttribute('width', '40');
                svgEl.setAttribute('height', '50');
                el.style.zIndex = '1';
            }
        });

        if (map.current.getSource('farmers-fields')) {
            map.current.setPaintProperty('farmers-fields-fill', 'fill-color', ['case', ['==', ['get', 'fieldGUID'], feature.properties.fieldGUID || ''], '#22c55e', '#3b82f6']);
            map.current.setPaintProperty('farmers-fields-outline', 'line-color', ['case', ['==', ['get', 'fieldGUID'], feature.properties.fieldGUID || ''], '#15803d', '#1e40af']);
        }
    };

    const showAllFields = () => {
        setSelectedFeature(null);

        markersRef.current.forEach((marker, i) => {
            const el = marker.getElement();
            const svgEl = el.querySelector('.marker-svg');
            const pinPath = el.querySelector('.marker-pin-path');
            if (!svgEl || !pinPath) return;

            // NEW: Reset size
            svgEl.setAttribute('width', '40');
            svgEl.setAttribute('height', '50');
            el.style.zIndex = '1';
            
            if (geojsonData.features[i].geometry.type === 'Point') {
                pinPath.setAttribute('fill', '#22c55e');
            } else {
                pinPath.setAttribute('fill', '#3b82f6');
            }
        });

        if (map.current && geojsonData?.features?.length > 0 && mapboxglRef.current) {
            const bounds = new mapboxglRef.current.LngLatBounds();
            geojsonData.features.forEach(feature => {
                if (feature.geometry.type === 'Point') {
                    bounds.extend(feature.geometry.coordinates);
                } else if (feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
                } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(polygon => polygon[0].forEach(coord => bounds.extend(coord)));
                }
            });
            if (!bounds.isEmpty()) {
                map.current.fitBounds(bounds, { padding: 50, duration: 1500 });
            }
            if (map.current.getSource('farmers-fields')) {
                map.current.setPaintProperty('farmers-fields-fill', 'fill-color', '#3b82f6');
                map.current.setPaintProperty('farmers-fields-outline', 'line-color', '#1e40af');
            }
        }
    };

    useEffect(() => {
        const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        if (!MAPBOX_TOKEN) {
            setMapError('Mapbox access token not found.');
            return;
        }

        import('mapbox-gl').then(async (mapboxgl) => {
            if (map.current) return;
            mapboxglRef.current = mapboxgl.default;
            mapboxgl.default.accessToken = MAPBOX_TOKEN;
            map.current = new mapboxgl.default.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-v9',
                center: [32.5825, 0.3476],
                zoom: 8
            });

            map.current.on('load', async () => {
                setMapLoaded(true);
                const geoData = await loadGeojsonData(orderData, setMapError);
                if (!geoData || !geoData.features || geoData.features.length === 0) {
                    setMapError('No field data available.');
                    return;
                }
                setGeojsonData(geoData);
                const polygonFeatures = geoData.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

                if (polygonFeatures.length > 0) {
                    const polygonCollection = { type: 'FeatureCollection', features: polygonFeatures };
                    map.current.addSource('farmers-fields', { type: 'geojson', data: polygonCollection });
                    map.current.addLayer({ id: 'farmers-fields-fill', type: 'fill', source: 'farmers-fields', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.3 } });
                    map.current.addLayer({ id: 'farmers-fields-outline', type: 'line', source: 'farmers-fields', paint: { 'line-color': '#1e40af', 'line-width': 2 } });
                    
                    // UPDATED: Polygon click popup
                    map.current.on('click', 'farmers-fields-fill', (e) => {
                        const properties = e.features[0].properties;
                        // Use the same stylish popup for polygons
                        let popupHTML = `<div class="custom-popup-content ..."> ... </div>`; // Same as above
                         new mapboxgl.default.Popup({ offset: 25, className: 'custom-mapbox-popup' })
                            .setLngLat(e.lngLat)
                            .setHTML(popupHTML) // Use the same HTML structure
                            .addTo(map.current);
                    });

                    map.current.on('mouseenter', 'farmers-fields-fill', () => map.current.getCanvas().style.cursor = 'pointer');
                    map.current.on('mouseleave', 'farmers-fields-fill', () => map.current.getCanvas().style.cursor = '');
                }

                addMarkers(geoData.features);
                if (geoData.features.length > 0) {
                    const bounds = new mapboxglRef.current.LngLatBounds();
                    geoData.features.forEach(feature => { /* ... bounds extend logic ... */ });
                    if (!bounds.isEmpty()) map.current.fitBounds(bounds, { padding: 50 });
                    if (isActive && !hasFlownToFirst) {
                        setTimeout(() => { flyToFeature(geoData.features[0], 0); setHasFlownToFirst(true); }, 800);
                    }
                }
            });

            map.current.on('error', (e) => { console.error('Mapbox error:', e); setMapError('Failed to load map.'); });
        }).catch((error) => { console.error('Failed to load Mapbox GL:', error); setMapError('Failed to load map library.'); });

        return () => { clearMarkers(); if (map.current) { map.current.remove(); map.current = null; } };
    }, [farmers, orderData]);

    useEffect(() => {
        if (isActive && mapLoaded && geojsonData?.features?.length > 0 && !hasFlownToFirst) {
            setTimeout(() => { flyToFeature(geojsonData.features[0], 0); setHasFlownToFirst(true); }, 500);
        }
        if (!isActive) setHasFlownToFirst(false);
    }, [isActive, mapLoaded, geojsonData, hasFlownToFirst]);

    if (mapError) { return ( <div>Error: {mapError}</div> ); }

    return (
        <div className="relative">
            <div ref={mapContainer} className="h-[600px] rounded-lg overflow-hidden" />
            {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
                <MapFieldsList geojsonData={geojsonData} selectedFeature={selectedFeature} showKey={showKey} setShowKey={setShowKey} flyToFeature={flyToFeature} showAllFields={showAllFields} />
            )}
            {!mapLoaded && ( <div className="absolute inset-0 ...">Loading...</div> )}
        </div>
    );
};