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
                <div className="bg-white rounded-lg shadow-lg max-w-xs w-80 max-h-96 overflow-hidden">
                    <div className="p-3 bg-company-teal text-white">
                        <h3 className="font-semibold text-sm">Fields ({geojsonData.features.length})</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {geojsonData.features.map((feature, index) => {
                            const props = feature.properties;
                            const isSelected = selectedFeature === index;
                            const isPoint = feature.geometry.type === 'Point';

                            return (
                                <button
                                    key={index}
                                    onClick={() => flyToFeature(feature, index)}
                                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center justify-center mr-3 mt-1">
                                            {isPoint ? (
                                                <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-green-500' : 'bg-green-400'
                                                    }`}></div>
                                            ) : (
                                                <div className={`w-3 h-3 ${isSelected ? 'bg-green-500' : 'bg-blue-500'
                                                    }`}></div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium text-sm text-gray-900 truncate">
                                                {props.name || props.fieldName || `Field ${index + 1}`}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {isPoint ? '📍 Point' : '🗺️ Area'}
                                                {props.Area && ` • ${props.Area} ${props.Unit || 'ha'}`}
                                            </div>
                                        </div>
                                        <div className="ml-2 text-xs text-gray-400 font-bold">
                                            {index + 1}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {selectedFeature !== null && (
                        <div className="p-2 bg-gray-50 text-center">
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