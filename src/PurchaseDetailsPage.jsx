import React, { useState, useEffect } from 'react';

// Utility to detect file type from extension
const getFileTypeIcon = (fileName) => {
  if (!fileName) return 'document';
  
  const extension = fileName.split('.').pop().toLowerCase();
  
  switch(extension) {
    case 'pdf':
      return 'pdf';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return 'image';
    case 'txt':
    case 'log':
      return 'text';
    default:
      return 'document';
  }
};

// Component for document icons based on file type
const IconByType = ({type}) => {
  switch(type) {
    case 'pdf':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'text':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-company-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const PurchaseDetailsPage = () => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data from the JSON file in the project directory
        const fetchData = async () => {
            try {
                const response = await fetch('/orderData.json');
                if (!response.ok) {
                    throw new Error('Failed to load order data');
                }
                const data = await response.json();
                setOrderData(data);
                setLoading(false);
            } catch (err) {
                console.error('Error loading order data:', err);
                setError('Failed to load order data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to download file from base64
    const handleFileDownload = (doc) => {
        if (!doc.documentBase64) {
            alert("No file available for download");
            return;
        }

        try {
            // Create a link element
            const link = document.createElement('a');
            
            // Get file extension from document name for the correct MIME type
            const fileName = doc.documentName || 'document.txt';
            const fileExtension = fileName.split('.').pop().toLowerCase();
            
            // Select correct MIME type based on extension
            let mimeType = 'application/octet-stream'; // Default
            if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
                mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
            } else if (fileExtension === 'pdf') {
                mimeType = 'application/pdf';
            } else if (fileExtension === 'svg') {
                mimeType = 'image/svg+xml';
            } else if (fileExtension === 'txt') {
                mimeType = 'text/plain';
            }
            
            // Set link's href to the base64 data
            const base64Data = doc.documentBase64;
            link.href = base64Data.includes('data:') 
                ? base64Data 
                : `data:${mimeType};base64,${base64Data}`;
            
            // Set download attribute to filename
            link.download = doc.documentName || `${doc.documentType.replace(/\s+/g, '-')}-${doc.documentNumber}.${fileExtension}`;
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-company-sky/10">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-company-teal border-t-company-lime rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-company-turquoise font-medium">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-company-sky/10">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
                    <div className="text-red-500 mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
                    <p className="text-gray-600 text-center">{error}</p>
                    <div className="mt-6 flex justify-center">
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-company-turquoise text-white rounded-md hover:bg-company-turquoise/90"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get unique batch numbers
    const uniqueBatchNumbers = orderData?.farmers 
        ? [...new Set(orderData.farmers.map(farmer => farmer.BatchNumber))] 
        : [];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-company-sky/20 via-white to-company-sky/20">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden my-8">
                {/* Solid Header */}
                <div className="bg-company-turquoise py-6 px-8">
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Purchase Details
                    </h1>
                </div>

                <div className="p-4">
                    {/* Purchase Information Card */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-company-sky/10 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-company-teal flex items-center justify-center text-white mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <label className="text-sm font-medium text-company-turquoise">Order Number</label>
                            </div>
                            <div className="bg-white py-2 px-3 rounded border border-gray-200 text-center">
                                {orderData?.OrderNumber || 'N/A'}
                            </div>
                        </div>
                        
                        <div className="bg-company-sky/10 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-company-teal flex items-center justify-center text-white mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <label className="text-sm font-medium text-company-turquoise">Batch Number</label>
                            </div>
                            <div className="bg-white py-2 px-3 rounded border border-gray-200 text-center text-company-teal">
                                {uniqueBatchNumbers.length > 0 ? uniqueBatchNumbers[0] : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {orderData?.Description && (
                        <div className="bg-company-sky/10 rounded-lg p-4 mb-6">
                            <div className="flex items-center mb-2">
                                <div className="w-8 h-8 rounded-full bg-company-teal flex items-center justify-center text-white mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <label className="text-sm font-medium text-company-turquoise">Description</label>
                            </div>
                            <div className="bg-white py-2 px-3 rounded border border-gray-200">
                                {orderData.Description}
                            </div>
                        </div>
                    )}

                    {/* Documents Section */}
                    {orderData?.documents && orderData.documents.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <span className="w-8 h-1 bg-company-lime rounded-full mr-2"></span>
                                <h2 className="text-lg font-semibold text-company-turquoise">Documents</h2>
                                <span className="flex-grow h-px bg-gray-200 ml-3"></span>
                            </div>

                            <div className="space-y-2">
                                {orderData.documents.map((doc, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center bg-white rounded-md border border-gray-200 overflow-hidden"
                                    >
                                        <div className="h-full w-1 bg-company-teal"></div>
                                        <div className="w-10 h-10 flex items-center justify-center mx-3">
                                            <IconByType type={getFileTypeIcon(doc.documentName)} />
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-2 flex-1 py-3 pr-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Document Type</div>
                                                <div className="text-sm font-medium">
                                                    {doc.documentType || "Unknown Type"}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Document Number</div>
                                                <div className="text-sm font-medium">
                                                    #{doc.documentNumber || "N/A"}
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-end items-center">
                                                <button
                                                    onClick={() => handleFileDownload(doc)}
                                                    disabled={!doc.documentBase64}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium flex items-center
                                                        ${doc.documentBase64 
                                                            ? 'bg-company-lime hover:bg-company-lime/90 text-gray-800' 
                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
                    )}

                    {/* Farmers Section - Table Format */}
                    {orderData?.farmers && orderData.farmers.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <span className="w-8 h-1 bg-company-lime rounded-full mr-2"></span>
                                <h2 className="text-lg font-semibold text-company-turquoise">Farmers</h2>
                                <span className="flex-grow h-px bg-gray-200 ml-3"></span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Farmer
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Field
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Group
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Location
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Batch
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orderData.farmers.map((farmer, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-company-turquoise">
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-company-teal mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {farmer.FarmerName}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {farmer.FieldName}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {farmer.GroupName}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    {farmer.Location}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                    <span className="px-2 py-1 text-xs rounded bg-company-sky/20">
                                                        {farmer.BatchNumber}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetailsPage;