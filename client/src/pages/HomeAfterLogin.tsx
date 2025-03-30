
// import { AppSidebar } from "../components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"
import Profile from "./profile"
import { AppSidebar } from "@/components/AppSidebar"
import { MainNav } from "@/components/MainNav"

const HomeAfterLogin = () => {
    return (
        <SidebarProvider>
            <div className="grid min-h-screen w-full lg:grid-cols-[auto_1fr]">
                <AppSidebar />
                <div className="flex flex-col min-h-screen w-full">
                    <header className="border-b">
                        <div className="flex h-16 items-center px-4 gap-4">
                            <SidebarTrigger />
                            <div className="flex items-center gap-2 mr-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <span className="text-lg font-bold text-primary-foreground">A</span>
                                </div>
                                <span className="font-semibold text-xl">Aurora</span>
                            </div>
                            <MainNav />

                        </div>
                    </header>
                    <main className="flex-1 h-full">
                      
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default HomeAfterLogin