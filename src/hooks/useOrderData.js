import { useState, useEffect } from 'react';

export const useOrderData = (licenceid, guid) => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLocalData = async () => {
        try {
            const response = await fetch('/orders.json');
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

    useEffect(() => {
        if (licenceid && guid) {
            const url = `${window.location.protocol}//${window.location.host}/call-api`;
            const data = { licenseid: licenceid, guid: guid };

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((sdata) => {
                    if (sdata && Object.keys(sdata).length > 0) {
                        setOrderData(sdata);
                        setLoading(false);
                    } else {
                        fetchLocalData();
                    }
                })
                .catch((error) => {
                    console.error('API Error:', error);
                    fetchLocalData();
                });
        } else {
            fetchLocalData();
        }
    }, [licenceid, guid]);

    return { orderData, loading, error };
};
