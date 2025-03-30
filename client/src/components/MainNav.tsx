import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { WalletIcon, Plus, Link as LinkIcon, PenSquare, SendIcon } from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "./ui/button"
import { useCreateWallet } from '@privy-io/react-auth';
import { createWalletClient, custom, Hex, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import WalletConnectButton from "./PetraConnect";

export function MainNav() {
    const { linkWallet } = usePrivy();
    const { wallets } = useWallets()
    const { createWallet } = useCreateWallet();

    const sign = async () => {
        const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        const provider = await wallet?.getEthereumProvider();
        const address = wallet?.address;
        const message = 'This is the message I am signing';
        const signature = await provider?.request({
            method: 'personal_sign',
            params: [message, address],
        });
        console.log(signature);
    }

    const transaction = async () => {
        const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
        await wallet?.switchChain(sepolia.id);

        const provider = await wallet?.getEthereumProvider();
        if (!provider) {
            console.error('Ethereum provider is undefined');
            return;
        }
        const walletClient = createWalletClient({
            account: wallet?.address as Hex,
            chain: sepolia,
            transport: custom(provider),
        });
        const [address] = await walletClient.getAddresses()

        const hash = await walletClient.sendTransaction({
            account: address,
            to: '0x1029BBd9B780f449EBD6C74A615Fe0c04B61679c',
            value: parseEther('0.0001')
        })

        console.log(hash);
    }



    return (
        <nav className="flex justify-between w-full px-2">
            <div className="flex items-center space-x-6">
                {/* Navigation items would go here */}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-full border-2 border-black hover:bg-black hover:text-white transition-colors font-montserrat">
                        <WalletIcon className="h-4 w-4" />
                        <span>WALLETS</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-fit p-4 border-2 border-black rounded-3xl">
                    <div className="mb-1">
                        <h3 className="font-bold text-black font-montserrat mb-2">CONNECTED WALLETS</h3>
                        {wallets.length > 0 ? (
                            <div className="space-y-2">
                                {wallets.map((wallet, index) => (
                                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-xl">
                                        <WalletIcon className="h-4 w-4 text-black" />
                                        <div>
                                            <p className="text-sm font-medium font-montserrat capitalize">
                                                {wallet.walletClientType} Wallet
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600 font-montserrat">No wallets connected</p>
                        )}
                    </div>

                    <DropdownMenuItem>
                            <WalletConnectButton />
                    </DropdownMenuItem>

                    <div className="grid grid-cols-1 gap-2">
                        <DropdownMenuItem onClick={linkWallet} className="p-0 focus:bg-transparent">
                            <Button variant="outline" className="w-full rounded-full border-2 border-black hover:bg-black hover:text-white font-montserrat">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Link Wallet
                            </Button>
                        </DropdownMenuItem>
                        
                        
                        <DropdownMenuItem onClick={createWallet} className="p-0 focus:bg-transparent">
                            <Button variant="outline" className="w-full rounded-full border-2 border-black hover:bg-black hover:text-white font-montserrat">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Wallet
                            </Button>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={sign} className="p-0 focus:bg-transparent">
                            <Button className="w-full rounded-full bg-black text-white hover:bg-black/90 font-montserrat">
                                <PenSquare className="h-4 w-4 mr-2" />
                                Sign Message
                            </Button>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={transaction} className="p-0 focus:bg-transparent">
                            <Button className="w-full rounded-full bg-black text-white hover:bg-black/90 font-montserrat">
                                <SendIcon className="h-4 w-4 mr-2" />
                                Send Transaction
                            </Button>
                        </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}

