// src/App.jsx
import React, { useState, useEffect } from 'react';
import { OrderHeader } from './components/OrderHeader';
import { OrderInfo } from './components/OrderInfo';
import { BatchDetails } from './components/BatchDetails';
import { Description } from './components/Description';
import { DocumentsList } from './components/DocumentsList';
import { FarmersSection } from './components/FarmersSection';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { useOrderData } from './hooks/useOrderData';
import { decodeUrlParams } from './utils/urlDecoder';

function App() {
  const [licenceid, setLicenseid] = useState('');
  const [guid, setGuid] = useState('');
  
  // Decode URL parameters on mount
  useEffect(() => {
    const params = decodeUrlParams();
    if (params) {
      setLicenseid(params.licenceid);
      setGuid(params.guid);
    }
  }, []);

  // Fetch order data
  const { orderData, loading, error } = useOrderData(licenceid, guid);

  // Calculate batch amounts
  const batchAmounts = orderData?.farmers
    ? orderData.farmers.reduce((acc, farmer) => {
      if (farmer.BatchNumber && farmer.BatchAmount) {
        if (!acc[farmer.BatchNumber]) {
          acc[farmer.BatchNumber] = Number(farmer.BatchAmount);
        }
      }
      return acc;
    }, {})
    : {};

  const totalBatchAmount = Object.values(batchAmounts).reduce((sum, amount) => sum + Number(amount), 0);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="w-full bg-gradient-to-br from-company-sky/20 via-white to-company-sky/20 pt-4 pb-4 md:pt-6 md:pb-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg md:rounded-xl shadow-lg md:shadow-xl overflow-hidden">
        <OrderHeader />
        
        <div className="p-4 md:p-6">
          <OrderInfo 
            orderNumber={orderData?.OrderNumber}
            totalBatchAmount={totalBatchAmount}
            batchAmount={orderData?.BatchAmount}
          />
          
          {Object.keys(batchAmounts).length > 1 && (
            <BatchDetails batchAmounts={batchAmounts} />
          )}
          
          {orderData?.Description && (
            <Description description={orderData.Description} />
          )}
          
          {orderData?.documents && orderData.documents.length > 0 && (
            <DocumentsList documents={orderData.documents} />
          )}
          
          {orderData?.farmers && orderData.farmers.length > 0 && (
            <FarmersSection 
              farmers={orderData.farmers} 
              orderData={orderData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;