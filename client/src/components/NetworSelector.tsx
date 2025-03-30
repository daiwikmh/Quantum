import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { NetworkKey, SUPPORTED_NETWORKS } from '../lib/fetchWalletBalance'

interface NetworkSelectorProps {
    selectedNetwork: NetworkKey;
    setSelectedNetwork: (network: NetworkKey) => void;
}

export const NetworkSelector = ({ selectedNetwork, setSelectedNetwork }: NetworkSelectorProps) => {
    return (
        <div className="mb-4 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <Select
                value={selectedNetwork}
                onValueChange={(value: NetworkKey) => setSelectedNetwork(value)}
            >
                <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
                        <SelectItem key={key} value={key}>
                            {network.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
