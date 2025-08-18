import { useState } from "react"
import { FileText, CheckCircle2, Globe, Settings, Home, BarChart3 } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Genereren", url: "/dashboard/generate", icon: FileText },
  { title: "Valideren", url: "/dashboard/validate", icon: CheckCircle2 },
  { title: "Publiceren", url: "/dashboard/publish", icon: Globe },
]

const configItems = [
  { title: "Instellingen", url: "/dashboard/settings", icon: Settings },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + "/")
  const isMainExpanded = mainItems.some((i) => isActive(i.url))
  const isConfigExpanded = configItems.some((i) => isActive(i.url))
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 ${isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50"}`

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
    >
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg">AutoblogifyAI</h2>
                <p className="text-xs text-muted-foreground">CSV → SEO Blogs</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuratie</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}