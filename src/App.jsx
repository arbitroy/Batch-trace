import React, { useState, useEffect, useRef } from 'react';

// Utility to detect file type from extension
const getFileTypeIcon = (fileName) => {
  if (!fileName) return 'document';

  const extension = fileName.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return 'image';
    case 'txt':
    case 'log':
      return 'text';
    default:
      return 'document';
  }
};

// Component for document icons based on file type
const IconByType = ({ type }) => {
  switch (type) {
    case 'pdf':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'text':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

// Mapbox Map Component
const FarmersMap = ({ farmers }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [showKey, setShowKey] = useState(false);

  // Function to fly to a specific polygon
  const flyToPolygon = (feature, index) => {
    if (!map.current || !feature.geometry) return;

    setSelectedPolygon(index);

    // Calculate bounds for the polygon
    const bounds = new mapboxgl.default.LngLatBounds();
    
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
        maxZoom: 15,
        duration: 1500
      });
    }

    // Highlight the selected polygon
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
  // Load GeoJSON data from public folder
  const loadGeojsonData = async () => {
    try {
      const response = await fetch('/survey-trial-koen eProd Generated.geojson');
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded GeoJSON data:', data);
        setGeojsonData(data);
        return data;
      } else {
        console.warn('GeoJSON file not found');
        setMapError('GeoJSON file not found. Please ensure the file is in the public folder.');
        return null;
      }
    } catch (error) {
      console.warn('Error loading GeoJSON:', error);
      setMapError('Error loading field data. Please check the GeoJSON file.');
      return null;
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
        const geoData = await loadGeojsonData();
        
        if (!geoData || !geoData.features || geoData.features.length === 0) {
          setMapError('No field data available to display on the map.');
          return;
        }
        
        // Add source
        map.current.addSource('farmers-fields', {
          type: 'geojson',
          data: geoData
        });

        // Add fill layer for polygons
        map.current.addLayer({
          id: 'farmers-fields-fill',
          type: 'fill',
          source: 'farmers-fields',
          paint: {
            'fill-color': '#3b82f6', // Blue for real GeoJSON data
            'fill-opacity': 0.3
          }
        });

        // Add outline layer for polygons
        map.current.addLayer({
          id: 'farmers-fields-outline',
          type: 'line',
          source: 'farmers-fields',
          paint: {
            'line-color': '#1e40af', // Dark blue for real GeoJSON data
            'line-width': 2
          }
        });

        // Add popup on click
        map.current.on('click', 'farmers-fields-fill', (e) => {
          const properties = e.features[0].properties;
          
          // Create popup HTML based on available properties
          let popupHTML = `
            <div class="p-4 max-w-sm">
              <h3 class="font-semibold text-lg text-gray-800 mb-2">${properties.name || properties.fieldName || 'Field'}</h3>
              <div class="space-y-1 text-sm">
          `;

          // Add available property information
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
          
          if (properties.risk_timber) {
            const riskClass = properties.risk_timber === 'high' ? 'bg-red-100 text-red-800' : 
                             properties.risk_timber === 'low' ? 'bg-green-100 text-green-800' : 
                             'bg-yellow-100 text-yellow-800';
            popupHTML += `<div><span class="font-medium">Timber Risk:</span> <span class="px-1 py-0.5 text-xs rounded ${riskClass}">${properties.risk_timber}</span></div>`;
          }
          
          if (properties.Ind_01_treecover) {
            popupHTML += `<div><span class="font-medium">Tree Cover:</span> ${properties.Ind_01_treecover}</div>`;
          }

          // Add any farmer-specific data if available
          if (properties.farmerName) {
            popupHTML += `<div><span class="font-medium">Farmer:</span> ${properties.farmerName}</div>`;
          }
          
          if (properties.groupName) {
            popupHTML += `<div><span class="font-medium">Group:</span> ${properties.groupName}</div>`;
          }
          
          if (properties.batchNumber) {
            popupHTML += `<div><span class="font-medium">Batch:</span> ${properties.batchNumber}</div>`;
          }

          popupHTML += `
                <div class="text-xs text-blue-600 mt-2">🗺️ Real Field Data</div>
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

        // Fit map to show all features
        if (geoData.features.length > 0) {
          const bounds = new mapboxgl.default.LngLatBounds();
          
          geoData.features.forEach(feature => {
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
          });
          
          // Only fit bounds if we have valid bounds
          if (!bounds.isEmpty()) {
            map.current.fitBounds(bounds, { padding: 50 });
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
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [farmers]);

  if (mapError) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
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
      <div ref={mapContainer} className="h-96 rounded-lg overflow-hidden" />
      
      {/* Map Key/Legend */}
      {geojsonData && geojsonData.features && geojsonData.features.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowKey(!showKey)}
            className="bg-white rounded-lg shadow-lg p-3 mb-2 hover:bg-gray-50 transition-colors"
            title="Toggle Fields List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          {showKey && (
            <div className="bg-white rounded-lg shadow-lg max-w-xs w-80 max-h-80 overflow-hidden">
              <div className="p-3 bg-company-teal text-white">
                <h3 className="font-semibold text-sm">Fields ({geojsonData.features.length})</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {geojsonData.features.map((feature, index) => {
                  const props = feature.properties;
                  const isSelected = selectedPolygon === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => flyToPolygon(feature, index)}
                      className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-3 h-3 rounded-full mr-3 mt-1 flex-shrink-0 ${
                          isSelected ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {props.name || props.fieldName || `Field ${index + 1}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {props.Area && (
                              <div>Area: {props.Area} {props.Unit || 'ha'}</div>
                            )}
                            {props.Admin_Level_1 && (
                              <div>Region: {props.Admin_Level_1}</div>
                            )}
                            {props.fieldGUID && (
                              <div>ID: {props.fieldGUID.substring(0, 8)}...</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-2 bg-gray-50 text-center">
                <button
                  onClick={() => {
                    setSelectedPolygon(null);
                    if (map.current && geojsonData.features.length > 0) {
                      const bounds = new mapboxgl.default.LngLatBounds();
                      geojsonData.features.forEach(feature => {
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
                      });
                      if (!bounds.isEmpty()) {
                        map.current.fitBounds(bounds, { padding: 50 });
                      }
                      
                      // Reset colors
                      if (map.current.getSource('farmers-fields')) {
                        map.current.setPaintProperty('farmers-fields-fill', 'fill-color', '#3b82f6');
                        map.current.setPaintProperty('farmers-fields-outline', 'line-color', '#1e40af');
                      }
                    }
                  }}
                  className="text-xs text-company-teal hover:text-company-turquoise font-medium"
                >
                  Show All Fields
                </button>
              </div>
            </div>
          )}
        </div>
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

// Tab Component
const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-t-lg transition-colors duration-200 ${
      active
        ? 'bg-company-turquoise text-white border-b-2 border-company-lime'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </button>
);

function App() {
  const [licenceid, setLicenseid] = useState('');
  const [guid, setGuid] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    // Function to extract and decode the base64 string from the URL path
    function decodeUrlParams() {
      try {
        // Get the full path
        const path = window.location.pathname;

        // Extract the part after /order/
        const matches = path.match(/\/order\/([^\/]+)/);

        if (!matches || !matches[1]) {
          console.error('No encoded data found in URL path');
          return;
        }

        // Get the encoded string
        const encodedString = matches[1];

        // Check if there's a colon separator (for licenceid:guid format)
        if (encodedString.includes(':')) {
          // Split by colon
          const [encodedLicenceId, encodedGuid] = encodedString.split(':');

          try {
            // Decode both parts
            const licenceid = atob(encodedLicenceId);
            const guid = encodedGuid; // GUID may not need base64 decoding if already readable

            console.log('Decoded licenceid:', licenceid);
            console.log('GUID:', guid);

            setLicenseid(licenceid);
            setGuid(guid);
          } catch (e) {
            console.error('Error decoding parts:', e);
          }
        } else {
          // Try to decode the whole string in one go
          try {
            const decodedString = atob(encodedString);

            // Try to find patterns in the decoded string
            // This could be a dot separator or other format
            if (decodedString.includes('.')) {
              const [licenceid, guid] = decodedString.split('.');

              setLicenseid(licenceid);
              setGuid(guid);
            } else {
              console.error('Cannot determine format of decoded string:', decodedString);
            }
          } catch (e) {
            console.error('Error decoding string:', e);
          }
        }
      } catch (err) {
        console.error('Error in decoding URL parameters:', err);
      }
    }

    decodeUrlParams(); // Call the function when the component mounts
  }, []); // Only run once when component mounts

  useEffect(() => {
    if (licenceid && guid) {
      // Use dynamic URL instead of hardcoded localhost
      const url = `${window.location.protocol}//${window.location.host}/call-api`;

      // Create the JSON object with the licenseid and guid
      const data = {
        licenseid: licenceid,
        guid: guid,
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((sdata) => {
          // Handle the response from the server and store it in the state
          setResponseData(sdata);

          // If we have a successful response, use it instead of the local JSON
          if (sdata && Object.keys(sdata).length > 0) {
            setOrderData(sdata);
            setLoading(false);
          } else {
            // Fallback to local JSON if API response is empty
            fetchLocalData();
          }
        })
        .catch((error) => {
          // Handle any errors that occur during the POST request
          console.error('API Error:', error);
          // Fallback to local JSON on error
          fetchLocalData();
        });
    } else {
      // If no IDs available, just load local data
      fetchLocalData();
    }
  }, [licenceid, guid]);

  // Function to fetch local data as fallback
  const fetchLocalData = async () => {
    try {
      const response = await fetch('/orders.json');
      if (!response.ok) {
        throw new Error('Failed to load order data');
      }
      const data = await response.json();
      setOrderData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading order data:', err);
      setError('Failed to load order data. Please try again later.');
      setLoading(false);
    }
  };

  // Function to download file from base64
  const handleFileDownload = (doc) => {
    if (!doc.documentBase64) {
      alert("No file available for download");
      return;
    }

    try {
      // Create a link element
      const link = document.createElement('a');

      // Get file extension from document name for the correct MIME type
      const fileName = doc.documentName || 'document.txt';
      const fileExtension = fileName.split('.').pop().toLowerCase();

      // Select correct MIME type based on extension
      let mimeType = 'application/octet-stream'; // Default
      if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
        mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      } else if (fileExtension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (fileExtension === 'svg') {
        mimeType = 'image/svg+xml';
      } else if (fileExtension === 'txt') {
        mimeType = 'text/plain';
      }

      // Set link's href to the base64 data
      const base64Data = doc.documentBase64;
      link.href = base64Data.includes('data:')
        ? base64Data
        : `data:${mimeType};base64,${base64Data}`;

      // Set download attribute to filename
      link.download = doc.documentName || `${doc.documentType.replace(/\s+/g, '-')}-${doc.documentNumber}.${fileExtension}`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-company-sky/10">
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-company-teal border-t-company-lime rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-company-turquoise font-medium text-lg md:text-xl">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-company-sky/10 px-4">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
          <p className="text-gray-600 text-center text-base md:text-lg">{error}</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 md:px-6 md:py-3 bg-company-turquoise text-white rounded-md hover:bg-company-turquoise/90 text-base md:text-lg font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get unique batch numbers and calculate batch amounts
  const uniqueBatchNumbers = orderData?.farmers
    ? [...new Set(orderData.farmers.map(farmer => farmer.BatchNumber))]
    : [];

  const batchAmounts = orderData?.farmers
    ? orderData.farmers.reduce((acc, farmer) => {
      if (farmer.BatchNumber && farmer.BatchAmount) {
        if (!acc[farmer.BatchNumber]) {
          acc[farmer.BatchNumber] = Number(farmer.BatchAmount);
        }
      }
      return acc;
    }, {})
    : {};

  const totalBatchAmount = Object.values(batchAmounts).reduce((sum, amount) => sum + Number(amount), 0);

  return (
    <div className="w-full bg-gradient-to-br from-company-sky/20 via-white to-company-sky/20 pt-4 pb-4 md:pt-6 md:pb-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg md:rounded-xl shadow-lg md:shadow-xl overflow-hidden">
        {/* Solid Header */}
        <div className="bg-company-turquoise py-4 px-4 md:py-8 md:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 mr-3 md:mr-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Purchase Details
          </h1>
        </div>

        <div className="p-4 md:p-6">
          {/* Purchase Information Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-company-sky/10 rounded-lg p-4 md:p-5">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-company-teal flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <label className="text-sm md:text-base font-medium text-company-turquoise">Order Number</label>
              </div>
              <div className="bg-white py-2 px-3 md:py-3 md:px-4 rounded border border-gray-200 text-center text-lg md:text-xl">
                {orderData?.OrderNumber || 'N/A'}
              </div>
            </div>

            <div className="bg-company-sky/10 rounded-lg p-4 md:p-5">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-company-teal flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <label className="text-sm md:text-base font-medium text-company-turquoise">
                  Batch Number{uniqueBatchNumbers.length > 1 ? 's' : ''}
                </label>
              </div>
              <div className="bg-white py-2 px-3 md:py-3 md:px-4 rounded border border-gray-200">
                {uniqueBatchNumbers.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {uniqueBatchNumbers.map((batchNumber, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 md:px-3 md:py-1.5 bg-company-sky/20 text-company-teal rounded text-sm md:text-base font-medium"
                      >
                        {batchNumber}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-lg md:text-xl text-company-teal">N/A</div>
                )}
              </div>
            </div>

            <div className="bg-company-sky/10 rounded-lg p-4 md:p-5">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-company-teal flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <label className="text-sm md:text-base font-medium text-company-turquoise">Total Batch Amount</label>
              </div>
              <div className="bg-white py-2 px-3 md:py-3 md:px-4 rounded border border-gray-200 text-center">
                {totalBatchAmount > 0 ? (
                  <div className="text-lg md:text-xl text-company-lime font-medium">
                    {totalBatchAmount.toLocaleString()}
                  </div>
                ) : orderData?.BatchAmount ? (
                  <div className="text-lg md:text-xl text-company-lime font-medium">
                    {orderData.BatchAmount}
                  </div>
                ) : (
                  <div className="text-lg md:text-xl text-company-lime font-medium">
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Batch Details Section */}
          {Object.keys(batchAmounts).length > 1 && (
            <div className="bg-company-sky/10 rounded-lg p-4 md:p-5 mb-6 md:mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-company-teal flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <label className="text-sm md:text-base font-medium text-company-turquoise">Batch Details</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {Object.entries(batchAmounts).map(([batchNumber, amount]) => (
                  <div key={batchNumber} className="bg-white rounded border border-gray-200 p-3 md:p-4">
                    <div className="text-xs md:text-sm text-gray-500 mb-1">Batch Number</div>
                    <div className="text-sm md:text-base font-medium text-company-teal mb-2 truncate" title={batchNumber}>
                      {batchNumber}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 mb-1">Amount</div>
                    <div className="text-lg md:text-xl font-semibold text-company-lime">
                      {amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          {orderData?.Description && (
            <div className="bg-company-sky/10 rounded-lg p-4 md:p-5 mb-6 md:mb-8">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-company-teal flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <label className="text-sm md:text-base font-medium text-company-turquoise">Description</label>
              </div>
              <div className="bg-white py-2 px-3 md:py-3 md:px-4 rounded border border-gray-200 text-base md:text-lg">
                {orderData.Description}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {orderData?.documents && orderData.documents.length > 0 && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center mb-4 md:mb-6">
                <span className="w-8 h-2 md:w-10 md:h-2 bg-company-lime rounded-full mr-3"></span>
                <h2 className="text-lg md:text-xl font-semibold text-company-turquoise">Documents</h2>
                <span className="flex-grow h-px bg-gray-200 ml-4"></span>
              </div>

              <div className="space-y-3 md:space-y-4">
                {orderData.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md border border-gray-200 overflow-hidden"
                  >
                    <div className="h-2 bg-company-teal w-full"></div>
                    <div className="p-3 md:p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 flex items-center justify-center mr-3">
                          <IconByType type={getFileTypeIcon(doc.documentName)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500">Document Type</div>
                          <div className="text-base font-medium truncate">
                            {doc.documentType || "Unknown Type"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-between items-center">
                        <div className="mb-3 md:mb-0">
                          <div className="text-sm text-gray-500">Document Number</div>
                          <div className="text-base font-medium">
                            #{doc.documentNumber || "N/A"}
                          </div>
                        </div>

                        <button
                          onClick={() => handleFileDownload(doc)}
                          disabled={!doc.documentBase64}
                          className={`px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base font-medium flex items-center
                            ${doc.documentBase64
                              ? 'bg-company-lime hover:bg-company-lime/90 text-gray-800 mt-2 w-full md:w-auto justify-center md:justify-start md:mt-0'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed mt-2 w-full md:w-auto justify-center md:justify-start md:mt-0'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download File
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farmers Section with Tabs */}
          {orderData?.farmers && orderData.farmers.length > 0 && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center mb-4 md:mb-6">
                <span className="w-8 h-2 md:w-10 md:h-2 bg-company-lime rounded-full mr-3"></span>
                <h2 className="text-lg md:text-xl font-semibold text-company-turquoise">Farmers</h2>
                <span className="flex-grow h-px bg-gray-200 ml-4"></span>
              </div>

              {/* Tabs Navigation */}
              <div className="flex space-x-1 mb-4">
                <TabButton
                  active={activeTab === 'list'}
                  onClick={() => setActiveTab('list')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Farmers List
                </TabButton>
                <TabButton
                  active={activeTab === 'map'}
                  onClick={() => setActiveTab('map')}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Fields Map
                </TabButton>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {activeTab === 'list' && (
                  <div className="p-4">
                    {/* Mobile view: Cards */}
                    <div className="md:hidden space-y-3">
                      {orderData.farmers.map((farmer, index) => (
                        <div key={index} className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
                          <div className="h-2 bg-company-teal w-full"></div>
                          <div className="p-4">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-company-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-base font-medium text-company-turquoise">
                                {farmer.FarmerName}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-500">Field</div>
                                <div className="text-sm font-medium">{farmer.FieldName}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Group</div>
                                <div className="text-sm font-medium">{farmer.GroupName}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Location</div>
                                <div className="text-sm font-medium">{farmer.Location}</div>
                              </div>

                              <div>
                                <div className="text-xs text-gray-500">Batch</div>
                                <div className="text-sm font-medium">
                                  <span className="px-2 py-1 text-xs rounded bg-company-sky/20">
                                    {farmer.BatchNumber}
                                  </span>
                                </div>
                              </div>

                              {farmer.BatchAmount && (
                                <div>
                                  <div className="text-xs text-gray-500">Amount</div>
                                  <div className="text-sm font-medium text-company-lime">
                                    {farmer.BatchAmount.toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop view: Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Farmer
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Field
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Group
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                              Batch
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orderData.farmers.map((farmer, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-company-turquoise">
                                <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-company-teal mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {farmer.FarmerName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                {farmer.FieldName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                {farmer.GroupName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                {farmer.Location}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                <span className="px-3 py-1.5 text-sm rounded bg-company-sky/20">
                                  {farmer.BatchNumber}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'map' && (
                  <div className="p-4">
                    <FarmersMap farmers={orderData.farmers} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;