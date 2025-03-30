import { useState } from 'react';

const Payment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Add your payment logic here
      console.log('Processing payment...');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center">Make a Payment</h1>
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`
            px-6 py-3 text-white rounded-lg
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
            transition-colors duration-200
            flex items-center justify-center min-w-[200px]
          `}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default Payment;