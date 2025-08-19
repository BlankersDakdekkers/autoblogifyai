import React, { useState, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Zap, 
  Rocket,
  ArrowRight,
  Sparkles
} from "lucide-react";

// Memoized navigation link component for better performance
const NavLink = memo(({ to, children, onClick, className = "" }: {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`
        relative text-muted-foreground hover:text-primary transition-all duration-300 font-medium
        focus-visible-ring group
        ${isActive ? 'text-primary' : ''}
        ${className}
      `}
    >
      {children}
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary to-primary-glow scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
});

NavLink.displayName = 'NavLink';

// Memoized logo component
const Logo = memo(() => (
  <Link 
    to="/" 
    className="flex items-center space-x-3 group focus-visible-ring rounded-lg p-1 -m-1"
    aria-label="AutoblogifyAI Home"
  >
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center shadow-elegant group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
        <Zap className="h-6 w-6 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse opacity-80" />
    </div>
    <div className="flex flex-col">
      <span className="font-heading font-bold text-xl text-gradient group-hover:scale-105 transition-transform duration-300">
        AutoblogifyAI
      </span>
      <span className="text-xs text-muted-foreground opacity-80">
        Powered by AI
      </span>
    </div>
  </Link>
));

Logo.displayName = 'Logo';

// Enhanced CTA button component
const CTAButton = memo(({ variant = 'primary', children, to, className = "", ...props }: {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  to: string;
  className?: string;
}) => (
  <Link to={to}>
    <Button 
      className={`
        ${variant === 'primary' 
          ? 'btn-premium hover-lift' 
          : 'btn-glass hover-scale'
        } 
        group relative overflow-hidden
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {children}
      </span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Button>
  </Link>
));

CTAButton.displayName = 'CTAButton';

const OptimizedHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  
  // Memoized menu toggle handler
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Enhanced navigation items
  const navigationItems = [
    { label: "Features", href: "/sales", badge: "Nieuw" },
    { label: "Prijzen", href: "/pricing" },
    { label: "Klanten", href: "/customer-cases" },
    { label: "Over Ons", href: "/about" },
  ];

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
        <div className="container">
          <div className="flex h-20 items-center justify-between">
            
            {/* Enhanced Logo */}
            <Logo />

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation">
              {navigationItems.map((item) => (
                <div key={item.href} className="relative">
                  <NavLink to={item.href}>
                    {item.label}
                  </NavLink>
                  {item.badge && (
                    <Badge 
                      variant="outline" 
                      className="absolute -top-2 -right-6 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none animate-pulse"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              ))}
            </nav>

            {/* Enhanced Action Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <LanguageSwitcher />
              
              <CTAButton variant="secondary" to="/auth">
                Inloggen
              </CTAButton>
              
              <CTAButton variant="primary" to="/auth?tab=signup">
                <Sparkles className="h-4 w-4 mr-2" />
                Gratis Starten
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </CTAButton>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="relative focus-visible-ring"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`h-5 w-5 absolute transition-all duration-300 ${
                      isMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                    }`} 
                  />
                  <X 
                    className={`h-5 w-5 absolute transition-all duration-300 ${
                      isMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
                    }`} 
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <div 
          className={`lg:hidden border-t bg-background/98 backdrop-blur-md transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <nav className="container py-6 space-y-4" role="navigation">
            {navigationItems.map((item, index) => (
              <div 
                key={item.href}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <NavLink 
                  to={item.href} 
                  onClick={closeMenu}
                  className="block py-2 text-lg"
                >
                  <div className="flex items-center justify-between">
                    {item.label}
                    {item.badge && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                        {item.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </div>
                </NavLink>
              </div>
            ))}
            
            <div className="pt-6 border-t space-y-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <CTAButton variant="secondary" to="/auth" className="w-full justify-center">
                Inloggen
              </CTAButton>
              <CTAButton variant="primary" to="/auth?tab=signup" className="w-full justify-center">
                <Rocket className="h-4 w-4 mr-2" />
                Gratis Starten
                <Sparkles className="h-4 w-4 ml-2" />
              </CTAButton>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default memo(OptimizedHeader);