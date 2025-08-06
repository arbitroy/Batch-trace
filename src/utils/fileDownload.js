export const handleFileDownload = (doc) => {
    if (!doc.documentBase64) {
        alert("No file available for download");
        return;
    }

    try {
        const link = document.createElement('a');
        const fileName = doc.documentName || 'document.txt';
        const fileExtension = fileName.split('.').pop().toLowerCase();

        // Select correct MIME type based on extension
        let mimeType = 'application/octet-stream';
        if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension)) {
            mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        } else if (fileExtension === 'pdf') {
            mimeType = 'application/pdf';
        } else if (fileExtension === 'svg') {
            mimeType = 'image/svg+xml';
        } else if (fileExtension === 'txt') {
            mimeType = 'text/plain';
        }

        const base64Data = doc.documentBase64;
        link.href = base64Data.includes('data:')
            ? base64Data
            : `data:${mimeType};base64,${base64Data}`;

        link.download = doc.documentName || `${doc.documentType.replace(/\s+/g, '-')}-${doc.documentNumber}.${fileExtension}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download file");
    }
};