import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { ConnectedWallet } from "./ConnectedWallets"

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { WalletBalance } from "../../lib/types";
import { toast } from "sonner";

const AptosWallet = () => {
    const { account, connected } = useWallet()
    const [balance, setBalance] = useState<number | null>(null)


    const getAptosBalance = async (address: string) => {
        const config = new AptosConfig({ network: Network.TESTNET });
        const aptos = new Aptos(config);

        const coinType = "0x1::aptos_coin::AptosCoin";
        const account = address;
        const [balanceStr] = await aptos.view<[string]>({
            payload: {
                function: "0x1::coin::balance",
                typeArguments: [coinType],
                functionArguments: [account]
            }
        });
        const balance = parseInt(balanceStr, 10)/100000000;
        return balance
    }

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            toast.success("Address copied to clipboard");
        } catch (error) {
            console.error("Failed to copy address:", error);
            toast.error("Failed to copy address");
        }
    };

    useEffect(() => {
        const fetchBalance = async () => {
            if (connected && account) {
                const balance = await getAptosBalance(account.address.toString());
                console.log(balance);
                setBalance(balance);
            }
        };
        fetchBalance();
    }, [connected, account]);
    const wallet: WalletBalance = {
        address: account?.address.toString() || "",
        clientType: "aptos",
        balance: balance || 0,
    };

    return (
        connected ? (
            <ConnectedWallet
                wallet={wallet}
                handleCopyAddress={handleCopyAddress}
                symbol="APT"
                name="Aptos"
            />
        ) : (
            <div>Connect Aptos Wallet</div>
        )
    );
}

export default AptosWallet