import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAccountPosition } from '../../apiClient';
import { AccountPosition as AccountPositionType } from '../../lib/types';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from '../ui/button';

interface AccountPositionProps {
    address: string;
    market: string;
}

const AccountPosition: React.FC<AccountPositionProps> = ({ address, market }) => {
    const [position, setPosition] = useState<AccountPositionType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { connected, account } = useWallet();

    useEffect(() => {
        if (connected && account?.address) {
            fetchPosition();
        }
    }, [address, market]);

    const fetchPosition = async () => {
        try {
            setLoading(true);
            const positionData = await getAccountPosition(address, market);
            setPosition(positionData);
        } catch (error) {
            toast.error("Failed to fetch your position data.");
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString(undefined, {
            maximumFractionDigits: 6,
            minimumFractionDigits: 2
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center my-6">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!position) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p>No position data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={fetchPosition} className="absolute top-4 right-2">
                <RefreshCw className="h-4 w-4" />
            </Button>

            <div className="space-y-3 mt-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Supplied</p>
                    </div>
                    <p className="text-xl font-bold text-blue-500">{formatAmount(position.supplied)}</p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                        <Wallet className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Withdrawable</p>
                    </div>
                    <p className="text-xl font-bold text-green-500">{formatAmount(position.withdrawable)}</p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        <p className="text-sm text-muted-foreground">Borrowable</p>
                    </div>
                    <p className="text-xl font-bold text-purple-500">{formatAmount(position.borrowable)}</p>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                        <p className="text-sm text-muted-foreground">Liability</p>
                    </div>
                    <p className="text-xl font-bold text-orange-500">{formatAmount(position.liability)}</p>
                </div>
            </div>
        </div>
    );
};

export default AccountPosition;