import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { NetworkKey, SUPPORTED_NETWORKS } from '../lib/fetchWalletBalance'

interface NetworkSelectorProps {
    selectedNetwork: NetworkKey;
    setSelectedNetwork: (network: NetworkKey) => void;
}

export const NetworkSelector = ({ selectedNetwork, setSelectedNetwork }: NetworkSelectorProps) => {
    return (
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <Select
                value={selectedNetwork}
                onValueChange={(value: NetworkKey) => setSelectedNetwork(value)}
            >
                <SelectTrigger className="w-[200px] border-0 bg-transparent p-0 h-auto font-medium text-gray-900 hover:text-indigo-600 focus:ring-0 transition-colors">
                    <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                        <SelectItem 
                            key={key} 
                            value={key}
                            className="font-medium hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-300"
                        >
                            {network.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}