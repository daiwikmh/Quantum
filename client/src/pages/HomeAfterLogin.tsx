
import { Navigate, Route, Routes } from "react-router"
import Profile from "./Profile"
import TradingPage from "./TradingPage"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { MainNav } from "@/components/MainNav"

const HomeAfterLogin = () => {
    return (
        <SidebarProvider>
            <div className="flex flex-row h-screen w-full bg-gray-50">
                {/* Sidebar */}
                <div className="z-50">
                    <AppSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0">
                        <div className="flex h-16 items-center px-6 gap-6">
                            <SidebarTrigger className="text-gray-700 hover:text-black transition-colors" />
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black shadow-lg shadow-black/10">
                                    <span className="text-lg font-bold text-white font-montserrat">A</span>
                                </div>
                                <span className="font-bold text-xl text-gray-900 font-montserrat tracking-tight">AURORA</span>
                            </div>
                            <MainNav />
                        </div>
                    </header>
                    <main className="flex-1 p-8 overflow-auto">
                        <Routes>
                            <Route path="/" element={<Navigate to="/profile" replace />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/trading" element={<TradingPage />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default HomeAfterLogin