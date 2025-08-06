import React from 'react';

export const MapFieldsList = ({
    geojsonData,
    selectedFeature,
    showKey,
    setShowKey,
    flyToFeature,
    showAllFields
}) => {
    return (
        <div className="absolute top-4 right-4 z-10">
            <button
                onClick={() => setShowKey(!showKey)}
                className="bg-white rounded-lg shadow-lg p-3 mb-2 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                title={showKey ? "Hide Fields List" : "Show Fields List"}
            >
                {showKey ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">Hide</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">Fields</span>
                    </>
                )}
            </button>

            {showKey && (
                // CHANGED: Added flexbox layout to correctly position header, content, and footer
                <div className="bg-white rounded-lg shadow-lg max-w-xs w-80 max-h-96 flex flex-col">
                    <div className="p-3 bg-company-teal text-white flex-shrink-0">
                        <h3 className="font-semibold text-sm">Fields ({geojsonData.features.length})</h3>
                    </div>
                    
                    {/* CHANGED: This div now grows and scrolls, while header/footer are fixed */}
                    <div className="overflow-y-auto flex-grow">
                        {geojsonData.features.map((feature, index) => {
                            const props = feature.properties;
                            const isSelected = selectedFeature === index;
                            const isPoint = feature.geometry.type === 'Point';
                            // BONUS: Format the area for better readability
                            const areaFormatted = props.Area ? parseFloat(props.Area).toFixed(4) : null;

                            return (
                                <button
                                    key={index}
                                    onClick={() => flyToFeature(feature, index)}
                                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                                            {/* Icons remain the same */}
                                            {isPoint ? (
                                                <svg width="20" height="24" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 0C8.95 0 0 8.95 0 20C0 25 2 29.5 5 32.5L20 50L35 32.5C38 29.5 40 25 40 20C40 8.95 31.05 0 20 0Z" fill={'#22c55e'} stroke="#ffffff" strokeWidth="1" />
                                                    <circle cx="20" cy="20" r="8" fill="white" /><circle cx="20" cy="20" r="5" fill={'#22c55e'} />
                                                </svg>
                                            ) : (
                                                <svg width="20" height="24" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20 0C8.95 0 0 8.95 0 20C0 25 2 29.5 5 32.5L20 50L35 32.5C38 29.5 40 25 40 20C40 8.95 31.05 0 20 0Z" fill={isSelected ? '#22c55e' : '#3b82f6'} stroke="#ffffff" strokeWidth="1" />
                                                    <circle cx="20" cy="20" r="8" fill="white" /><circle cx="20" cy="20" r="5" fill={isSelected ? '#22c55e' : '#3b82f6'} />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm text-gray-900 truncate">
                                                {props.name || props.fieldName || 'Location'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {isPoint ? '📍 Point' : '🗺️ Area'}
                                                {/* Use the formatted area */}
                                                {areaFormatted !== null && ` • ${areaFormatted} ${props.Unit || 'ha'}`}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* This footer will now be visible at the bottom */}
                    {selectedFeature !== null && (
                        <div className="p-2 bg-gray-50 text-center flex-shrink-0 border-t border-gray-200">
                            <button
                                onClick={showAllFields}
                                className="text-xs text-company-teal hover:text-company-turquoise font-medium"
                            >
                                Show All Fields
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};