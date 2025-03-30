const API_URL = 'https://plutus-move.onrender.com';

export const addUserToDatabase = async (user: any) => {
    try {
        const response = await fetch(`${API_URL}/api/add-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
};

export const fetchWallet = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/api/fetch-wallet/${email}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error adding user:', error);
    }
}


export const sendServerTransaction = async (email: string, to: string, valueInEth: string) => {
    try {
        const response = await fetch(`${API_URL}/api/send-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, to, valueInEth }),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log('Error sending transaction:', error);
    }
}


export const getSavedWallets = async (email: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error fetching saved wallets:", error);
    }
}


export const saveWallet = async (email: string, address: string, nickname: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, address, nickname }),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error saving wallet:", error);
    }
}

export const deleteWallet = async (email: string, address: string) => {
    try {
        const response = await fetch(`${API_URL}/api/saved-wallets`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, address }),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error deleting wallet:", error);
    }
}

export const getMarkets = async () => {
    try {
        const response = await fetch(`${API_URL}/api/markets`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log("Error fetching markets:", error);
    }
}

export const getAccountPosition = async (address: string, market: string) => {
    try {
        const response = await fetch(`${API_URL}/api/account/${address}/position?market=${market}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getAccountPosition:', error);
        throw error;
    }
};

export const createTransactionPayload = async (
    type: 'supply' | 'withdraw' | 'borrow' | 'repay',
    coinAddress: string,
    market: string,
    amount: number
) => {
    try {
        const response = await fetch(`${API_URL}/api/transaction/payload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, coinAddress, market, amount }),
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in createTransactionPayload:', error);

    }
}

export const getClaimedRewards = async (
    account: string,
    coinName: string,
    market: string,
    mode: 'supply' | 'borrow'
) => {
    try {
        const response = await fetch(`${API_URL}/api/rewards/${account}?coinName=${coinName}&market=${market}&mode=${mode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch account position: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getClaimedRewards:', error);
    }
}