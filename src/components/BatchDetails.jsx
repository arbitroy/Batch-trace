import React from 'react';

export const BatchDetails = ({ batchAmounts, 
    measurementUnit }) => {
    return (
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
                            {amount.toLocaleString()+ ' '+(measurementUnit || '')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};