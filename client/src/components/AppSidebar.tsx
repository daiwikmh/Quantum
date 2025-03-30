import {
    LayoutDashboard,
    Receipt,
    MessageSquareMore,
    BookmarkCheck,
    LineChart,
    ArrowLeftRight,
    UserCircle,
    Wallet,
    LogOut,
    Link2
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "./ui/sidebar"
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { useSidebar } from "./ui/sidebar";


const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/profile" },
    { icon: Wallet, label: "Wallet Watcher", href: "/watcher" },
    { icon: Receipt, label: "Transactions", href: "/transactions" },
    { icon: MessageSquareMore, label: "Chat Bot", href: "/chat-bot" },
    { icon: BookmarkCheck, label: "Saved Wallets", href: "/saved-wallets" },
    { icon: LineChart, label: "Trading View", href: "/trading-view" },
    { icon: ArrowLeftRight, label: "Trading", href: "/trading" },
];
export function AppSidebar() {
    const { state } = useSidebar();
    const { logout, user, linkWallet } = usePrivy();
    const { wallets } = useWallets()

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-black z-50 fixed h-screen bg-white"
        >
            <SidebarHeader className="border-b border-black px-2 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <Link to="/" className="flex items-center gap-2">
                                <div className={`flex ${state === "collapsed" ? "h-8 w-8" : "h-10 w-10"} items-center justify-center rounded-full bg-black group-hover:bg-gray-900 transition-all`}>
                                    <Wallet className={`${state === "collapsed" ? "h-4 w-4" : "h-5 w-5"} text-white`} />
                                </div>
                                <span className="font-bold text-xl font-montserrat">AURORA</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="py-6">
                <SidebarMenu>
                    {sidebarItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton asChild tooltip={item.label}>
                                <Link to={item.href}>
                                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <item.icon className="h-5 w-5 text-black group-hover:text-black" />
                                        <span className="font-montserrat font-medium">{item.label.toUpperCase()}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <div className="mt-auto pb-4 border-t border-gray-200 pt-4 mx-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton asChild tooltip="Profile">
                                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <UserCircle className="h-5 w-5 text-black" />
                                            <span className="font-montserrat font-medium">PROFILE</span>
                                        </div>
                                    </button>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-72 p-4 border-2 border-black rounded-3xl">
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h3 className="font-bold text-black font-montserrat mb-1">USER</h3>
                                    <p className="text-sm text-gray-700 font-montserrat">{user?.email?.address}</p>
                                </div>

                                <div className="mb-4 pb-3 border-b border-gray-200">
                                    <h3 className="font-bold text-black font-montserrat mb-2">CONNECTED WALLETS</h3>
                                    {wallets.length > 0 ? (
                                        <div className="space-y-2">
                                            {wallets.map((wallet, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-xl">
                                                    <Wallet className="h-4 w-4 text-black" />
                                                    <div>
                                                        <p className="text-sm font-medium font-montserrat capitalize">
                                                            {wallet.walletClientType} Wallet
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">
                                                            {truncateAddress(wallet.address)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 font-montserrat">No wallets connected</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <DropdownMenuItem onClick={linkWallet} className="p-0 focus:bg-transparent">
                                        <Button variant="outline" className="w-full rounded-full border-2 border-black hover:bg-black hover:text-white font-montserrat">
                                            <Link2 className="h-4 w-4 mr-2" />
                                            Link Wallet
                                        </Button>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={logout} className="p-0 focus:bg-transparent">
                                        <Button variant="outline" className="w-full rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-montserrat">
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
            <SidebarRail />
        </Sidebar>
    )
}

