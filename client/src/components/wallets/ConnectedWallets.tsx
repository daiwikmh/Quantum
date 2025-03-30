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
        <div className="group relative w-full bg-white rounded-2xl border border-gray-200/50 shadow-sm p-8 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl transform transition-transform duration-300 group-hover:scale-110">
                        <WalletIcon
                            clientType={name === "Aptos" ? "aptos" : wallet.clientType || ''}

                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-xl capitalize">
                            {name ? name : getWalletName(wallet.clientType || '')} Wallet
                        </h3>
                        <div className="flex items-center gap-3">
                            <code className="text-sm text-gray-600 font-mono bg-gray-50/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-100">
                                {truncateAddress(wallet.address)}
                            </code>
                            <button
                                onClick={() => handleCopyAddress(wallet.address)}
                                className="text-gray-500 hover:text-indigo-600 transition-colors duration-300 p-2 hover:bg-gray-50 rounded-lg"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 w-full sm:w-auto">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                                <Coins className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                                <p className="font-semibold text-2xl text-gray-900">
                                    {wallet.balance.toFixed(4)} <span className="text-indigo-600 font-medium">{symbol}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {openSendDialog && (
                        <Button
                            onClick={() => openSendDialog(wallet)}
                            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 font-medium rounded-xl px-8 h-14 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap w-full sm:w-auto"
                        >
                            Send {symbol}
                            <ArrowUpRight className="w-5 h-5 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}