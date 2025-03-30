import { Copy, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { WalletBalance } from "../../lib/types";
import WalletIcon from "./WalletIcon";
import truncateAddress, { getWalletName } from "../../lib/utils";



interface ConnectedWalletProps {
    wallet: WalletBalance;
    handleCopyAddress: (address: string) => Promise<void>;
    openSendDialog: (wallet: WalletBalance) => void;
}

export const ConnectedWallet = ({ wallet, handleCopyAddress, openSendDialog }: ConnectedWalletProps) => {
    return (
        <div className="bg-card rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <WalletIcon clientType={wallet.clientType || ''} />
                    <div>
                        <h3 className="font-semibold text-lg text-foreground capitalize">
                            {getWalletName(wallet.clientType || '')} Wallet
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                            {truncateAddress(wallet.address)}
                        </p>
                        <button onClick={() => handleCopyAddress(wallet.address)}>
                            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 bg-muted rounded-lg p-4">
                <Coins className="w-5 h-5 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="font-semibold text-lg text-foreground">
                        {wallet.balance.toFixed(4)} ETH
                    </p>
                </div>
            </div>

            <Button
                onClick={() => openSendDialog(wallet)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
            >
                Send Transaction
            </Button>
        </div>
    );
};
