import { useEffect, useState, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getWalletBalance } from "../lib/fetchWalletBalance";
import { deleteWallet, fetchWallet, getSavedWallets, saveWallet, sendServerTransaction } from "../apiClient";

type SavedWallet = {
    nickname: string;
    address: string;
};

export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
};

const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const SavedWalletsPage = () => {
    const { wallets } = useWallets();
    const [savedWallets, setSavedWallets] = useState<SavedWallet[]>([]);
    const [selectedWallet, setSelectedWallet] = useState<WalletBalance | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [destinationAddress, setDestinationAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
    const [isAddWalletDialogOpen, setIsAddWalletDialogOpen] = useState(false);
    const [newWalletNickname, setNewWalletNickname] = useState("");
    const [newWalletAddress, setNewWalletAddress] = useState("");
    const [serverWallet, setServerWallet] = useState<{ address: string; balance: number } | null>(null);
    const { user } = usePrivy();

    // AI Agent State
    const [commandInput, setCommandInput] = useState("");
    const [processing, setProcessing] = useState(false);
    const [agentResponse, setAgentResponse] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingCommand, setPendingCommand] = useState<{ recipient: string; amount: string; recipientAddress: string } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const getWalletName = (clientType: string) => {
        switch (clientType.toLowerCase()) {
            case 'metamask':
                return "MetaMask";
            case 'coinbase_wallet':
                return "Coinbase"
            case 'privy':
                return "Privy Embedded";
            case 'phantom':
                return "Phantom";
            default:
                return clientType;
        }
    }

    const fetchSavedWallets = async () => {
        if (user?.email?.address) {
            const fetchedWallets = await getSavedWallets(user.email.address);
            setSavedWallets(fetchedWallets.wallets);
        }
    };

    useEffect(() => {
        fetchSavedWallets()
            // Set email in server
            fetch('http://localhost:3000/api/set-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user?.email?.address }),
            })
            .then(response => response.json())
            .then(() => {
                fetchSavedWallets();
            })
            .catch(error => {
                console.error('Error setting email in server:', error);
            });
        
    }, [user?.email?.address]);

    useEffect(() => {
        const fetchWalletData = async () => {
            if (wallets.length > 0) {
                try {
                    const balances = await Promise.all(
                        wallets.map(async (wallet) => {
                            const balance = await getWalletBalance(wallet.address);
                            return {
                                address: wallet.address,
                                clientType: wallet.walletClientType,
                                balance: balance ? parseFloat(balance.balance) : 0,
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
                const balance = await getWalletBalance(serverWalletAddress);
                setServerWallet({
                    address: serverWalletAddress,
                    balance: balance ? parseFloat(balance.balance) : 0,
                });
            } catch (error) {
                console.error("Error fetching server wallet balance:", error);
            }
        };

        if (user?.email?.address) {
            fetchServerWalletData();
            fetchWalletData();
        }
    }, [wallets, user?.email?.address]);

    const handleSaveWallet = async () => {
        if (!newWalletNickname || !newWalletAddress) {
            toast.error("Nickname and address are required.");
            return;
        }

        try {
            const newWallet: SavedWallet = { nickname: newWalletNickname, address: newWalletAddress };
            if (user?.email?.address) {
                await saveWallet(user.email.address, newWallet.address, newWallet.nickname);
                await fetchSavedWallets();
            } else {
                toast.error("User email address is undefined.");
            }
            toast.success("Wallet saved successfully!");
            setIsAddWalletDialogOpen(false);
            setNewWalletNickname("");
            setNewWalletAddress("");
        } catch (error) {
            console.error("Error saving wallet:", error);
            toast.error("Failed to save wallet.");
        }
    };

    const handleDeleteWallet = async (address: string) => {
        if (!user?.email?.address) {
            toast.error("User email address is undefined.");
            return;
        }

        try {
            await deleteWallet(user.email.address, address);
            await fetchSavedWallets();
            toast.success("Wallet deleted successfully!");
        } catch (error) {
            console.error("Error deleting wallet:", error);
            toast.error("Failed to delete wallet.");
        }
    }

    const sendTransaction = async (fromAddress?: string, toAddress?: string, ethAmount?: string) => {
        const sourceAddress = fromAddress || (selectedWallet?.address);
        const targetAddress = toAddress || destinationAddress;
        const sendAmount = ethAmount || amount;

        if (!sourceAddress || !targetAddress || !sendAmount) {
            toast.error("Missing transaction details");
            return;
        }

        try {
            if (sourceAddress === serverWallet?.address) {
                console.log("Sending from Server Wallet");
                const hash = await sendServerTransaction(user?.email?.address!, targetAddress, sendAmount);
                if (hash) {
                    toast.success(`Successfully sent ${sendAmount} ETH to ${truncateAddress(targetAddress)}`);
                    setOpenDialog(false);
                    setShowConfirmation(false);
                    setPendingCommand(null);
                    return hash;
                }
            } else {
                const wallet = wallets.find(w => w.address === sourceAddress);
                if (!wallet) {
                    toast.error("Source wallet not found in connected wallets");
                    return;
                }

                await wallet.switchChain(sepolia.id);
                const provider = await wallet.getEthereumProvider();
                if (!provider) {
                    toast.error("Ethereum provider not available");
                    return;
                }

                const walletClient = createWalletClient({
                    account: wallet.address as Hex,
                    chain: sepolia,
                    transport: custom(provider),
                });

                const [address] = await walletClient.getAddresses();
                const hash = await walletClient.sendTransaction({
                    account: address,
                    to: targetAddress as `0x${string}`,
                    value: parseEther(sendAmount),
                });

                toast.success(`Successfully sent ${sendAmount} ETH to ${truncateAddress(targetAddress)}`);
                setOpenDialog(false);
                setDestinationAddress("");
                setAmount("");
                setShowConfirmation(false);
                setPendingCommand(null);
                return hash;
            }
        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Transaction failed");
            setShowConfirmation(false);
            setPendingCommand(null);
        }
    };

    const processCommand = async () => {
        if (!commandInput.trim()) return;

        setProcessing(true);
        setAgentResponse("");

        try {
            const sendPattern = /send\s+([\d.]+)\s+eth\s+to\s+(\w+)/i;
            const match = commandInput.match(sendPattern);

            if (match) {
                const [_, amountStr, recipientName] = match;
                const amount = amountStr.trim();
                const recipient = recipientName.trim();

                const recipientWallet = savedWallets.find(
                    wallet => wallet.nickname.toLowerCase() === recipient.toLowerCase()
                );

                if (!recipientWallet) {
                    setAgentResponse(`I couldn't find a saved wallet with the name "${recipient}". Please check the name or add this wallet first.`);
                    setProcessing(false);
                    return;
                }

                const sourceWallet = serverWallet || (walletBalances.length > 0 ? walletBalances[0] : null);

                if (!sourceWallet) {
                    setAgentResponse("No wallet is available to send from. Please connect a wallet or ensure the server wallet is available.");
                    setProcessing(false);
                    return;
                }

                setPendingCommand({
                    recipient,
                    amount,
                    recipientAddress: recipientWallet.address
                });
                setShowConfirmation(true);
                setAgentResponse(`I'm ready to send ${amount} ETH to ${recipient} (${truncateAddress(recipientWallet.address)}). Please confirm.`);
            } else {
                setAgentResponse("I understand commands like 'send 0.1 eth to Dev' where 'Dev' is the nickname of a saved wallet.");
            }
        } catch (error) {
            console.error("Error processing command:", error);
            setAgentResponse("I couldn't process your command. Please try again.");
        }

        setProcessing(false);
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="min-h-screen p-6 bg-background text-foreground">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-foreground">Wallet Assistant</h1>

                {/* AI Command Interface */}
                <div className="p-6 rounded-lg bg-card border border-border/20">
                    <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Command Center</h2>
                    <div className="flex gap-3">
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a command (e.g., 'send 0.1 eth to Dev')"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && processCommand()}
                            className="flex-grow bg-input text-foreground"
                        />
                        <Button 
                            onClick={processCommand} 
                            disabled={processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {processing ? 'Processing...' : 'Send'}
                        </Button>
                    </div>

                    {agentResponse && (
                        <div className="mt-4 p-4 rounded-lg bg-accent/50 border border-border/20">
                            <p className="text-card-foreground">{agentResponse}</p>

                            {showConfirmation && pendingCommand && (
                                <div className="mt-4 flex gap-3">
                                    <Button
                                        onClick={() => sendTransaction(
                                            serverWallet?.address,
                                            pendingCommand.recipientAddress,
                                            pendingCommand.amount
                                        )}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowConfirmation(false);
                                            setPendingCommand(null);
                                            setAgentResponse("Transaction cancelled.");
                                        }}
                                        className="border-border/20 hover:bg-accent"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Wallet Management */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-foreground">Saved Wallets</h2>
                        <Button 
                            onClick={() => setIsAddWalletDialogOpen(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Add Wallet
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {savedWallets.length > 0 ? (
                            savedWallets.map((wallet, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg bg-card border border-border/20 flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="text-lg font-medium text-card-foreground">{wallet.nickname}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {truncateAddress(wallet.address)}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDeleteWallet(wallet.address)}
                                            className="border-border/20 hover:bg-accent"
                                        >
                                            Delete
                                        </Button>
                                        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => {
                                                        setDestinationAddress(wallet.address);
                                                        setSelectedWallet(null);
                                                    }}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                >
                                                    Send Transaction
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-card border-border/20">
                                                <DialogHeader>
                                                    <DialogTitle className="text-card-foreground">Send Transaction</DialogTitle>
                                                    <DialogDescription className="text-muted-foreground">
                                                        Enter the amount and select a wallet to send ETH.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-foreground">To</Label>
                                                        <Input
                                                            type="text"
                                                            value={truncateAddress(destinationAddress)}
                                                            disabled
                                                            className="mt-1 bg-input text-foreground"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-foreground">From</Label>
                                                        <select
                                                            className="mt-1 w-full rounded-md border border-border/20 bg-input text-foreground p-2"
                                                            onChange={(e) => {
                                                                const address = e.target.value;
                                                                if (address === serverWallet?.address) {
                                                                    setSelectedWallet(serverWallet);
                                                                } else {
                                                                    setSelectedWallet(
                                                                        walletBalances.find(wallet => wallet.address === address) || null
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Select a wallet</option>
                                                            {serverWallet && (
                                                                <option value={serverWallet.address}>
                                                                    Server Wallet - ({serverWallet.balance.toFixed(4)} ETH)
                                                                </option>
                                                            )}
                                                            {walletBalances.map((wallet, index) => (
                                                                <option key={index} value={wallet.address}>
                                                                    {getWalletName(wallet.clientType || '')} -
                                                                    {truncateAddress(wallet.address)} (
                                                                    {wallet.balance.toFixed(4)} ETH)
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label className="text-foreground">Amount (ETH)</Label>
                                                        <Input
                                                            type="number"
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="mt-1 bg-input text-foreground"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setOpenDialog(false)}
                                                        className="border-border/20 hover:bg-accent"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => sendTransaction()}
                                                        disabled={!selectedWallet || !amount}
                                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                    >
                                                        Send Transaction
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No wallets saved yet.</p>
                        )}
                    </div>
                </div>

                {/* Add Wallet Dialog */}
                <Dialog open={isAddWalletDialogOpen} onOpenChange={setIsAddWalletDialogOpen}>
                    <DialogContent className="bg-card border-border/20">
                        <DialogHeader>
                            <DialogTitle className="text-card-foreground">Add New Wallet</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Enter a nickname and wallet address to save the wallet.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-foreground">Nickname</Label>
                                <Input
                                    type="text"
                                    value={newWalletNickname}
                                    onChange={(e) => setNewWalletNickname(e.target.value)}
                                    className="mt-1 bg-input text-foreground"
                                    placeholder="e.g., My Main Wallet"
                                />
                            </div>
                            <div>
                                <Label className="text-foreground">Wallet Address</Label>
                                <Input
                                    type="text"
                                    value={newWalletAddress}
                                    onChange={(e) => setNewWalletAddress(e.target.value)}
                                    className="mt-1 bg-input text-foreground"
                                    placeholder="0x..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsAddWalletDialogOpen(false)}
                                className="border-border/20 hover:bg-accent"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveWallet}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Save Wallet
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SavedWalletsPage;