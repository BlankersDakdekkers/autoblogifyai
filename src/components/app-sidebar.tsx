import { useState } from "react"
import { FileText, ChevronDown, ChevronRight } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { navigationSections, isActiveRoute } from "./Navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    "Dashboard": true,
    "AutoblogifyAI": true,
    "Website Builder": true,
    "Configuratie": true,
  })

  const toggleSection = (sectionLabel: string) => {
    if (collapsed) return; // Don't toggle when collapsed
    setExpandedSections(prev => ({
      ...prev,
      [sectionLabel]: !prev[sectionLabel]
    }))
  }

  const getNavCls = (itemUrl: string) => {
    const isActive = isActiveRoute(currentPath, itemUrl)
    return `flex items-center gap-2 w-full ${
      isActive 
        ? "bg-primary text-primary-foreground font-medium" 
        : "hover:bg-muted/50"
    }`
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-lg">AutoblogifyAI</h2>
                <p className="text-xs text-muted-foreground">Pro Dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        {navigationSections.map((section) => {
          const isExpanded = collapsed || expandedSections[section.label]
          const hasActiveItem = section.items.some(item => isActiveRoute(currentPath, item.url))

          return (
            <SidebarGroup key={section.label}>
              {!collapsed && (
                <SidebarGroupLabel 
                  className="flex items-center justify-between cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
                  onClick={() => toggleSection(section.label)}
                >
                  <span>{section.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </SidebarGroupLabel>
              )}
              
              {isExpanded && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.url} 
                            end={item.url === "/dashboard"}
                            className={getNavCls(item.url)}
                            title={collapsed ? item.title : undefined}
                          >
                            <item.icon className="h-4 w-4" />
                            {!collapsed && (
                              <div className="flex-1">
                                <span>{item.title}</span>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}