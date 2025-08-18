import { useState } from "react"
import { FileText, ChevronDown, ChevronRight } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useNavigationSections, isActiveRoute } from "./Navigation"

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
  const navigationSections = useNavigationSections()

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    "Dashboard": true,
    "AutoblogifyAI": true,
    "Website Builder": true,
    "Configuratie": true,
    "Admin": true,
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
    return `flex items-center gap-3 w-full p-2 ${
      isActive 
        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold shadow-md" 
        : "hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 hover:shadow-sm"
    }`
  }

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-60"} transition-all duration-300 ease-in-out`}>
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-105">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AutoblogifyAI
                </h2>
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
                  className="flex items-center justify-between cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-md transition-all duration-200 hover:shadow-sm"
                  onClick={() => toggleSection(section.label)}
                >
                  <span className="font-medium text-sm">{section.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                  )}
                </SidebarGroupLabel>
              )}
              
              {isExpanded && (
                <SidebarGroupContent className="animate-accordion-down">
                  <SidebarMenu>
                    {section.items.map((item, index) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.url} 
                            end={item.url === "/dashboard"}
                            className={`${getNavCls(item.url)} transition-all duration-200 hover:transform hover:scale-[1.02] rounded-md`}
                            title={collapsed ? item.title : undefined}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <item.icon className="h-4 w-4 transition-colors duration-200" />
                            {!collapsed && (
                              <div className="flex-1 animate-fade-in">
                                <span className="font-medium">{item.title}</span>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 transition-opacity duration-200">
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