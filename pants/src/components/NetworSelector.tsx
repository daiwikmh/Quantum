import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { NetworkKey, SUPPORTED_NETWORKS } from '../lib/fetchWalletBalance'

interface NetworkSelectorProps {
    selectedNetwork: NetworkKey;
    setSelectedNetwork: (network: NetworkKey) => void;
}

export const NetworkSelector = ({ selectedNetwork, setSelectedNetwork }: NetworkSelectorProps) => {
    return (
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border-2 border-gray-200 shadow-sm">
            <Globe className="w-5 h-5 text-gray-700" />
            <Select
                value={selectedNetwork}
                onValueChange={(value: NetworkKey) => setSelectedNetwork(value)}
            >
                <SelectTrigger className="w-[200px] border-0 bg-transparent p-0 h-auto font-medium text-gray-900 hover:bg-transparent focus:ring-0">
                    <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent className="border-2 border-gray-200 rounded-xl shadow-xl">
                    {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                        <SelectItem 
                            key={key} 
                            value={key}
                            className="font-medium"
                        >
                            {network.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}