import React from 'react';

export const OrderInfo = ({ orderNumber, totalBatchAmount, batchAmount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
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
                    {orderNumber || 'N/A'}
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
                    ) : batchAmount ? (
                        <div className="text-lg md:text-xl text-company-lime font-medium">
                            {batchAmount}
                        </div>
                    ) : (
                        <div className="text-lg md:text-xl text-company-lime font-medium">
                            Coming Soon
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};