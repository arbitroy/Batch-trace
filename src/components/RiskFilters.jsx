import React, { useState, useMemo } from 'react';

export const RiskFilters = ({ geojsonData, onFilterChange, activeFilters }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate risk statistics
    const riskStats = useMemo(() => {
        if (!geojsonData?.features) return {};

        const stats = {
            riskPcrop: { high: 0, medium: 0, low: 0, more_info_needed: 0, unknown: 0 },
            riskAcrop: { high: 0, medium: 0, low: 0, more_info_needed: 0, unknown: 0 },
            riskTimber: { high: 0, medium: 0, low: 0, more_info_needed: 0, unknown: 0 }
        };

        geojsonData.features.forEach(feature => {
            const props = feature.properties;
            
            // Process each risk type
            ['riskPcrop', 'riskAcrop', 'riskTimber'].forEach(riskType => {
                const risk = props[`risk_${riskType.slice(4).toLowerCase()}`];
                if (risk) {
                    const normalizedRisk = risk.toLowerCase();
                    if (stats[riskType][normalizedRisk] !== undefined) {
                        stats[riskType][normalizedRisk]++;
                    } else {
                        stats[riskType].unknown++;
                    }
                } else {
                    stats[riskType].unknown++;
                }
            });
        });

        return stats;
    }, [geojsonData]);

    const getRiskBadgeColor = (risk) => {
        switch (risk) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'more_info_needed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatRiskLabel = (risk) => {
        if (risk === 'more_info_needed') return 'More Info Needed';
        return risk.charAt(0).toUpperCase() + risk.slice(1);
    };

    const handleFilterToggle = (riskType, riskLevel) => {
        onFilterChange(riskType, riskLevel);
    };

    const clearAllFilters = () => {
        onFilterChange(null, null, true); // Clear all
    };

    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    return (
        <div className="absolute top-4 left-4 z-20 max-w-sm">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {/* Header */}
                <div className="p-3 bg-company-teal text-white flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="font-semibold text-sm">Risk Filters</h3>
                        {hasActiveFilters && (
                            <span className="ml-2 bg-company-lime text-gray-800 text-xs px-2 py-0.5 rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg 
                            className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Quick Stats - Always visible */}
                {!isExpanded && (
                    <div className="p-3 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            {Object.entries(riskStats).map(([riskType, stats]) => {
                                const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
                                const highRisk = stats.high;
                                return (
                                    <div key={riskType} className="text-center">
                                        <div className="font-medium text-gray-600">
                                            {riskType === 'riskPcrop' ? 'Perennial' : 
                                             riskType === 'riskAcrop' ? 'Annual' : 'Timber'}
                                        </div>
                                        <div className="flex items-center justify-center mt-1">
                                            {highRisk > 0 && (
                                                <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded">
                                                    {highRisk} high
                                                </span>
                                            )}
                                            {highRisk === 0 && (
                                                <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                                                    No high risk
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Expanded Filters */}
                {isExpanded && (
                    <div className="p-3 max-h-96 overflow-y-auto">
                        {/* Clear All Filters Button */}
                        {hasActiveFilters && (
                            <div className="mb-3 pb-3 border-b border-gray-100">
                                <button
                                    onClick={clearAllFilters}
                                    className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}

                        {/* Risk Type Sections */}
                        {Object.entries(riskStats).map(([riskType, stats]) => {
                            const riskTypeDisplay = riskType === 'riskPcrop' ? 'Perennial Crop Risk' : 
                                                  riskType === 'riskAcrop' ? 'Annual Crop Risk' : 'Timber Risk';
                            
                            return (
                                <div key={riskType} className="mb-4 last:mb-0">
                                    <h4 className="font-medium text-gray-700 text-sm mb-2 flex items-center">
                                        <span className="w-2 h-2 bg-company-lime rounded-full mr-2"></span>
                                        {riskTypeDisplay}
                                    </h4>
                                    
                                    <div className="space-y-2">
                                        {Object.entries(stats).map(([riskLevel, count]) => {
                                            if (count === 0) return null;
                                            
                                            const isActive = activeFilters[riskType] === riskLevel;
                                            
                                            return (
                                                <button
                                                    key={riskLevel}
                                                    onClick={() => handleFilterToggle(riskType, riskLevel)}
                                                    className={`w-full flex items-center justify-between p-2 rounded text-xs border transition-colors ${
                                                        isActive 
                                                            ? 'bg-company-sky border-company-teal shadow-sm' 
                                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(riskLevel)}`}>
                                                            {formatRiskLabel(riskLevel)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="font-semibold text-gray-700 mr-2">
                                                            {count}
                                                        </span>
                                                        {isActive && (
                                                            <svg className="h-4 w-4 text-company-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};