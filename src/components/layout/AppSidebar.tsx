import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  PieChart,
  Settings,
  TrendingUp,
  Upload,
  BookOpen,
  Target,
  DollarSign,
  Users
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    description: 'Overview & Analytics'
  },
  {
    title: 'Trades',
    url: '/trades',
    icon: BarChart3,
    description: 'Manage Trades'
  },
  {
    title: 'Analytics',
    url: '/analytics', 
    icon: PieChart,
    description: 'Performance Insights'
  },
  {
    title: 'Calendar',
    url: '/calendar',
    icon: Calendar,
    description: 'Trading Calendar'
  },
  {
    title: 'Journal',
    url: '/journal',
    icon: BookOpen,
    description: 'Trading Notes'
  },
  {
    title: 'Import',
    url: '/import',
    icon: Upload,
    description: 'MT5 Import'
  }
];

const secondaryItems = [
  {
    title: 'Accounts',
    url: '/accounts',
    icon: Users,
    description: 'Trading Accounts'
  },
  {
    title: 'Strategies',
    url: '/strategies',
    icon: Target,
    description: 'Trading Setups'
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    description: 'Preferences'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  
  const getNavClasses = (path: string) => 
    isActive(path) ? 'nav-item-active' : 'nav-item-inactive';

  return (
    <Sidebar
      className={isCollapsed ? 'w-16' : 'w-64'}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg hero-gradient">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg text-sidebar-foreground">TradeJournal</h2>
              <p className="text-xs text-sidebar-foreground/60">Professional Trading</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-medium mb-2">
            {!isCollapsed && 'Main Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
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
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              JD
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-sidebar-foreground truncate">
                John Doe
              </div>
              <div className="text-xs text-sidebar-foreground/60 truncate">
                Premium Trader
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}