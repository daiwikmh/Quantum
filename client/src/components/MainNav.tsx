import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { WalletIcon, Plus, Link as LinkIcon, LogOut } from "lucide-react"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { Button } from "./ui/button"
import { useCreateWallet } from '@privy-io/react-auth';
import WalletConnectButton from "./PetraConnect";

export function MainNav() {
    const { linkWallet, logout } = usePrivy();
    const { wallets } = useWallets()
    const { createWallet } = useCreateWallet();

    
    return (
        <nav className="flex justify-between w-full px-2 z-50">
            <div className="flex items-center space-x-6">
                {/* Navigation items would go here */}
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2.5 px-5 py-2.5 rounded-xl border-2 border-black hover:bg-black hover:text-white transition-all font-montserrat group">
                        <WalletIcon className="h-4 w-4" />
                        <span className="font-medium">WALLETS</span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[380px] p-5 bg-white border-2 border-black rounded-2xl shadow-xl" align="end" sideOffset={5}>
                    <div className="mb-5">
                        <h3 className="font-bold text-black font-montserrat mb-3">CONNECTED WALLETS</h3>
                        {wallets.length > 0 ? (
                            <div className="space-y-2.5">
                                {wallets.map((wallet, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <WalletIcon className="h-4 w-4 text-gray-700" />
                                        <div>
                                            <p className="text-sm font-semibold font-montserrat capitalize text-gray-900">
                                                {wallet.walletClientType} Wallet
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">
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

                    <DropdownMenuItem className="mb-4 focus:bg-transparent">
                        <WalletConnectButton />
                    </DropdownMenuItem>

                    <div className="grid grid-cols-1 gap-3">
                        <DropdownMenuItem onClick={linkWallet} className="p-0 focus:bg-transparent">
                            <Button variant="outline" className="w-full rounded-xl border-2 border-black hover:bg-black hover:text-white font-montserrat h-11">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Link Wallet
                            </Button>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={createWallet} className="p-0 focus:bg-transparent">
                            <Button variant="outline" className="w-full rounded-xl border-2 border-black hover:bg-black hover:text-white font-montserrat h-11">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Wallet
                            </Button>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={logout} className="p-0 focus:bg-transparent">
                            <Button variant="outline" className="w-full rounded-xl border-2 border-black bg-black text-white hover:bg-white hover:text-black font-montserrat h-11">
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    )
}