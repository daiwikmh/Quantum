// provider.js
let account = null;
let accountResolve = null;
let wallet = null;
let walletResolve = null;

// Create promises that resolve when the provider and address are set
const accountPromise = new Promise((resolve) => {
  accountResolve = resolve;
});

const walletPromise = new Promise((resolve) => {
  walletResolve = resolve;
});

export const setAccount = (account) => {
  if (!account) {
    throw new Error("Invalid provider.");
  }
  account = account;
  accountResolve(account); // Resolve the promise when the provider is set
};

export const getAccount = async () => {
  if (account) {
    return account; // Return the provider if already set
  }
  // Wait for the provider to be set
  return accountPromise;
};

export const setWallet = (wallet) => {
  if (!wallet) {
    throw new Error("Invalid address.");
  }
  wallet = wallet;
  walletResolveResolve(wallet); // Resolve the promise when the address is set
};

export const getWallet = async () => {
  if (wallet) {
    return wallet; // Return the address if already set
  }
  // Wait for the address to be set
  return walletPromise;
};
