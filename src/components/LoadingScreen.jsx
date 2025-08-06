import React from 'react';

export const LoadingScreen = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-company-sky/10">
            <div className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-company-teal border-t-company-lime rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-company-turquoise font-medium text-lg md:text-xl">Loading order details...</p>
            </div>
        </div>
    );
};
