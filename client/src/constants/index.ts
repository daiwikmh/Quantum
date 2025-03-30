import {
    mainnet,
    sepolia,
    goerli,
    polygonMumbai,
    polygon,
    arbitrum,
    optimism,
    holesky
} from 'viem/chains';

export const CHAIN_MAP = {
    ethereum: mainnet,
    sepolia: sepolia,
    goerli: goerli,
    mumbai: polygonMumbai,
    polygon: polygon,
    arbitrum: arbitrum,
    optimism: optimism,
    holesky: holesky
};