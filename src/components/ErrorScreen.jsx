import React from 'react';

export const ErrorScreen = ({ error }) => {
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
};