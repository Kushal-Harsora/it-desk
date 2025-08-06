'use client';

import { Home, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios, { AxiosResponse } from "axios";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response: AxiosResponse = await axios.get('api/auth/logout');
      const data = response.data
      if (data && response.status === 200) {
        toast.success(data.message || "Logout successful", {
          style: {
            "backgroundColor": "#D5F5E3",
            "color": "black",
            "border": "none"
          },
          duration: 1500
        });

        window.localStorage.removeItem("name");
        window.localStorage.removeItem("email");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error on Logout", error);
      toast.error("Failed to logout", {
        style: {
          "backgroundColor": "#FADBD8",
          "color": "black",
          "border": "none"
        },
        duration: 2500
      })
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sample Sidebar</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col justify-between flex-1 h-full">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarFooter className=" bg-red-300">
              <Button
                variant={'destructive'}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </SidebarFooter>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>

  )
}
