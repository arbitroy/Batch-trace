export const loadGeojsonData = async (orderData, setMapError) => {
    try {
        if (!orderData?.documents) {
            console.warn('No documents available in orderData');
            setMapError('No documents available to extract field data.');
            return null;
        }

        // Find documents that contain GeoJSON data
        const geojsonDoc = orderData.documents.find(doc =>
            doc.documentType &&
            (doc.documentType.toLowerCase().includes('geojson') ||
                doc.documentType.toLowerCase().includes('polygon') ||
                doc.documentType.toLowerCase().includes('coordinate') ||
                doc.documentName?.toLowerCase().includes('.geojson'))
        );

        if (!geojsonDoc) {
            console.warn('No GeoJSON document found in orderData');
            setMapError('No field boundary data found in the order documents.');
            return null;
        }

        if (!geojsonDoc.documentBase64) {
            console.warn('GeoJSON document has no base64 data');
            setMapError('Field boundary document is empty.');
            return null;
        }

        // Decode the base64 data
        let decodedData;
        try {
            decodedData = atob(geojsonDoc.documentBase64);
        } catch (error) {
            console.error('Error decoding base64:', error);
            setMapError('Error decoding field boundary data.');
            return null;
        }

        // Parse as JSON
        let geoJsonData;
        try {
            geoJsonData = JSON.parse(decodedData);
        } catch (error) {
            console.error('Error parsing GeoJSON:', error);
            setMapError('Error parsing field boundary data.');
            return null;
        }

        // Validate it's a proper GeoJSON
        if (!geoJsonData.type || geoJsonData.type !== 'FeatureCollection') {
            console.warn('Invalid GeoJSON format');
            setMapError('Invalid field boundary data format.');
            return null;
        }

        console.log('Loaded GeoJSON data from documents:', geoJsonData);
        return geoJsonData;
    } catch (error) {
        console.warn('Error loading GeoJSON:', error);
        setMapError('Error loading field data. Please check the document format.');
        return null;
    }
};

// Extract coordinates from a feature (polygon centroid or point)
export const extractCoordinatesFromFeature = (feature) => {
    if (!feature || !feature.geometry) return null;

    if (feature.geometry.type === 'Point') {
        return feature.geometry.coordinates;
    } else if (feature.geometry.type === 'Polygon') {
        // Calculate centroid of polygon
        const coords = feature.geometry.coordinates[0];
        const centroid = calculateCentroid(coords);
        return centroid;
    } else if (feature.geometry.type === 'MultiPolygon') {
        // Calculate centroid of first polygon in MultiPolygon
        const coords = feature.geometry.coordinates[0][0];
        const centroid = calculateCentroid(coords);
        return centroid;
    }

    return null;
};

// Calculate centroid of a polygon
const calculateCentroid = (coords) => {
    let totalX = 0;
    let totalY = 0;
    const numPoints = coords.length;

    coords.forEach(coord => {
        totalX += coord[0];
        totalY += coord[1];
    });

    return [totalX / numPoints, totalY / numPoints];
};