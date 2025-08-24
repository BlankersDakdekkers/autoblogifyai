import React, { memo, useMemo } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigationSections, isActiveRoute, type NavigationSection } from '@/components/Navigation';
import { useIsMobile, useResponsiveColumns } from '@/utils/responsive';
import { ResponsiveGrid, ResponsiveContainer } from '@/components/ui/responsive-components';
import { OptimizedComponent } from '@/components/ui/responsive-components';
import { 
  ChevronRight, 
  Home, 
  ExternalLink,
  Star,
  TrendingUp,
  Clock,
  Zap,
  Crown
} from 'lucide-react';

// Memoized navigation item component for performance
const NavigationItem = memo(({ 
  item, 
  isActive, 
  isMobile 
}: { 
  item: any; 
  isActive: boolean; 
  isMobile: boolean; 
}) => {
  const Icon = item.icon;
  
  return (
    <Card className={`group transition-all duration-300 hover-scale ${
      isActive 
        ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 shadow-md' 
        : 'hover:border-primary/20 hover:shadow-sm'
    }`}>
      <CardContent className="p-4">
        <NavLink 
          to={item.url}
          className={({ isActive }) => `
            flex items-center gap-3 transition-all duration-200
            ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200
            ${isActive 
              ? 'bg-primary text-primary-foreground shadow-md' 
              : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary'
            }
          `}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {item.title}
            </div>
            {!isMobile && item.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </div>
            )}
          </div>
          
          {isActive ? (
            <Star className="h-4 w-4 text-primary flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
          )}
        </NavLink>
      </CardContent>
    </Card>
  );
});

NavigationItem.displayName = 'NavigationItem';

// Memoized section component
const NavigationSection = memo(({ 
  section, 
  currentPath, 
  isMobile 
}: { 
  section: NavigationSection; 
  currentPath: string; 
  isMobile: boolean; 
}) => {
  const getColumns = useResponsiveColumns();
  const columnCount = getColumns({ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 });

  // Get section priority for visual enhancement
  const sectionPriority = useMemo(() => {
    const priorities = {
      'Dashboard': 'high',
      'AutoblogifyAI': 'high', 
      'Enterprise AI': 'premium',
      'Admin': 'admin'
    };
    return priorities[section.label as keyof typeof priorities] || 'normal';
  }, [section.label]);

  const getSectionStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5';
      case 'premium':
        return 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50';
      case 'admin':
        return 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50';
      default:
        return 'border-border bg-card';
    }
  };

  const getSectionIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'premium':
        return <Crown className="h-5 w-5 text-amber-600" />;
      case 'admin':
        return <Zap className="h-5 w-5 text-red-600" />;
      default:
        return <Home className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <OptimizedComponent name={`nav-section-${section.label}`} lazyLoad={section.label !== 'Dashboard'}>
      <div className={`rounded-xl p-6 border-2 ${getSectionStyle(sectionPriority)}`}>
        <div className="flex items-center gap-2 mb-4">
          {getSectionIcon(sectionPriority)}
          <h3 className="font-semibold text-base">
            {section.label}
          </h3>
          <Badge variant={sectionPriority === 'premium' ? 'default' : 'secondary'} className="text-xs">
            {section.items.length}
          </Badge>
        </div>

        <ResponsiveGrid 
          columns={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          gap="sm"
        >
          {section.items.map((item) => (
            <NavigationItem
              key={item.url}
              item={item}
              isActive={isActiveRoute(currentPath, item.url)}
              isMobile={isMobile}
            />
          ))}
        </ResponsiveGrid>
      </div>
    </OptimizedComponent>
  );
});

NavigationSection.displayName = 'NavigationSection';

// Quick actions component
const QuickActions = memo(() => {
  const isMobile = useIsMobile();
  
  const quickActions = [
    { title: 'Nieuwe Blog', url: '/dashboard/csv-processor', icon: Zap, color: 'primary' },
    { title: 'Analytics', url: '/dashboard/analytics', icon: TrendingUp, color: 'blue' },
    { title: 'Templates', url: '/dashboard/template-editor', icon: Clock, color: 'green' },
  ];

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Snelle Acties
        </h3>
        <ResponsiveGrid columns={{ xs: 1, sm: 3 }} gap="sm">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.url} to={action.url}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 hover-scale"
                  size={isMobile ? "sm" : "default"}
                >
                  <Icon className="h-4 w-4" />
                  {action.title}
                </Button>
              </Link>
            );
          })}
        </ResponsiveGrid>
      </CardContent>
    </Card>
  );
});

QuickActions.displayName = 'QuickActions';

// Main optimized navigation component
export const OptimizedNavigation = memo(() => {
  const location = useLocation();
  const sections = useNavigationSections();
  const isMobile = useIsMobile();
  
  // Memoize current path to prevent unnecessary re-renders
  const currentPath = useMemo(() => location.pathname, [location.pathname]);
  
  // Group sections for better organization
  const { primarySections, secondarySections } = useMemo(() => {
    const primary = sections.filter(s => 
      ['Dashboard', 'AutoblogifyAI', 'Enterprise AI', 'Admin'].includes(s.label)
    );
    const secondary = sections.filter(s => 
      !['Dashboard', 'AutoblogifyAI', 'Enterprise AI', 'Admin'].includes(s.label)
    );
    return { primarySections: primary, secondarySections: secondary };
  }, [sections]);

  return (
    <ResponsiveContainer maxWidth="7xl">
      <div className="space-y-6">
        {/* Quick Actions */}
        <QuickActions />

        {/* Primary Sections */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Hoofdfuncties</h2>
          </div>
          
          {primarySections.map((section) => (
            <NavigationSection
              key={section.label}
              section={section}
              currentPath={currentPath}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Secondary Sections */}
        {secondarySections.length > 0 && (
          <div className="space-y-6">
            <Separator className="my-8" />
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-muted-foreground">Configuratie & Tools</h2>
            </div>
            
            {secondarySections.map((section) => (
              <NavigationSection
                key={section.label}
                section={section}
                currentPath={currentPath}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/5">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-muted-foreground">
              Mis je een functie? 
              <Link to="/dashboard/help" className="text-primary hover:underline ml-1">
                Laat het ons weten
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
});

OptimizedNavigation.displayName = 'OptimizedNavigation';

export default OptimizedNavigation;