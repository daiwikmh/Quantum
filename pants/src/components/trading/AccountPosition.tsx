import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getAccountPosition } from '../../apiClient';
import { AccountPosition as AccountPositionType } from '../../lib/types';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

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
            <Card>
                <CardHeader>
                    <CardTitle>Your Position</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center my-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!position) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Your Position</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No position data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Your Position</CardTitle>
                    <Button variant="ghost" size="icon" onClick={fetchPosition}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Supplied</p>
                        <p className="text-xl font-bold text-blue-500">{formatAmount(position.supplied)}</p>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Withdrawable</p>
                        <p className="text-xl font-bold text-green-500">{formatAmount(position.withdrawable)}</p>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Borrowable</p>
                        <p className="text-xl font-bold text-purple-500">{formatAmount(position.borrowable)}</p>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Liability</p>
                        <p className="text-xl font-bold text-orange-500">{formatAmount(position.liability)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountPosition;