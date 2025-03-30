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
            <DialogContent className="bg-white border-2 border-gray-200 shadow-xl rounded-2xl sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 font-montserrat">Send Transaction</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Send ETH to another wallet address. Please verify all details before confirming.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-medium text-gray-700">From</Label>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
                            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-mono text-sm text-gray-900">
                                {truncateAddress(selectedWallet?.address || "")}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="destination" className="text-sm font-medium text-gray-700">
                            Destination Address
                        </Label>
                        <Input
                            id="destination"
                            placeholder="0x..."
                            value={destinationAddress}
                            onChange={(e) => setDestinationAddress(e.target.value)}
                            className="font-mono border-2 border-gray-200 rounded-xl h-11"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                            Amount (ETH)
                        </Label>
                        <div className="relative">
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pr-12 border-2 border-gray-200 rounded-xl h-11"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 font-medium">
                                ETH
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setOpen(false);
                            setDestinationAddress("");
                            setAmount("");
                        }}
                        className="rounded-xl border-2 border-gray-200 hover:bg-gray-100 hover:text-gray-900 h-11 px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={sendTransaction}
                        className="rounded-xl bg-black hover:bg-black/90 text-white h-11 px-6"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send Transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}