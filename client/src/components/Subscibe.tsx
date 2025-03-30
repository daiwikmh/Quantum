import { useState } from 'react';
import { Button } from './ui/button';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

// Configure Aptos client
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Your contract address
const MODULE_ADDRESS = "0x903a8c9e37c744674108ea208c81e60ff09d78c612ffa9df78396e99634f8204";

interface SubscribeProps {
  onSubscriptionSuccess?: () => void;
}

const Subscribe = ({ onSubscriptionSuccess }: SubscribeProps) => {
  const { account, signAndSubmitTransaction, connect, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");

  const onSignAndSubmitTransaction = async () => {
    if (!connected) {
      try {
        connect('Petra');
        return;
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        return;
      }
    }

    if (account == null) {
      console.error("Unable to find account to sign transaction");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::FeeSystem::pay_fee`,
          functionArguments: [],
        },
      });

      setTxHash(response.hash);
      
      try {
        await aptos.waitForTransaction({ transactionHash: response.hash });
        setTransactionSuccess(true);
        
        // Call the success callback to update parent component state
        if (onSubscriptionSuccess) {
          onSubscriptionSuccess();
        }
        
        console.log("Transaction successful:", response);
      } catch (error) {
        console.error("Transaction failed while waiting:", error);
        setTransactionSuccess(false);
      }
    } catch (error) {
      console.error("Transaction signing failed:", error);
      setTransactionSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">Join Our Ecosystem</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        Subscribe to unlock exclusive features and become part of our growing community. 
        Your subscription helps support the development of new features and improvements.
      </p>
      
      <div className="flex flex-col items-center gap-6">
        <Button 
          onClick={onSignAndSubmitTransaction}
          disabled={isLoading || transactionSuccess}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 min-w-[250px]"
        >
          {!connected ? (
            "Connect Wallet"
          ) : isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Processing...</span>
            </div>
          ) : transactionSuccess ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Subscribed!</span>
            </div>
          ) : (
            "Subscribe Now"
          )}
        </Button>
        
        {transactionSuccess && (
          <div className="flex flex-col items-center gap-4 p-6 bg-green-50 rounded-xl w-full max-w-md">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-semibold">Transaction Successful!</span>
            </div>
            <p className="text-green-700">
              Your subscription is now active. You can now access all features.
            </p>
            {txHash && (
              <a 
                href={`https://explorer.aptoslabs.com/txn/${txHash}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribe;