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

    // Clear all markers
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    };

    // Add markers for point features or polygon centroids
    const addMarkers = (features) => {
        if (!map.current || !mapboxglRef.current) return;

        clearMarkers();

        features.forEach((feature, index) => {
            const coords = extractCoordinatesFromFeature(feature);
            if (!coords) return;

            // Create a custom marker element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '30px';
            el.style.height = '30px';
            el.style.borderRadius = '50%';
            el.style.border = '3px solid #fff';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

            // Different colors for different feature types
            if (feature.geometry.type === 'Point') {
                el.style.backgroundColor = '#22c55e'; // Green for points
            } else {
                el.style.backgroundColor = '#3b82f6'; // Blue for polygon centroids
                el.style.opacity = '0.8';
            }

            // Add number label
            const label = document.createElement('div');
            label.textContent = (index + 1).toString();
            label.style.color = 'white';
            label.style.fontSize = '12px';
            label.style.fontWeight = 'bold';
            label.style.textAlign = 'center';
            label.style.lineHeight = '24px';
            el.appendChild(label);

            const marker = new mapboxglRef.current.Marker(el)
                .setLngLat(coords)
                .addTo(map.current);

            // Add popup on marker click
            el.addEventListener('click', () => {
                const properties = feature.properties;

                let popupHTML = `
          <div class="p-4 max-w-sm">
            <h3 class="font-semibold text-lg text-gray-800 mb-2">
              ${properties.name || properties.fieldName || `Field ${index + 1}`}
            </h3>
            <div class="space-y-1 text-sm">
        `;

                if (properties.Area) {
                    popupHTML += `<div><span class="font-medium">Area:</span> ${properties.Area} ${properties.Unit || 'ha'}</div>`;
                }

                if (properties.Admin_Level_1) {
                    popupHTML += `<div><span class="font-medium">Region:</span> ${properties.Admin_Level_1}</div>`;
                }

                if (properties.Country) {
                    popupHTML += `<div><span class="font-medium">Country:</span> ${properties.Country}</div>`;
                }

                if (properties.fieldGUID) {
                    popupHTML += `<div><span class="font-medium">Field ID:</span> ${properties.fieldGUID.substring(0, 8)}...</div>`;
                }

                // Add farmer-specific data if available
                if (properties.farmerName) {
                    popupHTML += `<div><span class="font-medium">Farmer:</span> ${properties.farmerName}</div>`;
                }

                if (properties.groupName) {
                    popupHTML += `<div><span class="font-medium">Group:</span> ${properties.groupName}</div>`;
                }

                const featureType = feature.geometry.type === 'Point' ? '📍 Point Location' : '🗺️ Field Boundary';
                popupHTML += `
              <div class="text-xs text-blue-600 mt-2">${featureType}</div>
            </div>
          </div>
        `;
                try {
                    new mapboxglRef.current.Popup({ offset: 25 })
                        .setLngLat(coords)
                        .setHTML(popupHTML)
                        .addTo(map.current);
                } catch (err) {
                    console.error('Popup error:', err);
                }

                // Also select this feature
                flyToFeature(feature, index);
            });

            markersRef.current.push(marker);
        });
    };

    // Function to fly to a specific feature (polygon or point)
    const flyToFeature = (feature, index) => {
        if (!map.current || !feature.geometry || !mapboxglRef.current) return;

        setSelectedFeature(index);

        if (feature.geometry.type === 'Point') {
            // For points, fly directly to the coordinates
            const [lng, lat] = feature.geometry.coordinates;
            map.current.flyTo({
                center: [lng, lat],
                zoom: 16,
                duration: 1500
            });

            // Highlight the selected marker
            markersRef.current.forEach((marker, i) => {
                const el = marker.getElement();
                if (i === index) {
                    el.style.transform = 'scale(1.3)';
                    el.style.zIndex = '1000';
                    el.firstChild.style.backgroundColor = '#22c55e';
                } else {
                    el.style.transform = 'scale(1)';
                    el.style.zIndex = '1';

                    const feature = geojsonData?.features?.[i];

                    if (feature?.geometry?.type === 'Point') {
                        el.firstChild.style.backgroundColor = '#22c55e';
                    } else if (feature?.geometry?.type) {
                        el.firstChild.style.backgroundColor = '#3b82f6';
                    } else {
                        el.firstChild.style.backgroundColor = '#9ca3af'; // Gray fallback for unknown
                    }

                }
            });
        } else {
            // For polygons, calculate bounds
            const bounds = new mapboxglRef.current.LngLatBounds();

            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates[0].forEach(coord => {
                    bounds.extend(coord);
                });
            } else if (feature.geometry.type === 'MultiPolygon') {
                feature.geometry.coordinates.forEach(polygon => {
                    polygon[0].forEach(coord => {
                        bounds.extend(coord);
                    });
                });
            }

            // Fly to the polygon with padding
            if (!bounds.isEmpty()) {
                map.current.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 19,
                    duration: 1500
                });
            }

            // Highlight marker for this polygon
            markersRef.current.forEach((marker, i) => {
                const el = marker.getElement();
                if (i === index) {
                    el.style.transform = 'scale(1.3)';
                    el.style.zIndex = '1000';
                } else {
                    el.style.transform = 'scale(1)';
                    el.style.zIndex = '1';
                }
            });
        }

        // Highlight the selected polygon if it exists
        if (map.current.getSource('farmers-fields')) {
            // Update the fill layer to highlight selected polygon
            map.current.setPaintProperty('farmers-fields-fill', 'fill-color', [
                'case',
                ['==', ['get', 'fieldGUID'], feature.properties.fieldGUID || ''],
                '#22c55e', // Green for selected
                '#3b82f6'  // Blue for others
            ]);

            map.current.setPaintProperty('farmers-fields-outline', 'line-color', [
                'case',
                ['==', ['get', 'fieldGUID'], feature.properties.fieldGUID || ''],
                '#15803d', // Dark green for selected
                '#1e40af'  // Dark blue for others
            ]);
        }
    };

    const showAllFields = () => {
        setSelectedFeature(null);

        // Reset all markers to normal size
        markersRef.current.forEach((marker, i) => {
            const el = marker.getElement();
            el.style.transform = 'scale(1)';
            el.style.zIndex = '1';
            if (geojsonData.features[i].geometry.type === 'Point') {
                el.firstChild.style.backgroundColor = '#22c55e';
            } else {
                el.firstChild.style.backgroundColor = '#3b82f6';
            }
        });

        if (map.current && geojsonData?.features?.length > 0 && mapboxglRef.current) {
            const bounds = new mapboxglRef.current.LngLatBounds();

            geojsonData.features.forEach(feature => {
                if (feature.geometry.type === 'Point') {
                    bounds.extend(feature.geometry.coordinates);
                } else if (feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates[0].forEach(coord => {
                        bounds.extend(coord);
                    });
                } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(polygon => {
                        polygon[0].forEach(coord => {
                            bounds.extend(coord);
                        });
                    });
                }
            });

            if (!bounds.isEmpty()) {
                map.current.fitBounds(bounds, {
                    padding: 50,
                    duration: 1500
                });
            }

            // Reset polygon colors to show no selection
            if (map.current.getSource('farmers-fields')) {
                map.current.setPaintProperty('farmers-fields-fill', 'fill-color', '#3b82f6');
                map.current.setPaintProperty('farmers-fields-outline', 'line-color', '#1e40af');
            }
        }
    };

    useEffect(() => {
        const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

        if (!MAPBOX_TOKEN) {
            setMapError('Mapbox access token not found. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.');
            return;
        }

        // Dynamically import mapbox-gl
        import('mapbox-gl').then(async (mapboxgl) => {
            if (map.current) return; // Initialize map only once

            mapboxglRef.current = mapboxgl.default;
            mapboxgl.default.accessToken = MAPBOX_TOKEN;

            map.current = new mapboxgl.default.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-v9',
                center: [32.5825, 0.3476], // Center on Kampala, Uganda
                zoom: 8
            });

            map.current.on('load', async () => {
                setMapLoaded(true);

                // Load GeoJSON data
                const geoData = await loadGeojsonData(orderData, setMapError);

                if (!geoData || !geoData.features || geoData.features.length === 0) {
                    setMapError('No field data available to display on the map.');
                    return;
                }

                setGeojsonData(geoData);

                // Separate polygon and point features
                const polygonFeatures = geoData.features.filter(f =>
                    f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
                );

                // Add polygon layers if there are polygon features
                if (polygonFeatures.length > 0) {
                    const polygonCollection = {
                        type: 'FeatureCollection',
                        features: polygonFeatures
                    };

                    map.current.addSource('farmers-fields', {
                        type: 'geojson',
                        data: polygonCollection
                    });

                    // Add fill layer for polygons
                    map.current.addLayer({
                        id: 'farmers-fields-fill',
                        type: 'fill',
                        source: 'farmers-fields',
                        paint: {
                            'fill-color': '#3b82f6',
                            'fill-opacity': 0.3
                        }
                    });

                    // Add outline layer for polygons
                    map.current.addLayer({
                        id: 'farmers-fields-outline',
                        type: 'line',
                        source: 'farmers-fields',
                        paint: {
                            'line-color': '#1e40af',
                            'line-width': 2
                        }
                    });

                    // Add popup on polygon click
                    map.current.on('click', 'farmers-fields-fill', (e) => {
                        const properties = e.features[0].properties;
                        console.log('Polygon clicked:', properties);

                        let popupHTML = `
              <div class="p-4 max-w-sm">
                <h3 class="font-semibold text-lg text-gray-800 mb-2">${properties.name || properties.fieldName || 'Field'}</h3>
                <div class="space-y-1 text-sm">
            `;

                        if (properties.Area) {
                            popupHTML += `<div><span class="font-medium">Area:</span> ${properties.Area} ${properties.Unit || 'ha'}</div>`;
                        }

                        if (properties.Admin_Level_1) {
                            popupHTML += `<div><span class="font-medium">Region:</span> ${properties.Admin_Level_1}</div>`;
                        }

                        if (properties.Country) {
                            popupHTML += `<div><span class="font-medium">Country:</span> ${properties.Country}</div>`;
                        }

                        if (properties.fieldGUID) {
                            popupHTML += `<div><span class="font-medium">Field ID:</span> ${properties.fieldGUID.substring(0, 8)}...</div>`;
                        }

                        popupHTML += `
                  <div class="text-xs text-blue-600 mt-2">🗺️ Field Boundary</div>
                </div>
              </div>
            `;

                        new mapboxgl.default.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(popupHTML)
                            .addTo(map.current);
                    });

                    // Change cursor on hover
                    map.current.on('mouseenter', 'farmers-fields-fill', () => {
                        map.current.getCanvas().style.cursor = 'pointer';
                    });

                    map.current.on('mouseleave', 'farmers-fields-fill', () => {
                        map.current.getCanvas().style.cursor = '';
                    });
                }

                // Add markers for all features (points and polygon centroids)
                addMarkers(geoData.features);

                // Fit map to show all features
                if (geoData.features.length > 0) {
                    const bounds = new mapboxglRef.current.LngLatBounds();

                    geoData.features.forEach(feature => {
                        if (feature.geometry.type === 'Point') {
                            bounds.extend(feature.geometry.coordinates);
                        } else if (feature.geometry.type === 'Polygon') {
                            feature.geometry.coordinates[0].forEach(coord => {
                                bounds.extend(coord);
                            });
                        } else if (feature.geometry.type === 'MultiPolygon') {
                            feature.geometry.coordinates.forEach(polygon => {
                                polygon[0].forEach(coord => {
                                    bounds.extend(coord);
                                });
                            });
                        }
                    });

                    if (!bounds.isEmpty()) {
                        map.current.fitBounds(bounds, { padding: 50 });
                    }

                    // Automatically fly to the first feature when map becomes active
                    if (isActive && !hasFlownToFirst) {
                        setTimeout(() => {
                            flyToFeature(geoData.features[0], 0);
                            setHasFlownToFirst(true);
                        }, 800);
                    }
                }
            });

            map.current.on('error', (e) => {
                console.error('Mapbox error:', e);
                setMapError('Failed to load map. Please check your internet connection and Mapbox token.');
            });
        }).catch((error) => {
            console.error('Failed to load Mapbox GL:', error);
            setMapError('Failed to load map library. Please check your internet connection.');
        });

        return () => {
            clearMarkers();
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [farmers, orderData]);

    // Effect to handle flying to first feature when tab becomes active
    useEffect(() => {
        if (isActive && mapLoaded && geojsonData?.features?.length > 0 && !hasFlownToFirst) {
            setTimeout(() => {
                flyToFeature(geojsonData.features[0], 0);
                setHasFlownToFirst(true);
            }, 500);
        }

        // Reset the flag when tab becomes inactive so it can fly again when reactivated
        if (!isActive) {
            setHasFlownToFirst(false);
        }
    }, [isActive, mapLoaded, geojsonData, hasFlownToFirst]);

    if (mapError) {
        return (
            <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Map Error</h3>
                    <p className="text-gray-600 text-sm">{mapError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div ref={mapContainer} className="h-[600px] rounded-lg overflow-hidden" />

            {/* Map Key/Legend */}
            {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
                <MapFieldsList
                    geojsonData={geojsonData}
                    selectedFeature={selectedFeature}
                    showKey={showKey}
                    setShowKey={setShowKey}
                    flyToFeature={flyToFeature}
                    showAllFields={showAllFields}
                />
            )}

            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-company-teal border-t-company-lime rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading map...</p>
                    </div>
                </div>
            )}
        </div>
    );
};