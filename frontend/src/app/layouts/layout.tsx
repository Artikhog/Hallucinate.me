import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/shared/ui/shadcn/ui/sidebar"
import { AppSidebar } from "@/widgets/appSidebar/AppSidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
    return (
        <SidebarProvider
            style={
                {
                    '--sidebar-width': '240px', // Ширина в развернутом состоянии (240px)
                    '--sidebar-width-icon': '3rem' // Ширина в свернутом состоянии (48px)
                } as React.CSSProperties
            }>
            <div className="min-h-screen flex bg-background">
                <AppSidebar />
                <SidebarInset className="flex-1 min-w-0 ml-60">
                    <main className="w-full">
                        <div className="p-6">
                            <SidebarTrigger />
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}