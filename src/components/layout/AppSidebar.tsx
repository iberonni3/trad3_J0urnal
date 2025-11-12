import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Home,
  PieChart,
  Settings,
  TrendingUp,
  BookOpen,
  Target,
  Users
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, description: 'Overview & Analytics' },
  { title: 'Trades', url: '/trades', icon: BarChart3, description: 'Manage Trades' },
  { title: 'Analytics', url: '/analytics', icon: PieChart, description: 'Performance Insights' },
  { title: 'Calendar', url: '/calendar', icon: Calendar, description: 'Trading Calendar' },
  { title: 'Journal', url: '/journal', icon: BookOpen, description: 'Trading Notes' }
];

const secondaryItems = [
  { title: 'Accounts', url: '/accounts', icon: Users, description: 'Trading Accounts' },
  { title: 'Analysis', url: '/analysis', icon: Target, description: 'Forecasts & notes' },
  { title: 'Settings', url: '/settings', icon: Settings, description: 'Preferences' }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const navItemClasses = (path: string) => {
    const isActive = currentPath.startsWith(path);
    return isActive
      ? 'bg-primary/10 text-primary rounded-md border-l-4 border-primary'
      : 'text-sidebar-foreground hover:bg-sidebar-hover rounded-md';
  };

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-64'} collapsible="icon">
      {/* Top Logo/Header */}
      <SidebarHeader className="border-b border-sidebar-border p-3 sm:p-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg hero-gradient flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="font-bold text-lg text-sidebar-foreground">TradeJournal</h2>
              <p className="text-xs text-sidebar-foreground/60">Professional Trading</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/30 hover:[&::-webkit-scrollbar-thumb]:bg-primary/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium mb-2">
            {!isCollapsed && 'Main Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 p-2 ${navItemClasses(item.url)}`}
                        style={{
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          paddingLeft: isCollapsed ? 0 : '0.75rem',
                          paddingRight: isCollapsed ? 0 : '0.75rem',
                          borderLeftWidth: isCollapsed ? '0' : '4px'
                        }}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs opacity-70">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent
                        side="right"
                        align="center"
                        className="bg-gray-800 text-white rounded-md px-3 py-1 shadow-lg z-50"
                      >
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium mb-2">
            {!isCollapsed && 'Management'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 p-2 ${navItemClasses(item.url)}`}
                        style={{
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          paddingLeft: isCollapsed ? 0 : '0.75rem',
                          paddingRight: isCollapsed ? 0 : '0.75rem',
                          borderLeftWidth: isCollapsed ? '0' : '4px'
                        }}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs opacity-70">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent
                        side="right"
                        align="center"
                        className="bg-gray-800 text-white rounded-md px-3 py-1 shadow-lg z-50"
                      >
                        {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Firebase User */}
      <SidebarFooter className="border-t border-sidebar-border p-3 sm:p-4 flex items-center justify-center">
        <div className="flex items-center gap-3 w-full">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.displayName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-sidebar-foreground truncate">
                {user?.displayName || 'User'}
              </div>
              <div className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}