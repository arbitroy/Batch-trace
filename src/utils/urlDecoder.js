export const decodeUrlParams = () => {
    try {
        const path = window.location.pathname;
        const matches = path.match(/\/order\/([^\/]+)/);

        if (!matches || !matches[1]) {
            console.error('No encoded data found in URL path');
            return null;
        }

        const encodedString = matches[1];

        // Check if there's a colon separator (for licenceid:guid format)
        if (encodedString.includes(':')) {
            const [encodedLicenceId, encodedGuid] = encodedString.split(':');
            try {
                const licenceid = atob(encodedLicenceId);
                const guid = encodedGuid;
                console.log('Decoded licenceid:', licenceid);
                console.log('GUID:', guid);
                return { licenceid, guid };
            } catch (e) {
                console.error('Error decoding parts:', e);
                return null;
            }
        } else {
            // Try to decode the whole string in one go
            try {
                const decodedString = atob(encodedString);
                if (decodedString.includes('.')) {
                    const [licenceid, guid] = decodedString.split('.');
                    return { licenceid, guid };
                } else {
                    console.error('Cannot determine format of decoded string:', decodedString);
                    return null;
                }
            } catch (e) {
                console.error('Error decoding string:', e);
                return null;
            }
        }
    } catch (err) {
        console.error('Error in decoding URL parameters:', err);
        return null;
    }
};