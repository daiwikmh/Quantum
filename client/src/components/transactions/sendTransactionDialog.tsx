import { Send, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import truncateAddress from "../../lib/utils";


interface SendTransactionDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedWallet: any;
    destinationAddress: string;
    setDestinationAddress: (address: string) => void;
    amount: string;
    setAmount: (amount: string) => void;
    sendTransaction: () => Promise<void>;
}

export const SendTransactionDialog = ({
    open,
    setOpen,
    selectedWallet,
    destinationAddress,
    setDestinationAddress,
    amount,
    setAmount,
    sendTransaction
}: SendTransactionDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Send Transaction</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Send ETH to another wallet address. Please verify all details before confirming.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium">From</Label>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-mono text-sm">
                                {truncateAddress(selectedWallet?.address || "")}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="destination" className="text-sm font-medium">
                            Destination Address
                        </Label>
                        <Input
                            id="destination"
                            placeholder="0x..."
                            value={destinationAddress}
                            onChange={(e) => setDestinationAddress(e.target.value)}
                            className="font-mono"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-sm font-medium">
                            Amount (ETH)
                        </Label>
                        <div className="relative">
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pr-12"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                ETH
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setOpen(false);
                            setDestinationAddress("");
                            setAmount("");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={sendTransaction}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
