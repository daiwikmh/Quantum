
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { NetworkKey } from "../lib/fetchWalletBalance";
import { NetworkSelector } from "../components/NetworSelector";
import { useWalletTransactions } from "../hooks/useWalletTransaction";
import { useWalletBalances } from "../hooks/useWalletBalance";

import { ConnectedWallet } from "../components/wallets/ConnectedWallets";
import { EmptyWalletState } from "../components/wallets/EmptyWalletState";
import { SendTransactionDialog } from "../components/transactions/sendTransactionDialog";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import AptosWallet from "../components/wallets/AptosWallet";


const Profile = () => {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>('sepolia');

    const { walletBalances, serverWallet } = useWalletBalances(wallets, user, selectedNetwork);
    const { connected } = useWallet();
    const {
        destinationAddress,
        setDestinationAddress,
        amount,
        setAmount,
        open,
        setOpen,
        selectedWallet,
        handleCopyAddress,
        openSendDialog,
        sendTransaction
    } = useWalletTransactions(wallets, user, serverWallet, selectedNetwork);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 font-montserrat mb-3">
                        Your Wallet Dashboard
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Manage and monitor your connected wallets across different networks
                    </p>
                </div>

                <div className="mb-8 flex justify-center">
                    <NetworkSelector
                        selectedNetwork={selectedNetwork}
                        setSelectedNetwork={setSelectedNetwork}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {connected && (
                        <div className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                            <AptosWallet />
                        </div>
                    )}
                    
                    {(walletBalances.length > 0 || connected) ? (
                        walletBalances.map((wallet, index) => (
                            <div 
                                key={index} 
                                className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                            >
                                <ConnectedWallet
                                    wallet={wallet}
                                    handleCopyAddress={handleCopyAddress}
                                    openSendDialog={openSendDialog}
                                    symbol="ETH"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyWalletState />
                        </div>
                    )}
                </div>

                <SendTransactionDialog
                    open={open}
                    setOpen={setOpen}
                    selectedWallet={selectedWallet}
                    destinationAddress={destinationAddress}
                    setDestinationAddress={setDestinationAddress}
                    amount={amount}
                    setAmount={setAmount}
                    sendTransaction={sendTransaction}
                />

                <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
                </div>
            </div>
        </div>
    );
};

export default Profile;