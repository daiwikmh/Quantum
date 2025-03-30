import { useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { createWalletClient, custom, parseEther, Hex } from 'viem';
import { CHAIN_MAP } from "../constants/index";
import { SUPPORTED_NETWORKS, NetworkKey } from "../lib/fetchWalletBalance";
import { sendServerTransaction } from "../apiClient";

export const useWalletTransactions = (wallets: any[], user: any, serverWallet: any, selectedNetwork: NetworkKey) => {
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<any | undefined>(undefined);

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            toast.success("Address copied to clipboard");
        } catch (error) {
            console.error("Failed to copy address:", error);
            toast.error("Failed to copy address");
        }
    };

    const openSendDialog = (wallet: any) => {
        setSelectedWallet(wallet);
        setOpen(true);
    };

    const sendTransaction = async () => {
        if (!selectedWallet || !selectedNetwork) return;

        try {
            // Validate destination address
            if (!ethers.isAddress(destinationAddress)) {
                toast.error("Invalid destination address");
                return;
            }

            // Validate amount
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                toast.error("Invalid transaction amount");
                return;
            }

            if (selectedWallet.address === serverWallet?.address) {
                // Server wallet transaction
                const hash = await sendServerTransaction(
                    user?.email?.address!,
                    destinationAddress,
                    amount,
                );

                if (hash) {
                    toast.success(`Server wallet transaction successful on ${SUPPORTED_NETWORKS[selectedNetwork].name}`);
                    setOpen(false);
                }
            } else {
                // Connected wallet transaction
                const wallet = wallets.find(wallet => wallet.address === selectedWallet.address);
                if (!wallet) {
                    console.error('Wallet not found');
                    return;
                }

                // Get the corresponding chain for the selected network
                const chain = CHAIN_MAP[selectedNetwork as keyof typeof CHAIN_MAP];
                console.log("Selected chain:", chain);
                if (!chain) {
                    toast.error(`Unsupported network: ${selectedNetwork}`);
                    return;
                }

                // Switch to the selected chain
                await wallet.switchChain(chain.id);

                console.log("Chain switched to:", chain.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    console.error('Ethereum provider is undefined');
                    return;
                }

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: chain,
                    transport: custom(provider),
                });

                const [address] = await walletClient.getAddresses();
                const hash = await walletClient.sendTransaction({
                    account: address,
                    to: destinationAddress as `0x${string}`,
                    value: parseEther(amount),
                    chain: chain,
                });

                toast.success(`Transaction successful on ${SUPPORTED_NETWORKS[selectedNetwork].name}`);
                setOpen(false);
                // Transaction hash is logged but not returned to match the expected return type
                console.log("Transaction hash:", hash);
            }
        } catch (error: any) {
            console.error("Error sending transaction:", error);

            // Provide more detailed error messaging
            const errorMessage = error.message || "Error sending transaction";
            toast.error(errorMessage);
        }
    };

    return {
        destinationAddress,
        setDestinationAddress,
        amount,
        setAmount,
        open,
        setOpen,
        selectedWallet,
        setSelectedWallet,
        handleCopyAddress,
        openSendDialog,
        sendTransaction
    };
};