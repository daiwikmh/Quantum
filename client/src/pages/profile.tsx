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

function App() {
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
        <div className="min-h-screen bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
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

                <div className="space-y-4">
                    {connected && (
                        <div className="transform transition-all duration-300 hover:translate-y-[-4px]">
                            <AptosWallet />
                        </div>
                    )}

                    {(walletBalances.length > 0 || connected) ? (
                        walletBalances.map((wallet, index) => (
                            <div
                                key={index}
                                className="transform transition-all duration-300 hover:translate-y-[-4px]"
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
                        <EmptyWalletState />
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
            </div>
        </div>
    );
}

export default App;