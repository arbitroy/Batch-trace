import React from 'react';

const PurchaseDetailsPage = () => {
    // Sample data structure - using a regular const instead of state since this is a display-only page
    const purchaseData = {
        purchase_number: 43432,
        batch_number: "DRY83482",
        documents: [
            {
                name: "Invoice Document",
                number: 321,
                filebase64: "data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1IDAgUiAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeAF9kU="
            },
            {
                name: "Shipping Manifest",
                number: 322,
                filebase64: "data:application/pdf;base64,JVBERi0xLjYKJfbk7/4KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAw"
            },
            {
                name: "Quality Certificate",
                number: 323,
                filebase64: ""
            }
        ]
    };

    // Function to download file from base64
    const handleFileDownload = (doc) => {
        // Only proceed if there's actually a base64 string
        if (!doc.filebase64) {
            alert("No file available for download");
            return;
        }

        try {
            // Create a link element
            const link = document.createElement('a');

            // Set link's href to the base64 data
            // Assuming the base64 string includes the data type prefix like "data:application/pdf;base64,"
            link.href = doc.filebase64.includes('data:') ? doc.filebase64 : `data:application/octet-stream;base64,${doc.filebase64}`;

            // Set download attribute to filename
            link.download = doc.name || `document-${doc.number}.pdf`;

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download file");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Purchase Details</h1>

            {/* Purchase Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Purchase Number</label>
                        <div className="mt-1 text-lg font-semibold">{purchaseData.purchase_number}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                        <div className="mt-1 text-lg font-semibold">{purchaseData.batch_number}</div>
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Documents</h2>

                {purchaseData.documents.map((doc, index) => (
                    <div key={index} className="border rounded-md p-4 mb-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                                <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
                                    {doc.name || "Unnamed Document"}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                                <div className="px-3 py-2 border rounded-md bg-gray-50">{doc.number}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
                                <button
                                    onClick={() => handleFileDownload(doc)}
                                    disabled={!doc.filebase64}
                                    className={`px-4 py-2 rounded-md flex items-center text-sm font-medium w-full justify-center
                    ${doc.filebase64
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    {doc.filebase64 ? 'Download File' : 'No File Available'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Back Button */}
            <div className="mt-6 flex justify-end">
                <button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    Back
                </button>
            </div>
        </div>
    );
};

export default PurchaseDetailsPage;