import React from 'react';
import { getFileTypeIcon, IconByType } from './DocumentIcons';
import { handleFileDownload } from '../utils/fileDownload';

export const DocumentsList = ({ documents }) => {
    return (
        <div className="mb-6 md:mb-8">
            <div className="flex items-center mb-4 md:mb-6">
                <span className="w-8 h-2 md:w-10 md:h-2 bg-company-lime rounded-full mr-3"></span>
                <h2 className="text-lg md:text-xl font-semibold text-company-turquoise">Documents</h2>
                <span className="flex-grow h-px bg-gray-200 ml-4"></span>
            </div>

            <div className="space-y-3 md:space-y-4">
                {documents.map((doc, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-md border border-gray-200 overflow-hidden"
                    >
                        <div className="h-2 bg-company-teal w-full"></div>
                        <div className="p-3 md:p-4">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 flex items-center justify-center mr-3">
                                    <IconByType type={getFileTypeIcon(doc.documentName)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-500">Document Type</div>
                                    <div className="text-base font-medium truncate">
                                        {doc.documentType || "Unknown Type"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-between items-center">
                                <div className="mb-3 md:mb-0">
                                    <div className="text-sm text-gray-500">Document Number</div>
                                    <div className="text-base font-medium">
                                        #{doc.documentNumber || "N/A"}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleFileDownload(doc)}
                                    disabled={!doc.documentBase64}
                                    className={`px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base font-medium flex items-center
                    ${doc.documentBase64
                                            ? 'bg-company-lime hover:bg-company-lime/90 text-gray-800 mt-2 w-full md:w-auto justify-center md:justify-start md:mt-0'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed mt-2 w-full md:w-auto justify-center md:justify-start md:mt-0'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download File
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};