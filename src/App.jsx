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
  const [db, setDb] = useState('');
  
  // Decode URL parameters on mount
  useEffect(() => {
    const params = decodeUrlParams();
    if (params) {
      setLicenseid(params.licenceid);
      setGuid(params.guid);
      setDb(params.db || ''); // Set db if available, empty string if not
    }
  }, []);

  // Fetch order data (now includes db parameter)
  const { orderData, loading, error } = useOrderData(licenceid, guid, db);

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
   <div className="min-h-screen w-full bg-gradient-to-br from-company-sky/20 via-white to-company-sky/20">
        {/* Logo and Company Name Container - Outside main card, responsive positioning */}
        <div className="max-w-6xl mx-auto px-4 pt-4 md:pt-6 lg:pt-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
                {/* Logo - Left Side */}
                <img 
                    src="/e-prod_Logo.png" 
                    alt="Company Logo" 
                    className="h-12 w-auto sm:h-16 md:h-20 lg:h-24 transition-all duration-300"
                />
                
                {/* Company Name - Right Side */}
                {orderData?.CompanyName && (
                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-3 md:px-4 lg:px-6 py-2 md:py-2 lg:py-3 border border-gray-200 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2 md:mr-2 lg:mr-3 text-company-teal flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-left">
                            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide hidden md:block">Company</div>
                            <div className="text-xs md:text-sm lg:text-base font-semibold text-company-turquoise">{orderData?.CompanyName}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>

      
      <div className="max-w-7xl mx-auto bg-white rounded-lg md:rounded-xl shadow-lg md:shadow-xl overflow-hidden">
        <OrderHeader companyName={orderData?.CompanyName} />
        
        <div className="p-4 md:p-6">
          <OrderInfo 
            orderNumber={orderData?.OrderNumber}
            totalBatchAmount={totalBatchAmount}
            batchAmount={orderData?.BatchAmount}
            measurementUnit={orderData?.MeasurementUnit}
          />
          
          {Object.keys(batchAmounts).length > 1 && (
            <BatchDetails batchAmounts={batchAmounts} measurementUnit={orderData?.MeasurementUnit} />
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