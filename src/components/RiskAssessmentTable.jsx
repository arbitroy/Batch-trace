import React, { useState, useMemo } from 'react';

export const RiskAssessmentTable = ({ geojsonData, onFieldSelect, selectedFieldIndex }) => {
    const [filters, setFilters] = useState({
        pcrop: 'all',
        acrop: 'all',
        timber: 'all'
    });

    // Helper function to format risk values
    const formatRiskValue = (risk) => {
        if (!risk) return 'Unknown';
        return risk
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Helper function to get yes/no badge colors
    const getYesNoBadgeColor = (value) => {
        if (!value) return 'bg-gray-100 text-gray-800';

        const val = value.toLowerCase();

        switch (val) {
            case 'yes':
                return 'bg-green-100 text-green-800';  // Green for "yes"
            case 'no':
                return 'bg-red-100 text-red-800';      // Red for "no"
            default:
                return 'bg-gray-100 text-gray-800';    // Gray for unknown
        }
    };

    // Helper function to format yes/no values
    const formatYesNoValue = (value) => {
        if (!value) return 'Unknown';
        return value.charAt(0).toUpperCase() + value.slice(1);
    };
    const getRiskBadgeColor = (risk) => {
        if (!risk) return 'bg-gray-100 text-gray-800';

        const riskLevel = risk.toLowerCase();

        switch (riskLevel) {
            case 'low':
                return 'bg-green-100 text-green-800';  // 🟢 Green - Safe
            case 'medium':
            case 'moderate':
                return 'bg-orange-300 text-orange-500'; // 🟡 Yellow - Caution
            case 'high':
                return 'bg-red-100 text-red-800';       // 🔴 Red - Danger
            case 'more_info_needed':
                return 'bg-orange-300 text-orange-500'; // 🟡 Yellow - Caution/Warning
            default:
                return 'bg-gray-100 text-gray-800';     // ⚪ Gray - Unknown
        }
    };

    // Process and filter the data
    const processedData = useMemo(() => {
        if (!geojsonData?.features) return [];

        return geojsonData.features.map((feature, index) => {
            const props = feature.properties;
            return {
                index,
                name: props.name || props.fieldName || `Field ${index + 1}`,
                area: props.Area ? parseFloat(props.Area).toFixed(4) : null,
                unit: props.Unit || 'ha',
                farmerName: props.farmerName,
                featureType: feature.geometry.type === 'Point' ? 'Point Location' : 'Field Boundary',
                riskPcrop: props.risk_pcrop,
                riskAcrop: props.risk_acrop,
                riskTimber: props.risk_timber,
                treeCover: props.Ind_01_treecover,
                disturbanceBefore2020: props.Ind_03_disturbance_before_2020,
                disturbanceAfter2020: props.Ind_04_disturbance_after_2020,
                feature
            };
        });
    }, [geojsonData]);

    // Filter data based on all selected filters
    const filteredData = useMemo(() => {
        let filtered = [...processedData];

        // Apply filters for each risk type
        Object.keys(filters).forEach(riskType => {
            if (filters[riskType] !== 'all') {
                filtered = filtered.filter(item => {
                    const riskKey = `risk${riskType.charAt(0).toUpperCase() + riskType.slice(1)}`;
                    return item[riskKey] === filters[riskType];
                });
            }
        });

        return filtered;
    }, [processedData, filters]);

    // Get risk statistics
    const riskStats = useMemo(() => {
        const stats = {
            pcrop: { low: 0, high: 0, more_info_needed: 0, total: 0 },
            acrop: { low: 0, high: 0, more_info_needed: 0, total: 0 },
            timber: { low: 0, high: 0, more_info_needed: 0, total: 0 }
        };

        processedData.forEach(item => {
            ['pcrop', 'acrop', 'timber'].forEach(riskType => {
                const riskKey = `risk${riskType.charAt(0).toUpperCase() + riskType.slice(1)}`;
                const riskValue = item[riskKey];

                if (riskValue) {
                    stats[riskType].total++;
                    if (stats[riskType][riskValue] !== undefined) {
                        stats[riskType][riskValue]++;
                    }
                }
            });
        });

        return stats;
    }, [processedData]);

    const riskTypes = [
        { key: 'pcrop', label: 'Perennial Crop Risk', icon: '🌱', shortLabel: 'Perennial' },
        { key: 'acrop', label: 'Annual Crop Risk', icon: '🌾', shortLabel: 'Annual' },
        { key: 'timber', label: 'Timber Risk', icon: '🌳', shortLabel: 'Timber' }
    ];

    const riskLevels = [
        { key: 'all', label: 'All Levels' },
        { key: 'high', label: 'High Risk' },
        { key: 'low', label: 'Low Risk' },
        { key: 'more_info_needed', label: 'More Info Needed' }
    ];

    // Handle filter changes
    const handleFilterChange = (riskType, value) => {
        setFilters(prev => ({
            ...prev,
            [riskType]: value
        }));
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({
            pcrop: 'all',
            acrop: 'all',
            timber: 'all'
        });
    };

    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

    return (
        <div className="space-y-6">
            {/* Risk Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {riskTypes.map(riskType => (
                    <div key={riskType.key} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                            <span className="text-2xl mr-2">{riskType.icon}</span>
                            <h3 className="font-semibold text-gray-900">{riskType.label}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">High Risk:</span>
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                                    {riskStats[riskType.key].high}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Low Risk:</span>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                                    {riskStats[riskType.key].low}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">More Info Needed:</span>
                                <span className="px-2 py-1 text-xs rounded-full bg-orange-300 text-orange-500 font-medium">
                                    {riskStats[riskType.key].more_info_needed}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Total Fields:</span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {riskStats[riskType.key].total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filter Results</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-1 text-sm text-company-turquoise hover:text-company-turquoise/80 font-medium"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    Showing {filteredData.length} of {processedData.length} fields
                    {hasActiveFilters && (
                        <span className="ml-2 text-company-turquoise font-medium">
                            (filtered)
                        </span>
                    )}
                </div>
            </div>

            {/* Fields Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredData.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-2">
                            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No fields found</h3>
                        <p className="text-gray-600">
                            No fields match the selected risk criteria. Try adjusting your filters.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile view: Cards */}
                        <div className="md:hidden">
                            {filteredData.map((field) => (
                                <div
                                    key={field.index}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedFieldIndex === field.index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                    onClick={() => onFieldSelect(field.feature, field.index)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">{field.name}</h4>
                                        <span className="text-xs text-gray-500">{field.featureType}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {field.area && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Area:</span>
                                                <span className="text-sm font-medium">{field.area} {field.unit}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Perennial Risk:</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskBadgeColor(field.riskPcrop)}`}>
                                                {formatRiskValue(field.riskPcrop)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Annual Risk:</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskBadgeColor(field.riskAcrop)}`}>
                                                {formatRiskValue(field.riskAcrop)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Timber Risk:</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskBadgeColor(field.riskTimber)}`}>
                                                {formatRiskValue(field.riskTimber)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Tree Cover:</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getYesNoBadgeColor(field.treeCover)}`}>
                                                {formatYesNoValue(field.treeCover)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Disturbance Before 2020:</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getYesNoBadgeColor(field.disturbanceBefore2020)}`}>
                                                {formatYesNoValue(field.disturbanceBefore2020)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Disturbance After 2020:</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getYesNoBadgeColor(field.disturbanceAfter2020)}`}>
                                                {formatYesNoValue(field.disturbanceAfter2020)}
                                            </span>
                                        </div>

                                        {field.region && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Region:</span>
                                                <span className="text-sm">{field.region}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop view: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Field
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Area
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            🌳 Tree Cover
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ⚠️ Before 2020
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ⚠️ After 2020
                                        </th>
                                        {riskTypes.map(riskType => (
                                            <th key={riskType.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center">
                                                        <span className="mr-1">{riskType.icon}</span>
                                                        <span>{riskType.shortLabel}</span>
                                                    </div>
                                                    <select
                                                        value={filters[riskType.key]}
                                                        onChange={(e) => handleFilterChange(riskType.key, e.target.value)}
                                                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-company-turquoise focus:border-transparent"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {riskLevels.map(level => (
                                                            <option key={level.key} value={level.key}>
                                                                {level.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredData.map((field) => (
                                        <tr
                                            key={field.index}
                                            className={`hover:bg-gray-50 transition-colors ${selectedFieldIndex === field.index ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        {field.featureType === 'Point Location' ? (
                                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                        ) : (
                                                            <div className="w-3 h-3 rounded bg-blue-500"></div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {field.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {field.featureType}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {field.area ? `${field.area} ${field.unit}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYesNoBadgeColor(field.treeCover)}`}>
                                                    {formatYesNoValue(field.treeCover)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYesNoBadgeColor(field.disturbanceBefore2020)}`}>
                                                    {formatYesNoValue(field.disturbanceBefore2020)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getYesNoBadgeColor(field.disturbanceAfter2020)}`}>
                                                    {formatYesNoValue(field.disturbanceAfter2020)}
                                                </span>
                                            </td>
                                            {riskTypes.map(riskType => (
                                                <td key={riskType.key} className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(field[`risk${riskType.key.charAt(0).toUpperCase() + riskType.key.slice(1)}`])
                                                        }`}>
                                                        {formatRiskValue(field[`risk${riskType.key.charAt(0).toUpperCase() + riskType.key.slice(1)}`])}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => onFieldSelect(field.feature, field.index)}
                                                    className="text-company-turquoise hover:text-company-turquoise/80 font-medium"
                                                >
                                                    View on Map
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};