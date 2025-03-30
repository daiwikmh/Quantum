import { ethers } from "ethers";

/**
 * Fetch all transaction logs for a specific wallet address.
 * @param walletAddress - The address of the wallet.
 * @param providerUrl - The Ethereum node provider URL (e.g., Infura, Alchemy).
 * @returns An array of transaction logs.
 */
async function fetchWalletTransactionLogs(walletAddress: string, providerUrl: string): Promise<Array<{ transactionHash: string; blockNumber: number; data: string; topics: string[] }>> {
    if (!ethers.isAddress(walletAddress)) {
        throw new Error("Invalid wallet address.");
    }

    // Connect to the Ethereum network
    const provider = new ethers.JsonRpcProvider(providerUrl);

    try {
        const currentBlock: number = await provider.getBlockNumber();

        // Define filter for logs
        const filter: ethers.Filter = {
            address: walletAddress,
            fromBlock: 0,
            toBlock: currentBlock,
        };

        // Fetch logs
        const logs = await provider.getLogs(filter);

        // Decode logs if needed (requires ABI for specific contracts)
        return logs.map(log => ({
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            data: log.data,
            topics: log.topics as string[]
        }));
    } catch (error) {
        console.error("Error fetching transaction logs:", error);
        throw error;
    }
}

// Example usage
(async () => {
    const walletAddress = "0x9e1747D602cBF1b1700B56678F4d8395a9755235";
    const providerUrl = "https://mainnet.infura.io/v3/00d918690e7246579fb6feabe829e5c8";

    try {
        const logs = await fetchWalletTransactionLogs(walletAddress, providerUrl);
        console.log("Transaction Logs:", logs);
    } catch (error) {
        console.error("Error:", error);
    }
})();