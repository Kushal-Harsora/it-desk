import { AppSidebar } from "@/components/custom/App-Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar title="Client Desk" logout="api/auth/logout" logoutpath="/login" />
      <main className=" flex-1 overflow-y-auto">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
