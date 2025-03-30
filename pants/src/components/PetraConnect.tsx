import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import { WalletIcon } from "lucide-react";

const WalletConnectButton = () => {
  const { connect, disconnect, account, connected } = useWallet();

  const handleConnect = async () => {
    try {
      // Change below to the desired wallet name instead of "Petra"
      connect("Petra" as any);
      console.log("Connected to wallet:", account?.address.toString());

      // Send wallet data to backend
//       const apiResponse = await fetch(
//         "http://localhost:3000/api/set-provider",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             account: account,
//             wallet: wallet,
//           }),
//         }
//       );

//       if (!apiResponse.ok) {
//         throw new Error("Failed to set provider");
//       }
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      console.log("Disconnected from wallet");
    } catch (error) {
      console.error("Failed to disconnect from wallet:", error);
    }
  };

  return (
    <div>
      <div>
        {connected ? (
          <div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-xl">
              <WalletIcon className="h-4 w-4 text-black" />
              <div>
                <p className="text-sm font-medium font-montserrat capitalize">
                  Aptos Wallet
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {account?.address.toString().slice(0, 6)}...
                  {account?.address.toString().slice(-4)}
                </p>
              </div>
            </div>
            <Button
              className="w-full rounded-full border-2 border-black hover:bg-black hover:text-white font-montserrat"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full rounded-full border-2 border-black hover:bg-black hover:text-white font-montserrat"
            onClick={handleConnect}
          >
            Connect Aptos Wallet
          </Button>
        )}
      </div>
    </div>
  );
};

export default WalletConnectButton;
