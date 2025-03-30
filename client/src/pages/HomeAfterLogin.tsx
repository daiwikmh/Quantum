import { Navigate, Route, Routes } from "react-router"
import Profile from "./Profile"
import TradingPage from "./TradingPage"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { MainNav } from "@/components/MainNav"
import Subscribe from "@/components/Subscibe"
import { useEffect, useState } from "react"
import Agent from "./Agent"

const HomeAfterLogin = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if user is subscribed on component mount
    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    // This function would typically check with your backend or blockchain
    const checkSubscriptionStatus = async () => {
        try {
            const subscriptionStatus = localStorage.getItem('userSubscribed');
            setIsSubscribed(subscriptionStatus === 'true');
        } catch (error) {
            console.error("Failed to check subscription status:", error);
        } finally {
            setLoading(false);
        }
    };

    // Callback function when subscription transaction is successful
    const handleSubscriptionSuccess = () => {
        setIsSubscribed(true);
        localStorage.setItem('userSubscribed', 'true');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your account...</p>
                </div>
            </div>
        );
    }

    // If user is not subscribed, show only the subscription page
    if (!isSubscribed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black shadow-lg shadow-black/10">
                                <span className="text-2xl font-bold text-white font-montserrat">Q</span>
                            </div>
                            <span className="font-bold text-3xl text-gray-900 font-montserrat tracking-tight">Quantum</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Quantum!</h1>
                        <p className="text-gray-600">Complete your subscription to access all features</p>
                    </div>

                    <Subscribe onSubscriptionSuccess={handleSubscriptionSuccess} />
                </div>
            </div>
        );
    }

    // If user is subscribed, show the full app with all features
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
                                    <span className="text-lg font-bold text-white font-montserrat">Q</span>
                                </div>
                                <span className="font-bold text-xl text-gray-900 font-montserrat tracking-tight">Quantum</span>
                            </div>
                            <MainNav />
                        </div>
                    </header>
                    <main className="flex-1 p-8 overflow-auto">
                        <Routes>
                            <Route path="/" element={<Navigate to="/profile" replace />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/trading" element={<TradingPage />} />
                            <Route path="/agent" element={<Agent />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default HomeAfterLogin