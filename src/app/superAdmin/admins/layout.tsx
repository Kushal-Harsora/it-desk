import { AppSidebar } from "@/app/superAdmin/components/custom/App-Sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" flex-1 overflow-y-hidden">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
