import { useEffect, useState } from 'react';
import { Market } from '../lib/types';
import { getMarkets } from '../apiClient';
import { toast } from 'sonner';
import MarketCard from '../components/trading/MarketCard';
import AccountPosition from '../components/trading/AccountPosition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TransactionForm from '../components/trading/TransactionForm';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Toaster } from '../components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { marketMap } from '../components/trading/MarketCard';
import { LineChart, Wallet, TrendingUp } from 'lucide-react';

const TradingPage = () => {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const {account, connected} = useWallet();

    const fetchMarkets = async () => {
        try {
            setLoading(true);
            const marketsData = await getMarkets();
            setMarkets(marketsData);
            if (marketsData.length > 0) {
                setSelectedMarket(marketsData[0]);
            }
        } catch (error) {
            toast.error("Failed to fetch markets. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (connected) {
            setWalletAddress((account?.address.toString()) || '');
        }
        fetchMarkets();
    }, [connected, account]);

    const handleMarketChange = (marketId: string) => {
        const market = markets.find(m => m.id === marketId);
        if (market) setSelectedMarket(market);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
            <main className="container mx-auto p-4 space-y-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <LineChart className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight">Echelon Markets</h1>
                    </div>
                    <p className="text-muted-foreground">Advanced DeFi Trading Platform</p>
                </div>

                {loading ? (
                    <div className="flex justify-center my-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1">
                                <div className="sticky top-4 space-y-6">
                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Wallet className="h-5 w-5 text-primary" />
                                            <h2 className="text-xl font-semibold">Your Portfolio</h2>
                                        </div>
                                        <Select
                                            value={selectedMarket?.id}
                                            onValueChange={handleMarketChange}
                                        >
                                            <SelectTrigger className="w-full mb-4">
                                                <SelectValue placeholder="Select a market" />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white'>
                                                {markets.map((market) => (
                                                    <SelectItem key={market.id} value={market.id} >
                                                        {marketMap[market.id as keyof typeof marketMap] || 'Unknown Market'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {connected ? (
                                            <AccountPosition
                                                address={walletAddress}
                                                market={selectedMarket?.id || ''}
                                            />
                                        ) : (
                                            <Alert>
                                                <AlertTitle>Connect your wallet</AlertTitle>
                                                <AlertDescription>
                                                    Please connect your wallet to view your portfolio.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                {selectedMarket && connected ? (
                                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                                        <div className="flex items-center gap-2 mb-6">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            <h2 className="text-xl font-semibold">Trading Actions</h2>
                                        </div>
                                        <Tabs defaultValue="supply" className="w-full">
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="supply">Supply</TabsTrigger>
                                                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                                                <TabsTrigger value="borrow">Borrow</TabsTrigger>
                                                <TabsTrigger value="repay">Repay</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="supply">
                                                <TransactionForm
                                                    type="supply"
                                                    market={selectedMarket}
                                                    walletAddress={walletAddress}
                                                />
                                            </TabsContent>

                                            <TabsContent value="withdraw">
                                                <TransactionForm
                                                    type="withdraw"
                                                    market={selectedMarket}
                                                    walletAddress={walletAddress}
                                                />
                                            </TabsContent>

                                            <TabsContent value="borrow">
                                                <TransactionForm
                                                    type="borrow"
                                                    market={selectedMarket}
                                                    walletAddress={walletAddress}
                                                />
                                            </TabsContent>

                                            <TabsContent value="repay">
                                                <TransactionForm
                                                    type="repay"
                                                    market={selectedMarket}
                                                    walletAddress={walletAddress}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertTitle>Connect your wallet</AlertTitle>
                                        <AlertDescription>
                                            Please connect your wallet to interact with markets.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <LineChart className="h-5 w-5 text-primary" />
                                        <h2 className="text-xl font-semibold">Available Markets</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {markets.map((market) => (
                                            <MarketCard
                                                key={market.id}
                                                market={market}
                                                isSelected={selectedMarket?.id === market.id}
                                                onClick={() => setSelectedMarket(market)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <Toaster />
        </div>
    );
};

export default TradingPage;