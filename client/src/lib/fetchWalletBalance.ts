import { ethers } from "ethers";


// Define supported networks with their Infura endpoints
export const SUPPORTED_NETWORKS = {
    ethereum: {
        name: "Ethereum Mainnet",
        infuraNetwork: "mainnet",
        symbol: "ETH"
    },
    sepolia: {
        name: "Sepolia Testnet", 
        infuraNetwork: "sepolia",
        symbol: "ETH"
    },
    holesky: {
        name: "Holesky Testnet",
        infuraNetwork: "holesky",
        symbol: "ETH"
    },
    goerli: {
        name: "Goerli Testnet",
        infuraNetwork: "goerli", 
        symbol: "ETH"
    },
    polygon: {
        name: "Polygon Mainnet",
        infuraNetwork: "polygon-mainnet",
        symbol: "MATIC"
    },
    mumbai: {
        name: "Mumbai Testnet",
        infuraNetwork: "polygon-mumbai",
        symbol: "MATIC"
    },
    arbitrum: {
        name: "Arbitrum One",
        infuraNetwork: "arbitrum-mainnet",
        symbol: "ETH"
    },
    optimism: {
        name: "Optimism Mainnet",
        infuraNetwork: "optimism-mainnet", 
        symbol: "ETH"
    }
};

const INFURA_API_KEY = "00d918690e7246579fb6feabe829e5c8"; // Replace with your Infura API Key

export type NetworkKey = keyof typeof SUPPORTED_NETWORKS;

export interface WalletBalanceResult {
    balance: string;
    networkName: string;
    networkSymbol: string;
}

export async function getWalletBalance(
    address: string, 
    network: NetworkKey = 'sepolia'
): Promise<WalletBalanceResult | null> {
    try {
        // Validate address
        if (!ethers.isAddress(address)) {
            throw new Error("Invalid wallet address");
        }

        // Get network configuration
        const networkConfig = SUPPORTED_NETWORKS[network];
        if (!networkConfig) {
            throw new Error(`Unsupported network: ${network}`);
        }

        // Connect to Ethereum provider via Infura
        const provider = new ethers.JsonRpcProvider(
            `https://${networkConfig.infuraNetwork}.infura.io/v3/${INFURA_API_KEY}`
        );

        // Fetch the balance
        const balance = await provider.getBalance(address);

        // Convert from wei to network's base unit
        const balanceInBaseUnit = ethers.formatEther(balance);

        console.log(`Balance of ${address} on ${networkConfig.name}: ${balanceInBaseUnit} ${networkConfig.symbol}`);
        
        return {
            balance: balanceInBaseUnit,
            networkName: networkConfig.name,
            networkSymbol: networkConfig.symbol
        };
    } catch (error: any) {
        console.error("Error fetching balance:", error.message);
        return null;
    }
}