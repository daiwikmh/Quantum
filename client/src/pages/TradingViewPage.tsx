import { useState } from "react";
import TradingViewWidget from "./TradingView";

// Define types for market data
interface MarketDataItem {
    symbol: string;
    price: string;
    change: string;
}

// Define types for trading pairs
interface TradingPair {
    symbol: string;
    name: string;
}

// Define types for timeframes
interface Timeframe {
    value: string;
    label: string;
}

// Define types for technical indicators
interface TechnicalIndicator {
    id: string;
    name: string;
}

// Mock data for market overview
const marketData: MarketDataItem[] = [
    { symbol: "BTCUSD", price: "62,845.32", change: "+2.4%" },
    { symbol: "ETHUSD", price: "3,421.68", change: "+1.2%" },
    { symbol: "SOLUSD", price: "152.76", change: "+4.8%" },
    { symbol: "AVAXUSD", price: "35.92", change: "-0.7%" },
    { symbol: "DOTUSD", price: "8.43", change: "+0.9%" },
];

// List of available trading pairs
const availablePairs: TradingPair[] = [
    { symbol: "BTCUSD", name: "Bitcoin" },
    { symbol: "ETHUSD", name: "Ethereum" },
    { symbol: "SOLUSD", name: "Solana" },
    { symbol: "AVAXUSD", name: "Avalanche" },
    { symbol: "DOTUSD", name: "Polkadot" },
    { symbol: "APTUSD", name: "Aptos" },
    { symbol: "ARBUSDT", name: "Arbitrum" },
    { symbol: "MATICUSD", name: "Polygon" },
];

// Available timeframes
const timeframes: Timeframe[] = [
    { value: "1", label: "1m" },
    { value: "5", label: "5m" },
    { value: "15", label: "15m" },
    { value: "30", label: "30m" },
    { value: "60", label: "1h" },
    { value: "240", label: "4h" },
    { value: "D", label: "1d" },
    { value: "W", label: "1w" },
    { value: "M", label: "1M" },
];

// Technical indicators
const technicalIndicators: TechnicalIndicator[] = [
    { id: "MASimple@tv-basicstudies", name: "Moving Average" },
    { id: "MACD@tv-basicstudies", name: "MACD" },
    { id: "RSI@tv-basicstudies", name: "RSI" },
    { id: "BB@tv-basicstudies", name: "Bollinger Bands" },
    { id: "StochasticRSI@tv-basicstudies", name: "Stochastic RSI" },
];

// Theme type
type Theme = "light" | "dark";

const TradingViewPage: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>("APTUSD");
    const [resolution, setResolution] = useState<string>("D");
    const [theme] = useState<Theme>("light");
    const [activeStudies, setActiveStudies] = useState<string[]>([]);
    const [showWatchlist, setShowWatchlist] = useState<boolean>(true);

    // Handle symbol change
    const handleSymbolChange = (symbol: string): void => {
        setSelectedSymbol(symbol);
    };

    // Handle timeframe change
    const handleResolutionChange = (newResolution: string): void => {
        setResolution(newResolution);
    };


    // Toggle indicator
    const toggleIndicator = (indicator: string): void => {
        if (activeStudies.includes(indicator)) {
            setActiveStudies(activeStudies.filter(study => study !== indicator));
        } else {
            setActiveStudies([...activeStudies, indicator]);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            {/* Header */}
    

            <div className="flex flex-col md:flex-row flex-1">
                {/* Side panel */}
                <aside className={`w-full md:w-64 ${theme === "dark" ? "bg-gray-800" : "bg-white"} p-4 space-y-4 md:h-screen overflow-y-auto`}>
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Symbol Search</h3>
                        <div className={`p-2 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-md`}>
                            <select
                                value={selectedSymbol}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSymbolChange(e.target.value)}
                                className={`w-full p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                            >
                                {availablePairs.map((pair) => (
                                    <option key={pair.symbol} value={pair.symbol}>
                                        {pair.name} ({pair.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Timeframe</h3>
                        <div className="flex flex-wrap gap-2">
                            {timeframes.map((tf) => (
                                <button
                                    key={tf.value}
                                    onClick={() => handleResolutionChange(tf.value)}
                                    className={`px-3 py-1 rounded-md text-sm ${resolution === tf.value
                                            ? "bg-blue-500 text-white"
                                            : theme === "dark"
                                                ? "bg-gray-700 hover:bg-gray-600"
                                                : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Indicators</h3>
                        <div className="space-y-2">
                            {technicalIndicators.map((indicator) => (
                                <div key={indicator.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={indicator.id}
                                        checked={activeStudies.includes(indicator.id)}
                                        onChange={() => toggleIndicator(indicator.id)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={indicator.id}>{indicator.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Watchlist</h3>
                            <button
                                onClick={() => setShowWatchlist(!showWatchlist)}
                                className="text-xs text-blue-500"
                            >
                                {showWatchlist ? "Hide" : "Show"}
                            </button>
                        </div>

                        {showWatchlist && (
                            <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-md overflow-hidden`}>
                                {marketData.map((item) => (
                                    <div
                                        key={item.symbol}
                                        onClick={() => handleSymbolChange(item.symbol)}
                                        className={`p-2 cursor-pointer border-b border-gray-200 flex justify-between ${selectedSymbol === item.symbol
                                                ? theme === "dark" ? "bg-gray-600" : "bg-blue-100"
                                                : ""
                                            } hover:bg-opacity-70`}
                                    >
                                        <span>{item.symbol}</span>
                                        <div className="text-right">
                                            <div>{item.price}</div>
                                            <div className={item.change.startsWith('+') ? "text-green-500" : "text-red-500"}>
                                                {item.change}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main chart area */}
                <main className="flex-1 p-4">
                    <div className="mb-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">{selectedSymbol} Chart</h1>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Share
                            </button>
                            <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg overflow-hidden shadow-lg" style={{ height: "70vh" }}>
                        <TradingViewWidget
                            symbol={selectedSymbol}
                            resolution={resolution}
                            theme={theme}
                            studies={activeStudies}
                            showDetails={true}
                            allowSymbolChange={false}
                        />
                    </div>

                    <div className={`mt-6 p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow`}>
                        <h2 className="text-xl font-semibold mb-3">Market Overview</h2>
                        <div className="overflow-x-auto">
                            <table className={`w-full ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                                <thead>
                                    <tr className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                                        <th className="py-2 px-4 text-left">Symbol</th>
                                        <th className="py-2 px-4 text-right">Price</th>
                                        <th className="py-2 px-4 text-right">24h Change</th>
                                        <th className="py-2 px-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketData.map((item) => (
                                        <tr key={item.symbol} className="border-b border-gray-200">
                                            <td className="py-3 px-4">{item.symbol}</td>
                                            <td className="py-3 px-4 text-right">${item.price}</td>
                                            <td className={`py-3 px-4 text-right ${item.change.startsWith('+') ? "text-green-500" : "text-red-500"
                                                }`}>
                                                {item.change}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleSymbolChange(item.symbol)}
                                                    className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TradingViewPage;