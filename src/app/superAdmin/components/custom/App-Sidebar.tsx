'use client';

import { Home, Settings, UserRoundSearch, Wrench } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios, { AxiosResponse } from "axios";
import React from "react";
import Link from "next/link";
import { title } from "process";
import { ur } from "zod/v4/locales";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/superAdmin/dashboard",
    icon: Home,
  },
  {
    title: "Admins",
    url:"/superAdmin/admins",
    icon: UserRoundSearch,
  },
 {
    title: "Technicians",
    url:"/superAdmin/technicians",
    icon: Wrench,
  }, 
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: Settings,
  },
]


export const AppSidebar = () => {

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response: AxiosResponse = await axios.get('/api/superAdmin/auth/logout');
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
        router.push('/superAdmin');
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
          <SidebarGroupLabel className="text-2xl mb-4 font-bold">Super-Admin Desk</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col justify-between flex-1 h-full">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-[16px] ">
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarFooter >
              <Button className="w-[100px] flex flex-col justify-items-start  "
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
