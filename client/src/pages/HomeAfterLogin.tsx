import { MainNav } from "../components/MainNav";
import { AppSidebar } from "../components/AppSidebar";
import { Routes, Route, Navigate } from "react-router";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import Profile from "./profile";
import TradingViewPage from "./TradingPage";
import Agent from "./Agent";

const MainContent = () => {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="h-16 border-b bg-white/90 backdrop-blur-md sticky top-0 z-40 flex items-center px-4">
        <div className="flex w-full items-center gap-4">
          <SidebarTrigger className="text-gray-700 hover:text-black transition-colors" />
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-black to-gray-800 shadow-lg">
              <span className="text-lg font-bold text-white">Q</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900">QUBIT</span>
              <span className="text-xs text-gray-500">Quantum Trading Assistant</span>
            </div>
          </div>
          <MainNav />
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          <Routes>
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/agent" element={<Agent />} />
            <Route path="/trading" element={<TradingViewPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const HomeAfterLogin = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <MainContent />
      </div>
    </SidebarProvider>
  );
};

export default HomeAfterLogin;
