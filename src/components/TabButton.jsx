import React from 'react';

export const TabButton = ({ active, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 md:px-6 md:py-3 text-sm md:text-base font-medium rounded-t-lg transition-colors duration-200 ${active
                ? 'bg-company-turquoise text-white border-b-2 border-company-lime'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
    >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
    </button>
);