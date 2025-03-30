import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AccountPosition, Market } from '../../lib/types';
import { createTransactionPayload, getAccountPosition } from '../../apiClient';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface TransactionFormProps {
    type: 'supply' | 'withdraw' | 'borrow' | 'repay';
    market: Market;
    walletAddress: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ type, market, walletAddress }) => {
    const [amount, setAmount] = useState<string>('0');
    const [position, setPosition] = useState<AccountPosition | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const wallet = useWallet();

    useEffect(() => {
        fetchPosition();
    }, [market.id, walletAddress, type]);

    const fetchPosition = async () => {
        try {
            setLoading(true);
            const positionData = await getAccountPosition(walletAddress, market.id);
            setPosition(positionData);
        } catch (error) {
            console.error('Error fetching position:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount greater than 0");
            return;
        }

        try {
            setSubmitting(true);
            const payload = await createTransactionPayload(
                type,
                market.coinAddress,
                market.id,
                parseFloat(amount)
            );

            const txResponse = (await wallet.signAndSubmitTransaction({
                sender: wallet.account?.address,
                data: payload.payload,
            })).hash;   

            console.log(txResponse);
            toast.success(`Your ${type} transaction has been processed successfully.`);
            setAmount('0');
            fetchPosition();
        } catch (error) {
            console.log("Error in transaction:", error);
            toast.error("There was an error processing your transaction. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getMaxAmount = () => {
        if (!position) return '0';

        switch (type) {
            case 'supply':
                return '1000';
            case 'withdraw':
                return position.withdrawable.toString();
            case 'borrow':
                return position.borrowable.toString();
            case 'repay':
                return position.liability.toString();
            default:
                return '0';
        }
    };

    const setMaxAmount = () => {
        setAmount(getMaxAmount());
    };

    const getTransactionTitle = () => {
        switch (type) {
            case 'supply':
                return 'Supply Assets';
            case 'withdraw':
                return 'Withdraw Assets';
            case 'borrow':
                return 'Borrow Assets';
            case 'repay':
                return 'Repay Loan';
            default:
                return 'Transaction';
        }
    };

    const getTransactionDescription = () => {
        switch (type) {
            case 'supply':
                return `Supply assets to earn ${(market.supplyApr * 100).toFixed(2)}% APR`;
            case 'withdraw':
                return 'Withdraw your supplied assets';
            case 'borrow':
                return `Borrow assets at ${(market.borrowApr * 100).toFixed(2)}% APR`;
            case 'repay':
                return 'Repay your borrowed assets';
            default:
                return '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{getTransactionTitle()}</CardTitle>
                <p className="text-sm text-muted-foreground">{getTransactionDescription()}</p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">Amount</label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.000001"
                                    min="0"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={setMaxAmount}
                                    className="whitespace-nowrap"
                                >
                                    Max
                                </Button>
                            </div>
                        </div>

                        {parseFloat(amount) > 0 && (
                            <div className="pt-2">
                                <label className="text-sm text-muted-foreground mb-1.5 block">Preview</label>
                                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span>{parseFloat(amount).toFixed(6)} {market.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Value</span>
                                        <span>${(parseFloat(amount) * market.price).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={submitting || loading || parseFloat(amount) <= 0}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            `${type.charAt(0).toUpperCase() + type.slice(1)} ${market.id}`
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default TransactionForm;