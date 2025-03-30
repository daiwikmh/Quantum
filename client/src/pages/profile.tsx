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
    const {connected} = useWallet();
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
            <NetworkSelector
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
            />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Your Wallet Dashboard</h1>
                <p className="text-muted-foreground">Manage and monitor your connected wallets</p>
            </div>

            <ServerWallet
                serverWallet={serverWallet}
                handleCopyAddress={handleCopyAddress}
                openSendDialog={openSendDialog}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connected && <AptosWallet />}
                {walletBalances.length > 0 ? (
                    walletBalances.map((wallet, index) => (
                        <ConnectedWallet
                            key={index}
                            wallet={wallet}
                            handleCopyAddress={handleCopyAddress}
                            openSendDialog={openSendDialog}
                            symbol="ETH"
                        />
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
    );
};

export default Profile;
