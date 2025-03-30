import { CreditCard, Wallet2 } from "lucide-react";

type WalletIconProps = {
    clientType: string;
};

const WalletIcon = ({ clientType }: WalletIconProps) => {
    switch (clientType.toLowerCase()) {
        case 'metamask':
            return (
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZaVpfhv3kgZA46GoqfVNIFhR6pXIdX4_Rg&s"
                    alt="MetaMask"
                    className="w-8 h-8"
                />
            );
        case 'coinbase_wallet':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="none"
                    viewBox="0 0 512 512"
                    id="coinbase"
                    className="w-8 h-8"
                >
                    {/* SVG content omitted for brevity */}
                </svg>
            );
        case 'privy':
            return <Wallet2 className="w-8 h-8 text-primary" />;
        default:
            return <CreditCard className="w-8 h-8 text-muted-foreground" />;
    }
};

export default WalletIcon;