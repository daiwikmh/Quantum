import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
    WalletIcon, 
    Loader2, 
    ExternalLink, 
    ArrowUpIcon, 
    ArrowDownIcon,
    RefreshCw,
    BadgeInfo
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { fetchWallet } from "../apiClient";
import axios from "axios";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export interface Transaction {
    hash: string;
    nonce: string;
    from: string;
    to: string;
    value: string;
    gasPrice: string;
    gasUsed: string;
    fee: string;
    timestamp: string;
    type?: string;
    function?: string;
}

export interface ApiResponse {
    cursor: string | null;
    page_size: number;
    page: number;
    result: Array<{
        hash: string;
        nonce: string;
        transaction_index: string;
        from_address: string;
        to_address: string;
        value: string;
        gas: string;
        gas_price: string;
        receipt_gas_used: string;
        transaction_fee: string;
        block_timestamp: string;
    }>;
}

export interface AptosTransaction {
    version: string;
    hash: string;
    sender: string;
    sequence_number: string;
    max_gas_amount: string;
    gas_unit_price: string;
    gas_used: string;
    success: boolean;
    vm_status: string;
    timestamp: string;
    payload: {
        function: string;
        type_arguments: string[];
        arguments: string[];
        type: string;
    };
    events: Array<{
        type: string;
        data: any;
    }>;
}

interface Network {
    id: string;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    type: "ethereum" | "aptos";
    apiUrl?: string;
    pageSize?: number;
}

const networks: Network[] = [
    {
        id: "sepolia",
        name: "Sepolia",
        rpcUrl: "https://site1.moralis-nodes.com/sepolia/9efa625d2a0d4ec2b8f138ecce8da119",
        explorerUrl: "https://sepolia.etherscan.io/tx/",
        type: "ethereum"
    },
    {
        id: "goerli",
        name: "Goerli",
        rpcUrl: "https://site1.moralis-nodes.com/goerli/9efa625d2a0d4ec2b8f138ecce8da119",
        explorerUrl: "https://goerli.etherscan.io/tx/",
        type: "ethereum"
    },
    {
        id: "holesky",
        name: "Holesky",
        rpcUrl: "https://site1.moralis-nodes.com/holesky/9efa625d2a0d4ec2b8f138ecce8da119",
        explorerUrl: "https://holesky.etherscan.io/tx/",
        type: "ethereum"
    },
    {
        id: "aptos",
        name: "Aptos",
        apiUrl: "https://api.testnet.aptoslabs.com/v1/accounts/",
        explorerUrl: "https://explorer.aptoslabs.com/txn/",
        rpcUrl: "", // Not needed for Aptos
        type: "aptos",
        pageSize: 10
    }
];

const Transactions = () => {
    const [selectedWallet, setSelectedWallet] = useState<string>("");
    const [serverWallet, setServerWallet] = useState<string>("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [selectedNetwork, setSelectedNetwork] = useState<string>("sepolia");
    const [hasMoreTransactions, setHasMoreTransactions] = useState<boolean>(true);
    const [lastVersion, setLastVersion] = useState<string | undefined>(undefined);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const { toast } = useToast();
    const { account } = useWallet();

    useEffect(() => {
        const fetchServerWalletData = async () => {
            try {
                if (user?.email?.address) {
                    const wallet = await fetchWallet(user.email.address);
                    setServerWallet(wallet.wallet.address);
                }
            } catch (error) {
                console.error("Error fetching server wallet:", error);
            }
        };

        fetchServerWalletData();
    }, [user]);

    // Reset transactions when network or wallet changes
    useEffect(() => {
        setTransactions([]);
        setLastVersion(undefined);
        setHasMoreTransactions(true);
        setTransactionCount(0);
    }, [selectedNetwork, selectedWallet]);

    const getCurrentNetwork = (): Network => {
        return networks.find(network => network.id === selectedNetwork) || networks[0];
    };

    const fetchEthereumTransactions = async (wallet: string, network: Network) => {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);

        const response: ApiResponse = await provider.send("eth_getTransactions", [
            { address: wallet }
        ]);

        return response.result.map((tx) => ({
            hash: tx.hash,
            nonce: tx.nonce,
            from: tx.from_address,
            to: tx.to_address,
            value: ethers.formatEther(tx.value),
            gasPrice: ethers.formatUnits(tx.gas_price, "gwei"),
            gasUsed: tx.receipt_gas_used,
            fee: tx.transaction_fee,
            timestamp: new Date(tx.block_timestamp).toLocaleString(),
            type: "ethereum"
        }));
    };

    const fetchAptosTransactions = async (wallet: string, network: Network, start?: string, limit: number = 25) => {
        // Build the URL with query parameters
        let url = `${network.apiUrl}${wallet}/transactions`;
        
        // Add query parameters if provided
        const params = new URLSearchParams();
        if (start !== undefined) {
            params.append('start', start);
        }
        params.append('limit', limit.toString());
        
        // Append query parameters to URL if any exist
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        console.log("Fetching Aptos transactions from:", url);
        const response = await axios.get<AptosTransaction[]>(url);
        console.log("Aptos transactions:", response.data);
        
        // Get the last transaction version for pagination
        if (response.data.length > 0) {
            const lastTx = response.data[response.data.length - 1];
            // For the next page, we need the sequence number after the last one
            const nextVersionNum = parseInt(lastTx.sequence_number) + 1;
            setLastVersion(nextVersionNum.toString());
        }
        
        // Check if there are more transactions to load
        setHasMoreTransactions(response.data.length === limit);
        
        return response.data.map((tx) => {
            // Extract function name from full path
            const functionParts = tx.payload.function.split("::");
            const functionName = functionParts.length >= 3 ? `${functionParts[1]}::${functionParts[2]}` : tx.payload.function;
            
            // Calculate value from events for transfer transactions
            let value = "0";
            if (tx.payload.function.includes("transfer_coins") && tx.events) {
                const withdrawEvent = tx.events.find(e => e.type.includes("WithdrawEvent"));
                if (withdrawEvent && withdrawEvent.data && withdrawEvent.data.amount) {
                    // Convert Octas to APT (8 decimals)
                    const amount = parseInt(withdrawEvent.data.amount);
                    value = (amount / 100000000).toString();
                }
            }
            
            // Calculate recipient address for transfer transactions
            let toAddress = "";
            if (tx.payload.arguments && tx.payload.arguments.length > 0 && tx.payload.function.includes("transfer")) {
                toAddress = tx.payload.arguments[0];
            }
            
            return {
                hash: tx.hash,
                nonce: tx.sequence_number,
                from: tx.sender,
                to: toAddress,
                value: value,
                gasPrice: tx.gas_unit_price,
                gasUsed: tx.gas_used,
                fee: ((parseInt(tx.gas_used) * parseInt(tx.gas_unit_price)) / 100000000).toString(),
                timestamp: new Date(parseInt(tx.timestamp) / 1000).toLocaleString(),
                type: "aptos",
                function: functionName
            };
        });
    };

    const fetchTransactions = async (loadMore: boolean = false) => {
        if (!selectedWallet) {
            toast({
                title: "No wallet selected",
                description: "Please select a wallet to view transactions.",
                variant: "destructive",
            });
            return;
        }

        if (loadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            // Reset pagination when fetching new transactions
            setLastVersion(undefined);
            setTransactions([]);
        }

        try {
            const network = getCurrentNetwork();
            let formattedTransactions: Transaction[] = [];
            const pageSize = network.pageSize || 25;
            
            if (network.type === "ethereum") {
                formattedTransactions = await fetchEthereumTransactions(selectedWallet, network);
                setHasMoreTransactions(false); // For Ethereum, assume we get all transactions at once
            } else if (network.type === "aptos") {
                const newTransactions = await fetchAptosTransactions(
                    selectedWallet, 
                    network,
                    loadMore ? lastVersion : undefined,
                    pageSize
                );
                
                // If loading more, append to existing transactions
                if (loadMore) {
                    formattedTransactions = [...transactions, ...newTransactions];
                } else {
                    formattedTransactions = newTransactions;
                }
            }

            setTransactions(formattedTransactions);
            setTransactionCount(formattedTransactions.length);
            
            if (!loadMore) {
                toast({
                    title: "Transactions fetched",
                    description: `Found ${formattedTransactions.length} transactions on ${network.name}`,
                });
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast({
                title: "Error",
                description: `Failed to fetch transactions from ${getCurrentNetwork().name}. Please try again.`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const truncateAddress = (address: string) => {
        if (!address) return "N/A";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const isOutgoing = (tx: Transaction) => {
        return tx.from.toLowerCase() === selectedWallet.toLowerCase();
    };

    const formatValue = (tx: Transaction) => {
        const value = parseFloat(tx.value);
        if (isNaN(value)) return "0";
        return value.toFixed(6);
    };

    const getCurrencySymbol = (network: Network) => {
        return network.type === "aptos" ? "APT" : "ETH";
    };

    const resetTransactions = () => {
        setTransactions([]);
        setLastVersion(undefined);
        setHasMoreTransactions(true);
        setTransactionCount(0);
        fetchTransactions(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-black mb-3 font-montserrat">Transaction History</h1>
                <p className="text-gray-600 font-montserrat text-lg">View and analyze your wallet activity across multiple networks</p>
            </div>

            <Card className="w-full shadow-lg border-2 border-black rounded-3xl overflow-hidden mb-8 bg-white">
                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full">
                            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-black font-montserrat">
                                    <SelectValue placeholder="Select a wallet to view transactions" />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-black rounded-xl">
                                    {serverWallet && (
                                        <SelectItem key={serverWallet} value={serverWallet} className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(serverWallet)}</span>
                                                <span className="text-gray-500 text-sm">Server Wallet</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                    {wallets.map((wallet) => (
                                        <SelectItem key={wallet.address} value={wallet.address} className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(wallet.address)}</span>
                                                <span className="text-gray-500 text-sm">({wallet.walletClientType})</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                    
                                    {account && (
                                        <SelectItem key={account.address.toString()} value={account.address.toString()} className="font-montserrat">
                                            <div className="flex items-center gap-2">
                                                <WalletIcon className="h-4 w-4" />
                                                <span>{truncateAddress(account.address.toString())}</span>
                                                <span className="text-gray-500 text-sm">(Aptos Wallet)</span>
                                            </div>
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="w-full sm:w-auto">
                            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-black font-montserrat">
                                    <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-black rounded-xl">
                                    {networks.map((network) => (
                                        <SelectItem key={network.id} value={network.id} className="font-montserrat">
                                            {network.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button
                            onClick={() => fetchTransactions(false)}
                            disabled={loading || !selectedWallet}
                            className="w-full sm:w-auto bg-black text-white hover:bg-black/90 font-montserrat rounded-full h-12 px-8 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Fetching...
                                </>
                            ) : (
                                "View Transactions"
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {transactions.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <BadgeInfo className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-600 font-montserrat">
                            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <Button 
                        onClick={resetTransactions}
                        variant="outline" 
                        className="border-2 border-black rounded-full h-10 px-4 font-montserrat"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            )}

            <ScrollArea className="rounded-3xl border-2 border-black bg-white">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-black mb-4" />
                        <p className="text-lg font-medium text-black font-montserrat">Fetching Transactions...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <WalletIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-xl font-bold text-black mb-2 font-montserrat">No Transactions Found</p>
                        <p className="text-gray-500 font-montserrat text-center max-w-md">
                            Select a wallet and network, then fetch transactions to view your transaction history
                        </p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="space-y-4">
                            {transactions.map((tx, index) => (
                                <div key={index} className="p-4 rounded-xl border-2 border-gray-200 hover:border-black transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-full ${isOutgoing(tx) ? 'bg-red-100' : 'bg-green-100'}`}>
                                                {isOutgoing(tx) ? (
                                                    <ArrowUpIcon className={`h-5 w-5 text-red-600`} />
                                                ) : (
                                                    <ArrowDownIcon className={`h-5 w-5 text-green-600`} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-montserrat font-medium text-lg">
                                                    {isOutgoing(tx) ? 'Sent' : 'Received'} {formatValue(tx)} {getCurrencySymbol(getCurrentNetwork())}
                                                    {tx.function && <span className="text-gray-500 text-sm ml-2">({tx.function})</span>}
                                                </p>
                                                <p className="text-gray-500 text-sm font-montserrat">{tx.timestamp}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`${getCurrentNetwork().explorerUrl}${tx.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-black hover:text-gray-600 transition-colors"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <p className="text-sm text-gray-500 font-montserrat mb-1">From</p>
                                            <p className="font-mono text-sm">{truncateAddress(tx.from)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-montserrat mb-1">To</p>
                                            <p className="font-mono text-sm">{truncateAddress(tx.to)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-montserrat mb-1">Gas Price</p>
                                            <p className="font-montserrat">
                                                {tx.type === "ethereum" 
                                                    ? `${parseFloat(tx.gasPrice).toFixed(2)} Gwei` 
                                                    : `${tx.gasPrice} Octas`
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-montserrat mb-1">Transaction Fee</p>
                                            <p className="font-montserrat">
                                                {parseFloat(tx.fee).toFixed(6)} {getCurrencySymbol(getCurrentNetwork())}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {hasMoreTransactions && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={() => fetchTransactions(true)}
                                    disabled={loadingMore}
                                    className="bg-white text-black border-2 border-black hover:bg-gray-100 font-montserrat rounded-full h-12 px-8"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading more...
                                        </>
                                    ) : (
                                        "Load More Transactions"
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default Transactions