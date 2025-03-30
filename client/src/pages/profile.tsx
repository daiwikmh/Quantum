import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { NetworkKey } from "../lib/fetchWalletBalance"
import { NetworkSelector } from "../components/NetworSelector";
import { useWalletTransactions } from "../hooks/useWalletTransaction";
import { useWalletBalances } from "../hooks/useWalletBalance";
import { ServerWallet } from "../components/wallets/ServerWallet";
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-montserrat mb-2">Your Wallet Dashboard</h1>
                    <p className="text-gray-600">Manage and monitor your connected wallets</p>
                </div>
                <NetworkSelector
                    selectedNetwork={selectedNetwork}
                    setSelectedNetwork={setSelectedNetwork}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connected && (
                    <div className="transform transition-all duration-200 hover:scale-[1.02]">
                        <AptosWallet />
                    </div>
                )}
                
                {(walletBalances.length > 0 || connected) ? (
                    walletBalances.map((wallet, index) => (
                        <div key={index} className="transform transition-all duration-200 hover:scale-[1.02]">
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
        </div>
    );
};

export default Profile;