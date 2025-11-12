import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Trophy,
  Target,
  MessageSquare,
  Plus,
  ShieldQuestionMark,
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
  SidebarGroupBottom,
  SidebarUser
} from "@/shared/ui/shadcn/ui/sidebar"
import { useAuth } from "@/features/auth/model/auth-context.ts";
import { sessionsApi } from "@/features/session/sessions-api.ts";
import { useEffect, useState } from "react";
import type { UserSession } from "@/features/session/types/user-session.ts";
import { authStore } from "@/features/auth/model/auth-store";
import { observer } from "mobx-react-lite";

// Main navigation items
const navItems = [
  {
    title: "Главная",
    url: "/",
    icon: Home,
  },
  {
    title: "Раунды",
    url: "/levels",
    icon: Target,
  },
  {
    title: "Лидеры",
    url: "/leaders",
    icon: Trophy,
  },
  {
    title: "Галлюцинации",
    url: "/reports",
    icon: ShieldQuestionMark,
  },
]

export function RecentChatsSidebar() {
  const location = useLocation()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const data = await sessionsApi.getUserSessions()
        setSessions(data)
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/chat">
            <Plus />
            <span>Новый чат</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isLoading && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <span>Загрузка...</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {sessions.map((chat) => {
        const isActive = location.pathname === `/chat/${chat.id}`

        return (
          <SidebarMenuItem key={chat.id}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link to={`/chat/${chat.id}`}>
                <MessageSquare className="opacity-60" />
                <span>{chat.username || "Untitled Chat"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export const AppSidebar = observer(({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const location = useLocation()
  const auth = authStore;

  useEffect(() => {
    auth.getUserStats();
  }, [])

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
            <RecentChatsSidebar />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroupBottom>
          <SidebarUser
            successfulReports={auth.userStats?.successful_reports ?? 0}
            sessionsPlayed={auth.userStats?.sessions_played ?? 0}
            globalRank={auth.userStats?.global_rank ?? 0}
            onLogout={() => {
              auth.logout();
              window.location.href = '/auth/login';
            }}
          />
        </SidebarGroupBottom>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
});

AppSidebar.displayName = "AppSidebar";
