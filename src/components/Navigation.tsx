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
  Zap,
  Image,
  Trophy
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
      { 
        title: "Achievements", 
        url: "/dashboard/achievements", 
        icon: Trophy,
        description: "Trofeeën en rankings systeem"
      },
      { 
        title: "Abonnement", 
        url: "/dashboard/pricing", 
        icon: Zap,
        description: "Upgrade en beheer je plan"
      },
    ]
  },
  {
    label: "AutoblogifyAI",
    items: [
      { 
        title: "Keyword Research", 
        url: "/dashboard/keywords", 
        icon: FileText,
        description: "AI keyword generator en analyse"
      },
      { 
        title: "Voice Input", 
        url: "/dashboard/voice", 
        icon: CheckCircle2,
        description: "Spraak naar tekst content creatie"
      },
      { 
        title: "Content Genereren", 
        url: "/dashboard/generate", 
        icon: FileText,
        description: "CSV naar blogposts genereren"
      },
      { 
        title: "Media Portaal", 
        url: "/dashboard/media", 
        icon: Image,
        description: "Beheer en categoriseer media bestanden"
      },
      { 
        title: "Content Features", 
        url: "/dashboard/content-features", 
        icon: FileText,
        description: "Templates, scheduler en A/B testing"
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
        title: "Deployment", 
        url: "/dashboard/deployment", 
        icon: Zap,
        description: "Sites deployen en beheren"
      },
      { 
        title: "AI Generator", 
        url: "/dashboard/ai-generator", 
        icon: Zap,
        description: "AI website maker + WordPress"
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
      { 
        title: "Affiliate", 
        url: "/dashboard/affiliate", 
        icon: Database,
        description: "Partner programma en commissies"
      },
      { 
        title: "Academy", 
        url: "/dashboard/academy", 
        icon: Database,
        description: "Cursussen en tutorials"
      },
      { 
        title: "Notificaties", 
        url: "/dashboard/notifications", 
        icon: Database,
        description: "Meldingen en waarschuwingen"
      },
      { 
        title: "Help & Support", 
        url: "/dashboard/help", 
        icon: Database,
        description: "Hulp en documentatie"
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