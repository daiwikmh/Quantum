import React from 'react'
import { Button } from './ui/button'

const Subscibe = () => {
    const { account, signAndSubmitTransaction, connect, connected } = useWallet();
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);

  const handlePayFee = async () => {
    if (!connected || !account) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const payload: Types.EntryFunctionPayload = {
        type: "entry_function_payload",
        function: ⁠ ${MODULE_ADDRESS}::FeeSystem::pay_fee ⁠,
        arguments: [],
        type_arguments: [],
      };

      const response = await signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);

      setTransactionSuccess(true);
      console.log("Transaction successful:", response.hash);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Check the console for details.");
    }

    return (
        <Button>
            Subscibe to our Ecosystem
        </Button>
    )
}

export default Subscibe