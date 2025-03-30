import {
    LayoutDashboard,
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
    { icon: ArrowLeftRight, label: "Agent", href: "/agent" },
    { icon: ArrowLeftRight, label: "Trading", href: "/trading" },
    { icon: LineChart, label: "Trading View", href: "/trading-view" },
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
            className="border-r border-gray-200 z-50 fixed h-screen bg-white/80 backdrop-blur-sm"
        >
            <SidebarHeader className="border-b border-gray-200 px-3 py-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className={`flex ${state === "collapsed" ? "h-9 w-9" : "h-10 w-10"} items-center justify-center rounded-xl bg-black shadow-lg shadow-black/10 group-hover:scale-105 transition-all`}>
                                    <Wallet className={`${state === "collapsed" ? "h-4 w-4" : "h-5 w-5"} text-white`} />
                                </div>
                                <span className="font-bold text-xl text-gray-900 font-montserrat tracking-tight">Quantum</span>
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
                                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100/80 transition-all group">
                                        <item.icon className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                                        <span className="font-montserrat font-medium text-gray-700 group-hover:text-black transition-colors">{item.label.toUpperCase()}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <div className="mt-auto pb-6 border-t border-gray-200 pt-6 mx-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton asChild tooltip="Profile">
                                    <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-100/80 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <UserCircle className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors" />
                                            <span className="font-montserrat font-medium text-gray-700 group-hover:text-black transition-colors">PROFILE</span>
                                        </div>
                                    </button>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80 p-5 border-2 border-black rounded-2xl shadow-xl" align="end">
                                <div className="mb-5 pb-4 border-b border-gray-200">
                                    <h3 className="font-bold text-black font-montserrat mb-2">USER</h3>
                                    <p className="text-sm text-gray-600 font-montserrat">{user?.email?.address}</p>
                                </div>

                                <div className="mb-5 pb-4 border-b border-gray-200">
                                    <h3 className="font-bold text-black font-montserrat mb-3">CONNECTED WALLETS</h3>
                                    {wallets.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {wallets.map((wallet, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                    <Wallet className="h-4 w-4 text-gray-700" />
                                                    <div>
                                                        <p className="text-sm font-semibold font-montserrat capitalize text-gray-900">
                                                            {wallet.walletClientType} Wallet
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono mt-0.5">
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

                                <div className="grid grid-cols-1 gap-3">
                                    <DropdownMenuItem onClick={linkWallet} className="p-0 focus:bg-transparent">
                                        <Button variant="outline" className="w-full rounded-xl border-2 border-black hover:bg-black hover:text-white font-montserrat h-11">
                                            <Link2 className="h-4 w-4 mr-2" />
                                            Link Wallet
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
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
            <SidebarRail />
        </Sidebar>
    )
}