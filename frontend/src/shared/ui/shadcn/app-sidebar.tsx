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
  SidebarGroupBottom,
  SidebarUser
} from "@/shared/ui/shadcn/ui/sidebar"
import {useAuth} from "@/features/auth/model/auth-context.ts";
import {sessionsApi} from "@/features/session/sessions-api.ts";
import {useEffect, useState} from "react";
import type {UserSession} from "@/features/session/types/user-session.ts";
import {useGetLevelsQuery} from "@/shared/api/queries/getLevelsQuery.ts";


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
]

export function RecentChatsSidebar() {
  const location = useLocation()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [levelsDictionary, setLevels] = useState<Record<string, string>>({})
  const { data: levels} = useGetLevelsQuery();

  useEffect(() => {
    if (!levels) return;
    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const sessions = await sessionsApi.getUserSessions()
        const levelsDict = levels.reduce<Record<string, string>>((acc, l) => {
          acc[l.id] = l.name;
          return acc;
        }, {});

        setLevels(levelsDict)
        setSessions(sessions)
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [levels])

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
          const isActive = location.pathname === `/chat?id=${chat.id}`

          return (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link to={`/chat?id=${chat.id}`}>
                    <MessageSquare className="opacity-60" />
                    <span>{levelsDictionary[chat.level_id] || "Unknown theme"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const auth = useAuth()


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
              successfulReports={auth.useStats?.successful_reports ?? 0}
              sessionsPlayed={auth.useStats?.sessions_played ?? 0}
              globalRank={auth.useStats?.global_rank ?? 0}
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
}
