import { useEffect, useState } from 'react'
import { Market } from '../lib/types';
import { getMarkets } from '../apiClient';
import { toast } from 'sonner'
import MarketCard, { marketMap } from '../components/trading/MarketCard';
import AccountPosition from '../components/trading/AccountPosition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TransactionForm from '../components/trading/TransactionForm';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Toaster } from '../components/ui/sonner';

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

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto p-4 space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">Echelon Markets</h1>
                    <p className="text-muted-foreground">View and interact with available Echelon Markets</p>
                </div>

                {loading ? (
                    <div className="flex justify-center my-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <section>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {markets && markets.map((market) => (
                                    <MarketCard
                                        key={market.id}
                                        market={market}
                                        isSelected={selectedMarket?.id === market.id}
                                        onClick={() => setSelectedMarket(market)}
                                    />
                                ))}
                            </div>
                        </section>

                        {selectedMarket && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <h2 className="text-2xl font-semibold">Market: {marketMap[selectedMarket.id as keyof typeof marketMap] || 'Unknown Market'}</h2>
                                </div>

                                {connected ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <AccountPosition
                                            address={walletAddress}
                                            market={selectedMarket.id}
                                        />

                                        <div className="lg:col-span-2">
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
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertTitle>Connect your wallet</AlertTitle>
                                        <AlertDescription>
                                            Please connect your wallet to interact with this market.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </section>
                        )}
                    </>
                )}
            </main>
            <Toaster />
        </div>
    )
}

export default TradingPage