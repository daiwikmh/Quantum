import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Market } from '../../lib/types';
import { cn } from '../../lib/utils';


interface MarketCardProps {
    market: Market;
    isSelected: boolean;
    onClick: () => void;
}

const formatPercent = (value: number) => {
    return (value * 100).toFixed(2) + '%';
};

const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    }).format(value);
};

export const marketMap = {
    '0xc6ece185ecc6e552b12611c9b754e1b5e1daf5aa1739df5a42c558f185cc06f2': 'APT/USDC',
    '0x3319a1fce1ed85d85d78ea0e711b4a11730a9d644dd03661fa7f687ff686ae50': 'APT/USDT',
    '0xc224bef06f5728dffa4b6287c8f6a927c695d4fc938e502dc1857e2b04b5f661': 'APT/DAI',
    '0xbf5eec2964acbd80d4c3f8a578f87af3a7c8e6de9fcfcce256c9d01e45293d6b': 'APT/WETH',
    '0x49011402043cac2d714c59b97e5b14e627f576629461967b4be26a8ba11e50e': 'WBTC',
    '0x9fbe6571bdc0a1da7abe31e410f09f51f6e0009aa8b1d6747097f459c464a317': 'WBNB',
    '0xec98f8c3c848f01186eb6f6df6fadf6ce9dd6674dd3806f7b49688a0107bbcde': 'APT/USDY',
    '0x7ddb4d65b24dfcaf3a2a2e6e64b71349df948c5f953d2017bb996ab316e8d105': 'APT/MOD',
    '0x35fb00570cd95b0f4134c7c54e7db677c76fd1580b263851759e3173c8f06c85': 'APT/EUSDY',
    '0xd8eeb8987449d95e4d934c317022ab1f442c9e494c187846894e14c8e04fe5dd': 'APT/ABTC'

}

const MarketCard: React.FC<MarketCardProps> = ({ market, isSelected, onClick }) => {
    const id = market.id
    return (
        <Card
            className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                isSelected && "border-primary"
            )}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                    <span>{marketMap[id as keyof typeof marketMap] || 'Unknown Market'}</span>
                    <span className="text-sm text-muted-foreground">{formatPrice(market.price)}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Supply APR</p>
                        <p className="text-xl font-bold text-green-500">{formatPercent(market.supplyApr)}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Borrow APR</p>
                        <p className="text-xl font-bold text-orange-500">{formatPercent(market.borrowApr)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MarketCard;