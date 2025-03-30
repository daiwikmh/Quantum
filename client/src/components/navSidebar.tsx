import { AppSidebar } from "./AppSidebar";
import { MainNav } from "./MainNav";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Wallet } from "lucide-react";

const NavSidebar = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-black bg-white z-10 fixed w-full h-16">
            <div className="flex h-16 items-center px-4 gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center group cursor-pointer">
                <div className="transform group-hover:rotate-12 transition-transform">
                  <Wallet className="h-8 w-8 text-black" />
                </div>
                <span className="ml-2 text-2xl font-bold text-black font-montserrat">
                  AURORA
                </span>
              </div>
              <MainNav />
            </div>
          </header>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default NavSidebar;
