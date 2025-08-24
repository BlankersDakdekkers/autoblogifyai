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
  Trophy,
  Folder,
  Edit,
  TestTube,
  Calendar,
  Book,
  Users,
  Activity,
  Crown,
  Brain
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

export const useNavigationSections = (): NavigationSection[] => {
  const { userRole } = useAuth();
  
  const baseSections: NavigationSection[] = [
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
        title: "Media Portaal", 
        url: "/dashboard/media", 
        icon: Image,
        description: "Beheer en categoriseer media bestanden"
      },
      { 
        title: "Content Features", 
        url: "/dashboard/content-features", 
        icon: TestTube,
        description: "Templates, scheduler en A/B testing"
      },
      { 
        title: "Categorieën Beheer", 
        url: "/dashboard/category-manager", 
        icon: Folder,
        description: "Beheer content categorieën"
      },
      { 
        title: "Template Editor", 
        url: "/dashboard/template-editor", 
        icon: Edit,
        description: "Maak en bewerk content templates"
      },
      { 
        title: "CSV Processor", 
        url: "/dashboard/csv-processor", 
        icon: Database,
        description: "Geavanceerde CSV verwerking en validatie"
      },
      { 
        title: "Blog Management", 
        url: "/dashboard/blogs", 
        icon: FileText,
        description: "Beheer en publiceer je blogs naar WordPress"
      },
    ]
  },
  {
    label: "Enterprise AI",
    items: [
      { 
        title: "Advanced AI Features", 
        url: "/dashboard/advanced-ai", 
        icon: Crown,
        description: "Geavanceerde AI modellen en functies"
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
        title: "Projecten", 
        url: "/dashboard/projects", 
        icon: Folder,
        description: "Overzicht van al je projecten"
      },
      { 
        title: "Resources", 
        url: "/dashboard/resources", 
        icon: Book,
        description: "Tutorials, templates en tools"
      },
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
        title: "Webhooks", 
        url: "/dashboard/webhooks", 
        icon: Zap,
        description: "Webhook integraties en automation"
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
      { 
        title: "Kennisbank", 
        url: "/dashboard/knowledge-base", 
        icon: Book,
        description: "Uitgebreide kennisbank en documentatie"
      },
    ]
  }
];

  // Add admin section if user is admin
  if (userRole === 'admin') {
    baseSections.splice(3, 0, {
      label: "Admin",
      items: [
        {
          title: "Gebruikersbeheer",
          url: "/dashboard/admin/users",
          icon: Users,
          description: "Beheer alle gebruikers en rollen"
        },
        {
          title: "Klanten Portaal",
          url: "/dashboard/admin/customers",
          icon: Users,
          description: "Beheer alle klanten en abonnementen"
        },
        {
          title: "System Monitoring",
          url: "/dashboard/admin/monitoring",
          icon: Activity,
          description: "System health en performance monitoring"
        },
        {
          title: "Resource Manager",
          url: "/dashboard/admin/resources",
          icon: Book,
          description: "Beheer resources, tutorials en tools"
        }
      ]
    });
  }

  return baseSections;
};

export const navigationSections: NavigationSection[] = [];

export const getNavigationItemByUrl = (url: string, sections: NavigationSection[]): NavigationItem | undefined => {
  for (const section of sections) {
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