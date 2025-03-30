import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export const getWalletName = (clientType : string) => {
  switch (clientType.toLowerCase()) {
      case 'metamask':
          return "MetaMask";
      case 'coinbase_wallet':
          return "Coinbase";
      case 'privy':
          return "Privy Embedded";
      case 'phantom':
          return "Phantom";
      default:
          return "Unknown Wallet";
  }
};


export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default truncateAddress;
