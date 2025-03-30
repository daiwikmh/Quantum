import { Copy, Coins, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import { WalletBalance } from "../../lib/types";
import WalletIcon from "./WalletIcon";
import truncateAddress, { getWalletName } from "../../lib/utils";

interface ConnectedWalletProps {
    wallet: WalletBalance;
    handleCopyAddress: (address: string) => Promise<void>;
    openSendDialog?: (wallet: WalletBalance) => void;
    symbol: string;
    name?: string;
}

export const ConnectedWallet = ({ wallet, handleCopyAddress, openSendDialog, symbol, name }: ConnectedWalletProps) => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <WalletIcon 
                            clientType={name === "Aptos" ? "aptos" : wallet.clientType || ''} 
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1 capitalize">
                            {name ? name : getWalletName(wallet.clientType || '')} Wallet
                        </h3>
                        <div className="flex items-center gap-2">
                            <code className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                {truncateAddress(wallet.address)}
                            </code>
                            <button 
                                onClick={() => handleCopyAddress(wallet.address)}
                                className="text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-gray-700" />
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Balance</p>
                        <p className="font-semibold text-lg text-gray-900">
                            {wallet.balance.toFixed(4)} <span className="text-gray-600">{symbol}</span>
                        </p>
                    </div>
                </div>
            </div>

            {openSendDialog && (
                <Button
                    onClick={() => openSendDialog(wallet)}
                    className="w-full bg-black text-white hover:bg-black/90 font-medium rounded-xl h-11"
                >
                    Send {symbol}
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
            )}
        </div>
    );
}