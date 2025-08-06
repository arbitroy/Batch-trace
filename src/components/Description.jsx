import React from 'react';

export const Description = ({ description }) => {
    return (
        <div className="bg-company-sky/10 rounded-lg p-4 md:p-5 mb-6 md:mb-8">
            <div className="flex items-center mb-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-company-teal flex items-center justify-center text-white mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                </div>
                <label className="text-sm md:text-base font-medium text-company-turquoise">Description</label>
            </div>
            <div className="bg-white py-2 px-3 md:py-3 md:px-4 rounded border border-gray-200 text-base md:text-lg">
                {description}
            </div>
        </div>
    );
};