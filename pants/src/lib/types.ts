import { NetworkKey } from "./fetchWalletBalance";

export type WalletBalance = {
    address: string;
    clientType?: string;
    balance: number;
    network?: NetworkKey;
};

export interface Market {
    id: string;
    coinAddress: string;
    borrowApr: number;
    supplyApr: number;
    price: number;
}

export interface AccountPosition {
    supplied: number;
    borrowable: number;
    withdrawable: number;
    liability: number;
}

export interface ClaimableReward {
    claimableReward: number;
}

export interface TransactionPayload {
    payload: any;
}

