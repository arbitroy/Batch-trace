import React, { useState, useEffect, useRef } from 'react';
import { MapFieldsList } from './MapFieldsList';
import { RiskFilters } from './RiskFilters';
import { loadGeojsonData, extractCoordinatesFromFeature } from '../utils/mapHelpers';

export const FarmersMap = ({ farmers, orderData, isActive }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const mapboxglRef = useRef(null);
    const markersRef = useRef([]); // Store marker references
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [geojsonData, setGeojsonData] = useState(null);
    const [filteredFeatures, setFilteredFeatures] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [showKey, setShowKey] = useState(true);
    const [hasFlownToFirst, setHasFlownToFirst] = useState(false);
    const [selectedLocationInfo, setSelectedLocationInfo] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    // Helper function to format risk values
    const formatRiskValue = (risk) => {
        if (!risk) return 'Unknown';
        
        // Convert to title case and replace underscores
        return risk
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Helper function to get risk badge colors
    const getRiskBadgeColor = (risk) => {
        if (!risk) return 'bg-gray-100 text-gray-800';
        
        const riskLevel = risk.toLowerCase();
        
        switch (riskLevel) {
            case 'low':
                return 'bg-green-100 text-green-800';
            case 'medium':
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800';
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'more_info_needed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter features based on active risk filters
    const applyRiskFilters = (features) => {
        if (!features || Object.keys(activeFilters).length === 0) {
            return features;
        }

        return features.filter(feature => {
            const props = feature.properties;
            
            // Check each active filter
            for (const [riskType, riskLevel] of Object.entries(activeFilters)) {
                const propertyName = `risk_${riskType.slice(4).toLowerCase()}`;
                const featureRisk = props[propertyName];
                
                if (!featureRisk) {
                    // If feature doesn't have risk data and we're filtering for 'unknown', include it
                    if (riskLevel === 'unknown') continue;
                    else return false;
                }
                
                const normalizedRisk = featureRisk.toLowerCase();
                if (normalizedRisk !== riskLevel) {
                    return false;
                }
            }
            
            return true;
        });
    };

    // Update filtered features when filters change
    useEffect(() => {
        if (geojsonData?.features) {
            const filtered = applyRiskFilters(geojsonData.features);
            setFilteredFeatures(filtered);
        }
    }, [geojsonData, activeFilters]);

    // Handle filter changes
    const handleFilterChange = (riskType, riskLevel, clearAll = false) => {
        if (clearAll) {
            setActiveFilters({});
            return;
        }

        setActiveFilters(prev => {
            const newFilters = { ...prev };
            
            // If the same filter is clicked, remove it (toggle off)
            if (newFilters[riskType] === riskLevel) {
                delete newFilters[riskType];
            } else {
                // Set or update the filter for this risk type
                newFilters[riskType] = riskLevel;
            }
            
            return newFilters;
        });
    };

    // Helper function to create location info object from feature
    const createLocationInfo = (feature, index, coordinates = null) => {
        const properties = feature.properties;
        const coords = coordinates || extractCoordinatesFromFeature(feature);
        
        return {
            name: properties.name || properties.fieldName || 'Location',
            area: properties.Area ? parseFloat(properties.Area).toFixed(4) : null,
            unit: properties.Unit || 'ha',
            region: properties.Admin_Level_1,
            country: properties.Country,
            farmerName: properties.farmerName,
            featureType: feature.geometry.type === 'Point' ? 'Point Location' : 'Field Boundary',
            coordinates: coords,
            index: index,
            // Risk assessments
            riskPcrop: properties.risk_pcrop,
            riskAcrop: properties.risk_acrop,
            riskTimber: properties.risk_timber
        };
    };

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

            // Check if this feature is filtered out
            const isVisible = filteredFeatures ? filteredFeatures.includes(feature) : true;
            
            // Get marker color based on highest risk
            let markerColor = feature.geometry.type === 'Point' ? '#22c55e' : '#3b82f6';
            const risks = [feature.properties.risk_pcrop, feature.properties.risk_acrop, feature.properties.risk_timber];
            if (risks.some(risk => risk?.toLowerCase() === 'high')) {
                markerColor = '#ef4444'; // Red for high risk
            } else if (risks.some(risk => risk?.toLowerCase() === 'medium')) {
                markerColor = '#f59e0b'; // Orange for medium risk
            }

            el.innerHTML = `
                <svg class="marker-svg" width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity: ${isVisible ? '1' : '0.3'}">
                    <path class="marker-pin-path" d="M22 2C10.95 2 2 10.95 2 22C2 27 4 31.5 7 34.5L22 52L37 34.5C40 31.5 42 27 42 22C42 10.95 33.05 0 22 2Z" 
                          fill="${markerColor}" 
                          stroke="#ffffff" 
                          stroke-width="3"/>
                    <circle cx="22" cy="22" r="8" fill="white"/>
                    <circle cx="22" cy="22" r="5" fill="${markerColor}"/>
                </svg>
            `;

            const marker = new mapboxglRef.current.Marker({
                element: el,
                anchor: 'bottom'
            })
                .setLngLat(coords)
                .addTo(map.current);

            el.addEventListener('click', () => {
                if (isVisible) {
                    // Create location info and set it
                    const locationInfo = createLocationInfo(feature, index, coords);
                    setSelectedLocationInfo(locationInfo);
                    flyToFeature(feature, index);
                }
            });

            markersRef.current.push(marker);
        });
    };

    // Update markers when filtered features change
    useEffect(() => {
        if (geojsonData?.features && mapLoaded) {
            addMarkers(geojsonData.features);
            
            // Update polygon layer opacity based on filters
            if (map.current.getSource('farmers-fields')) {
                const visibleFeatureIds = filteredFeatures?.map(f => f.properties.fieldGUID || f.properties.name) || [];
                
                if (Object.keys(activeFilters).length > 0) {
                    // Apply filter-based opacity
                    map.current.setPaintProperty('farmers-fields-fill', 'fill-opacity', [
                        'case',
                        ['in', ['get', 'fieldGUID'], ['literal', visibleFeatureIds]],
                        0.3,
                        0.1
                    ]);
                    map.current.setPaintProperty('farmers-fields-outline', 'line-opacity', [
                        'case',
                        ['in', ['get', 'fieldGUID'], ['literal', visibleFeatureIds]],
                        1,
                        0.3
                    ]);
                } else {
                    // Reset to default opacity
                    map.current.setPaintProperty('farmers-fields-fill', 'fill-opacity', 0.3);
                    map.current.setPaintProperty('farmers-fields-outline', 'line-opacity', 1);
                }
            }
        }
    }, [filteredFeatures, geojsonData, mapLoaded, activeFilters]);
    
    const flyToFeature = (feature, index) => {
        if (!map.current || !feature.geometry || !mapboxglRef.current) return;

        setSelectedFeature(index);

        // Update the popup info when flying to a feature
        const coords = extractCoordinatesFromFeature(feature);
        if (coords) {
            const locationInfo = createLocationInfo(feature, index, coords);
            setSelectedLocationInfo(locationInfo);
        }

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
        
        // Resize SVG instead of using transform:scale
        markersRef.current.forEach((marker, i) => {
            const el = marker.getElement();
            const svgEl = el.querySelector('.marker-svg');
            if (!svgEl) return;

            if (i === index) {
                svgEl.setAttribute('width', '56');
                svgEl.setAttribute('height', '69');
                svgEl.setAttribute('viewBox', '0 0 44 54');
                el.style.zIndex = '1000';
            } else {
                svgEl.setAttribute('width', '44');
                svgEl.setAttribute('height', '54');
                svgEl.setAttribute('viewBox', '0 0 44 54');
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
        setSelectedLocationInfo(null);

        markersRef.current.forEach((marker, i) => {
            const el = marker.getElement();
            const svgEl = el.querySelector('.marker-svg');
            const pinPath = el.querySelector('.marker-pin-path');
            if (!svgEl || !pinPath) return;

            // Reset size
            svgEl.setAttribute('width', '44');
            svgEl.setAttribute('height', '54');
            svgEl.setAttribute('viewBox', '0 0 44 54');
            el.style.zIndex = '1';
        });

        const featuresToShow = filteredFeatures || geojsonData?.features || [];
        if (map.current && featuresToShow.length > 0 && mapboxglRef.current) {
            const bounds = new mapboxglRef.current.LngLatBounds();
            featuresToShow.forEach(feature => {
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

    // Close location info when clicking on map
    const handleMapClick = (e) => {
        // Check if click was on a marker or polygon
        const features = map.current.queryRenderedFeatures(e.point);
        const isOnFeature = features.some(f => f.layer.id === 'farmers-fields-fill');
        
        if (!isOnFeature && markersRef.current.every(marker => {
            const el = marker.getElement();
            const rect = el.getBoundingClientRect();
            return !(e.originalEvent.clientX >= rect.left && 
                    e.originalEvent.clientX <= rect.right && 
                    e.originalEvent.clientY >= rect.top && 
                    e.originalEvent.clientY <= rect.bottom);
        })) {
            setSelectedLocationInfo(null);
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
                setFilteredFeatures(geoData.features); // Initially show all
                const polygonFeatures = geoData.features.filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

                if (polygonFeatures.length > 0) {
                    const polygonCollection = { type: 'FeatureCollection', features: polygonFeatures };
                    map.current.addSource('farmers-fields', { type: 'geojson', data: polygonCollection });
                    map.current.addLayer({ id: 'farmers-fields-fill', type: 'fill', source: 'farmers-fields', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.3 } });
                    map.current.addLayer({ id: 'farmers-fields-outline', type: 'line', source: 'farmers-fields', paint: { 'line-color': '#1e40af', 'line-width': 2 } });
                    
                    // Polygon click handler
                    map.current.on('click', 'farmers-fields-fill', (e) => {
                        const properties = e.features[0].properties;
                        
                        setSelectedLocationInfo({
                            name: properties.name || properties.fieldName || 'Field Boundary',
                            area: properties.Area ? parseFloat(properties.Area).toFixed(4) : null,
                            unit: properties.Unit || 'ha',
                            region: properties.Admin_Level_1,
                            country: properties.Country,
                            farmerName: properties.farmerName,
                            featureType: 'Field Boundary',
                            coordinates: [e.lngLat.lng, e.lngLat.lat],
                            index: null,
                            // Risk assessments
                            riskPcrop: properties.risk_pcrop,
                            riskAcrop: properties.risk_acrop,
                            riskTimber: properties.risk_timber
                        });
                    });

                    map.current.on('mouseenter', 'farmers-fields-fill', () => map.current.getCanvas().style.cursor = 'pointer');
                    map.current.on('mouseleave', 'farmers-fields-fill', () => map.current.getCanvas().style.cursor = '');
                }

                // Add click handler for closing location info
                map.current.on('click', handleMapClick);

                addMarkers(geoData.features);
                if (geoData.features.length > 0) {
                    const bounds = new mapboxglRef.current.LngLatBounds();
                    geoData.features.forEach(feature => {
                        if (feature.geometry.type === 'Point') {
                            bounds.extend(feature.geometry.coordinates);
                        } else if (feature.geometry.type === 'Polygon') {
                            feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
                        } else if (feature.geometry.type === 'MultiPolygon') {
                            feature.geometry.coordinates.forEach(polygon => polygon[0].forEach(coord => bounds.extend(coord)));
                        }
                    });
                    if (!bounds.isEmpty()) map.current.fitBounds(bounds, { padding: 50 });
                    if (isActive && !hasFlownToFirst) {
                        setTimeout(() => { flyToFeature(geoData.features[0], 0); setHasFlownToFirst(true); }, 800);
                    }
                }
            });

            map.current.on('error', (e) => { console.error('Mapbox error:', e); setMapError('Failed to load map.'); });
        }).catch((error) => { console.error('Failed to load Mapbox GL:', error); setMapError('Failed to load map library.'); });

        return () => { 
            clearMarkers(); 
            if (map.current) { 
                map.current.remove(); 
                map.current = null; 
            } 
        };
    }, [farmers, orderData]);

    useEffect(() => {
        if (isActive && mapLoaded && geojsonData?.features?.length > 0 && !hasFlownToFirst) {
            setTimeout(() => { flyToFeature(geojsonData.features[0], 0); setHasFlownToFirst(true); }, 500);
        }
        if (!isActive) setHasFlownToFirst(false);
    }, [isActive, mapLoaded, geojsonData, hasFlownToFirst]);

    if (mapError) { 
        return ( 
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Error: {mapError}
                </div>
            </div>
        ); 
    }

    return (
        <div className="relative">
            <div ref={mapContainer} className="h-[600px] rounded-lg overflow-hidden" />
            
            {/* Risk Filters */}
            {geojsonData && (
                <RiskFilters 
                    geojsonData={geojsonData} 
                    onFilterChange={handleFilterChange} 
                    activeFilters={activeFilters}
                />
            )}

            {/* Custom Location Info Card */}
            {selectedLocationInfo && (
                <div className="absolute top-4 left-4 z-30 bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm ml-80">
                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" 
                                     style={{ backgroundColor: selectedLocationInfo.featureType === 'Point Location' ? '#22c55e' : '#3b82f6' }}>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                    {selectedLocationInfo.name}
                                </h3>
                            </div>
                            <button 
                                onClick={() => setSelectedLocationInfo(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Feature Type Badge */}
                        <div className="mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                selectedLocationInfo.featureType === 'Point Location' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {selectedLocationInfo.featureType === 'Point Location' ? '📍' : '🗺️'} 
                                {selectedLocationInfo.featureType}
                            </span>
                        </div>

                        {/* Info Grid */}
                        <div className="space-y-3">
                            {selectedLocationInfo.area && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Area:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {selectedLocationInfo.area} {selectedLocationInfo.unit}
                                    </span>
                                </div>
                            )}
                            
                            {selectedLocationInfo.region && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Region:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {selectedLocationInfo.region}
                                    </span>
                                </div>
                            )}
                            
                            {selectedLocationInfo.country && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Country:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {selectedLocationInfo.country}
                                    </span>
                                </div>
                            )}
                            
                            {selectedLocationInfo.farmerName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500">Farmer:</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {selectedLocationInfo.farmerName}
                                    </span>
                                </div>
                            )}

                            {/* Risk Assessment Section */}
                            {(selectedLocationInfo.riskPcrop || selectedLocationInfo.riskAcrop || selectedLocationInfo.riskTimber) && (
                                <>
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <svg className="h-4 w-4 mr-1.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            Risk Assessment
                                        </div>
                                        <div className="space-y-2">
                                            {selectedLocationInfo.riskPcrop && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-gray-500">Perennial Crop Risk:</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskBadgeColor(selectedLocationInfo.riskPcrop)}`}>
                                                        {formatRiskValue(selectedLocationInfo.riskPcrop)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {selectedLocationInfo.riskAcrop && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-gray-500">Annual Crop Risk:</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskBadgeColor(selectedLocationInfo.riskAcrop)}`}>
                                                        {formatRiskValue(selectedLocationInfo.riskAcrop)}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {selectedLocationInfo.riskTimber && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-gray-500">Timber Risk:</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRiskBadgeColor(selectedLocationInfo.riskTimber)}`}>
                                                        {formatRiskValue(selectedLocationInfo.riskTimber)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Coordinates */}
                            <div className="pt-2 border-t border-gray-100">
                                <div className="text-xs text-gray-500 mb-1">Coordinates:</div>
                                <div className="text-xs font-mono text-gray-700 bg-gray-50 rounded px-2 py-1">
                                    {selectedLocationInfo.coordinates[1].toFixed(6)}, {selectedLocationInfo.coordinates[0].toFixed(6)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
                <MapFieldsList 
                    geojsonData={filteredFeatures ? { ...geojsonData, features: filteredFeatures } : geojsonData}
                    selectedFeature={selectedFeature} 
                    showKey={showKey} 
                    setShowKey={setShowKey} 
                    flyToFeature={flyToFeature} 
                    showAllFields={showAllFields} 
                />
            )}
            
            {!mapLoaded && ( 
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-company-teal border-t-company-lime rounded-full animate-spin mx-auto mb-2"></div>
                        <div className="text-sm text-gray-600">Loading map...</div>
                    </div>
                </div> 
            )}
        </div>
    );
};