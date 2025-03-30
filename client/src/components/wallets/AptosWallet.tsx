import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { ConnectedWallet } from "./ConnectedWallets"
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useEffect, useState } from "react";
import { WalletBalance } from "../../lib/types";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

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
            toast.success("Address copied to clipboard", {
                className: "font-medium",
            });
        } catch (error) {
            console.error("Failed to copy address:", error);
            toast.error("Failed to copy address", {
                className: "font-medium",
            });
        }
    };

    useEffect(() => {
        const fetchBalance = async () => {
            if (connected && account) {
                const balance = await getAptosBalance(account.address.toString());
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

    return connected ? (
        <ConnectedWallet
            wallet={wallet}
            handleCopyAddress={handleCopyAddress}
            symbol="APT"
            name="Aptos"
        />
    ) : (
        <div className="group relative w-full bg-white rounded-2xl border border-gray-200/50 shadow-sm p-8 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-8">
                <div className="p-5 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl transform transition-transform duration-300 group-hover:scale-110">
                    <Wallet className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-2xl text-gray-900 mb-3">Connect Aptos Wallet</h3>
                    <p className="text-gray-600 text-lg">Connect your Aptos wallet to view balance and make transactions on the Aptos network</p>
                </div>
            </div>
        </div>
    );
}

export default AptosWallet