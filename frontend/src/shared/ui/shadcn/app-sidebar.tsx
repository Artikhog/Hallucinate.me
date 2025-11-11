import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Trophy,
  Target,
  MessageSquare,
  Plus,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
} from "@/shared/ui/shadcn/ui/sidebar"

// Main navigation items
const navItems = [
  {
    title: "Главная",
    url: "/",
    icon: Home,
  },
  {
    title: "Раунды",
    url: "/rounds",
    icon: Target,
  },
  {
    title: "Лидеры",
    url: "/leaders",
    icon: Trophy,
  },
]

// Recent chats (mock data - replace with actual data)
const recentChats = [
  {
    id: "1",
    title: "Обсуждение истории",
    url: "/chat/1",
  },
  {
    id: "2",
    title: "Вопросы о науке",
    url: "/chat/2",
  },
  {
    id: "3",
    title: "Факты о природе",
    url: "/chat/3",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg">
                  <Link to="/">
                    <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <MessageSquare className="size-3" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none data-[variant=inset]:hidden">
                      <span className="font-semibold">Hallucinate.me</span>
                      <span className="text-xs">AI Chat Game</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Недавние чаты</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/chat">
                    <Plus />
                    <span>Новый чат</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {recentChats.map((chat) => {
                const isActive = location.pathname === chat.url
                return (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={chat.url}>
                        <MessageSquare className="opacity-60" />
                        <span>{chat.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
