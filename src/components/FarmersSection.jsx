import React, { useState, useEffect } from 'react';
import { TabButton } from './TabButton';
import { FarmersList } from './FarmersList';
import { FarmersMap } from './FarmersMap';
import { RiskAssessmentTable } from './RiskAssessmentTable';
import { hasGeojsonData } from '../utils/geojsonHelpers';
import { loadGeojsonData } from '../utils/mapHelpers';

export const FarmersSection = ({ farmers, orderData }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
    const [geojsonData, setGeojsonData] = useState(null);
    const [selectedFromRiskAssessment, setSelectedFromRiskAssessment] = useState(false);

    // Reset active tab to 'list' if we're on 'map' tab but no GeoJSON data is available
    useEffect(() => {
        if (activeTab === 'map' && !hasGeojsonData(orderData)) {
            setActiveTab('list');
        }
    }, [orderData, activeTab]);

    // Check if we have GeoJSON data for map and risk assessment
    const hasGeoData = hasGeojsonData(orderData);

    // Load GeoJSON data for risk assessment
    useEffect(() => {
        const loadGeoData = async () => {
            if (hasGeoData) {
                try {
                    const geoData = await loadGeojsonData(orderData, (error) => {
                        console.error('Error loading geo data:', error);
                    });
                    setGeojsonData(geoData);
                } catch (error) {
                    console.error('Error loading geo data for risk assessment:', error);
                }
            }
        };
        loadGeoData();
    }, [orderData, hasGeoData]);

    // Handle field selection from risk assessment table
    const handleFieldSelect = (feature, index) => {
        setSelectedFieldIndex(index);
        setSelectedFromRiskAssessment(true);
        // Switch to map tab to show the selected field
        if (hasGeoData) {
            setActiveTab('map');
        }
    };

    // Handle field selection from map (clear the risk assessment flag)
    const handleMapFieldSelect = (index) => {
        setSelectedFieldIndex(index);
        setSelectedFromRiskAssessment(false);
    };

    // Clear field selection
    const clearFieldSelection = () => {
        setSelectedFieldIndex(null);
        setSelectedFromRiskAssessment(false);
    };

    // Reset selection when switching tabs
    useEffect(() => {
        if (activeTab !== 'map') {
            setSelectedFromRiskAssessment(false);
        }
    }, [activeTab]);

    return (
        <div className="mb-6 md:mb-8">
            <div className="flex items-center mb-4 md:mb-6">
                <span className="w-8 h-2 md:w-10 md:h-2 bg-company-lime rounded-full mr-3"></span>
                <h2 className="text-lg md:text-xl font-semibold text-company-turquoise">Farmers</h2>
                <span className="flex-grow h-px bg-gray-200 ml-4"></span>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 mb-4 overflow-x-auto">
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
                
                {hasGeoData && (
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
                )}

                {hasGeoData && geojsonData && (
                    <TabButton
                        active={activeTab === 'risk'}
                        onClick={() => setActiveTab('risk')}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        }
                    >
                        Risk Assessment
                    </TabButton>
                )}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {activeTab === 'list' && (
                    <div className="p-4">
                        <FarmersList farmers={farmers} />
                    </div>
                )}

                {activeTab === 'map' && hasGeoData && (
                    <div className="p-4">
                        <FarmersMap 
                            farmers={farmers} 
                            orderData={orderData} 
                            isActive={activeTab === 'map'}
                            selectedFieldIndex={selectedFieldIndex}
                            onFieldSelect={handleMapFieldSelect}
                            selectedFromRiskAssessment={selectedFromRiskAssessment}
                        />
                    </div>
                )}

                {activeTab === 'risk' && hasGeoData && geojsonData && (
                    <div className="p-4">
                        <RiskAssessmentTable
                            geojsonData={geojsonData}
                            onFieldSelect={handleFieldSelect}
                            selectedFieldIndex={selectedFieldIndex}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};