export const hasGeojsonData = (orderData) => {
    if (!orderData?.documents) return false;

    return orderData.documents.some(doc =>
        doc.documentType &&
        (doc.documentType.toLowerCase().includes('geojson') ||
            doc.documentType.toLowerCase().includes('polygon') ||
            doc.documentName?.toLowerCase().includes('.geojson')) &&
        doc.documentBase64
    );
};