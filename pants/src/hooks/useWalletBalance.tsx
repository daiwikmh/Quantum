import { useState, useEffect } from "react";
import { getWalletBalance, NetworkKey } from "../lib/fetchWalletBalance";

import { fetchWallet } from "../apiClient";
import { WalletBalance } from "../lib/types";

export const useWalletBalances = (wallets: any[], user: any, selectedNetwork: NetworkKey) => {
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number; network?: NetworkKey } | null>(null);

    useEffect(() => {
        const fetchWalletData = async () => {
            if (wallets.length > 0) {
                try {
                    const balances = await Promise.all(
                        wallets.map(async (wallet) => {
                            const balanceResult = await getWalletBalance(wallet.address, selectedNetwork);
                            return {
                                address: wallet.address,
                                clientType: wallet.walletClientType,
                                balance: balanceResult ? parseFloat(balanceResult.balance) : 0,
                                network: selectedNetwork
                            };
                        })
                    );
                    setWalletBalances(balances);
                } catch (error) {
                    console.error("Error fetching wallet balances:", error);
                }
            }
        };

        const fetchServerWalletData = async () => {
            try {
                const wallet = await fetchWallet(user?.email?.address!);
                const serverWalletAddress = wallet.wallet.address;
                const balanceResult = await getWalletBalance(serverWalletAddress, selectedNetwork);
                setServerWallet({
                    address: serverWalletAddress,
                    balance: balanceResult ? parseFloat(balanceResult.balance) : 0,
                    network: selectedNetwork
                });
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
            }
        };

        fetchServerWalletData();
        fetchWalletData();
    }, [wallets, selectedNetwork, user]);

    return { walletBalances, serverWallet };
};
