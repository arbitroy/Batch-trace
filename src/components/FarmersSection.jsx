import React, { useState, useEffect } from 'react';
import { TabButton } from './TabButton';
import { FarmersList } from './FarmersList';
import { FarmersMap } from './FarmersMap';
import { hasGeojsonData } from '../utils/geojsonHelpers';

export const FarmersSection = ({ farmers, orderData }) => {
    const [activeTab, setActiveTab] = useState('list');

    // Reset active tab to 'list' if we're on 'map' tab but no GeoJSON data is available
    useEffect(() => {
        if (activeTab === 'map' && !hasGeojsonData(orderData)) {
            setActiveTab('list');
        }
    }, [orderData, activeTab]);

    return (
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
                {hasGeojsonData(orderData) && (
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
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {activeTab === 'list' && (
                    <div className="p-4">
                        <FarmersList farmers={farmers} />
                    </div>
                )}

                {activeTab === 'map' && hasGeojsonData(orderData) && (
                    <div className="p-4">
                        <FarmersMap farmers={farmers} orderData={orderData} isActive={activeTab === 'map'} />
                    </div>
                )}
            </div>
        </div>
    );
};