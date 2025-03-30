import React, { useState } from 'react';
import { Button } from './ui/button';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configure Aptos client
const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);

// Your contract address
const MODULE_ADDRESS = "0x2600c8f15a2236c8b521d002af44ab837ac3b6bb8db131d89af829392b341945";

const Subscribe = () => {
  const { account, signAndSubmitTransaction, connect, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");

  const onSignAndSubmitTransaction = async () => {
    // Connect wallet if not connected
    if (account == null) {
      throw new Error("Wallet not connected");
    }

    if (account == null) {
      throw new Error("Unable to find account to sign transaction");
    }

    setIsLoading(true);
    
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${MODULE_ADDRESS}::FeeSystem::pay_fee`,
          functionArguments: [], // No input arguments as specified
        },
      });

      // Store transaction hash
      setTxHash(response.hash);
      
      // Wait for transaction to complete
      try {
        await aptos.waitForTransaction({ transactionHash: response.hash });
        setTransactionSuccess(true);
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
    <div className="flex flex-col gap-4">
      <Button 
        onClick={onSignAndSubmitTransaction}
        disabled={isLoading}
      >
        {!connected ? "Connect Wallet" : isLoading ? "Processing..." : "Subscribe to our Ecosystem"}
      </Button>
      
      {transactionSuccess && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
          Transaction successful!
          {txHash && (
            <a 
              href={`https://explorer.aptoslabs.com/txn/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline ml-2"
            >
              View on Explorer
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Subscribe;