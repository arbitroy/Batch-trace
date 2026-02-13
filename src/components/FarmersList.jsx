import React from 'react';

export const FarmersList = ({ farmers }) => {
    return (
        <>
            {/* Mobile view: Cards */}
            <div className="md:hidden space-y-3">
                {farmers.map((farmer, index) => (
                    <div key={index} className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
                        <div className="h-2 bg-company-teal w-full"></div>
                        <div className="p-4">
                            {/* <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-company-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-base font-medium text-company-turquoise">
                                    {farmer.FarmerName}
                                </span>
                            </div> */}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-500">Field</div>
                                    <div className="text-sm font-medium">{farmer.FieldName}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">Group</div>
                                    <div className="text-sm font-medium">{farmer.GroupName}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">Location</div>
                                    <div className="text-sm font-medium">{farmer.Location}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-gray-500">Batch</div>
                                    <div className="text-sm font-medium">
                                        <span className="px-2 py-1 text-xs rounded bg-company-sky/20">
                                            {farmer.BatchNumber}
                                        </span>
                                    </div>
                                </div>

                                {farmer.BatchAmount && (
                                    <div>
                                        <div className="text-xs text-gray-500">Amount</div>
                                        <div className="text-sm font-medium text-company-lime">
                                            {farmer.BatchAmount.toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop view: Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Farmer
                            </th> */}
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Field
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Group
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Batch
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {farmers.map((farmer, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {/* <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-company-turquoise">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-company-teal mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {farmer.FarmerName}
                                    </div>
                                </td> */}
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                    {farmer.FieldName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                    {farmer.GroupName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                    {farmer.Location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                    <span className="px-3 py-1.5 text-sm rounded bg-company-sky/20">
                                        {farmer.BatchNumber}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};