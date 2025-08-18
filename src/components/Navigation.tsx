import { 
  Home, 
  FileText, 
  CheckCircle2, 
  Globe, 
  Settings, 
  BarChart3,
  Layout,
  Palette,
  Code,
  Database,
  Zap
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    label: "Dashboard",
    items: [
      { 
        title: "Overzicht", 
        url: "/dashboard", 
        icon: Home,
        description: "Dashboard overzicht en statistieken"
      },
      { 
        title: "Analytics", 
        url: "/dashboard/analytics", 
        icon: BarChart3,
        description: "Content prestaties en metrics"
      },
    ]
  },
  {
    label: "AutoblogifyAI",
    items: [
      { 
        title: "Genereren", 
        url: "/dashboard/generate", 
        icon: FileText,
        description: "CSV naar blogposts genereren"
      },
      { 
        title: "Valideren", 
        url: "/dashboard/validate", 
        icon: CheckCircle2,
        description: "CSV schema validatie"
      },
      { 
        title: "Publiceren", 
        url: "/dashboard/publish", 
        icon: Globe,
        description: "Posts publicatie workflow"
      },
    ]
  },
  {
    label: "Website Builder",
    items: [
      { 
        title: "Sites Overzicht", 
        url: "/dashboard/websites", 
        icon: Layout,
        description: "Beheer je websites en projecten"
      },
      { 
        title: "Templates", 
        url: "/dashboard/templates", 
        icon: Palette,
        description: "Website templates en themes"
      },
      { 
        title: "Components", 
        url: "/dashboard/components", 
        icon: Code,
        description: "Herbruikbare UI componenten"
      },
      { 
        title: "Deployment", 
        url: "/dashboard/deployment", 
        icon: Zap,
        description: "Sites deployen en beheren"
      },
    ]
  },
  {
    label: "Configuratie",
    items: [
      { 
        title: "Instellingen", 
        url: "/dashboard/settings", 
        icon: Settings,
        description: "Algemene instellingen"
      },
      { 
        title: "Integraties", 
        url: "/dashboard/integrations", 
        icon: Database,
        description: "API's en externe services"
      },
    ]
  }
];

export const getNavigationItemByUrl = (url: string): NavigationItem | undefined => {
  for (const section of navigationSections) {
    const item = section.items.find(item => item.url === url);
    if (item) return item;
  }
  return undefined;
};

export const isActiveRoute = (currentPath: string, itemUrl: string): boolean => {
  if (itemUrl === "/dashboard") {
    return currentPath === "/dashboard" || currentPath === "/dashboard/";
  }
  return currentPath === itemUrl || currentPath.startsWith(itemUrl + "/");
};