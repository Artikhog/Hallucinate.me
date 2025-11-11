import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
} from '@/shared/ui/shadcn/ui/sidebar';
import { 
  Home, 
  Trophy, 
  Target,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const items = [
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
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible='icon'>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Навигация</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={cn(
                        "transition-colors",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-fit" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}