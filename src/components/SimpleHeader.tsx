import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/utils/responsive";
import { Link } from "react-router-dom";
import { 
  Menu, X, Zap, TrendingUp, Award, Users, Globe, 
  ChevronRight, Star, CheckCircle, ArrowRight, Rocket 
} from "lucide-react";

const SimpleHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 animate-fade-in">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover-scale">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            AutoblogifyAI
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-8">
            <Link 
              to="/pricing" 
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium story-link"
            >
              Prijzen
            </Link>
            <Link 
              to="/sales" 
              className="text-muted-foreground hover:text-primary transition-all duration-300 font-medium story-link"
            >
              Features
            </Link>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link to="/auth">
                <Button variant="outline" size="sm" className="hover-scale">
                  Inloggen
                </Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow hover-scale shadow-md">
                  <Rocket className="h-4 w-4 mr-2" />
                  Gratis Starten
                </Button>
              </Link>
            </div>
          </nav>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover-scale"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && isMobile && (
        <div className="border-t bg-background animate-fade-in">
          <nav className="container py-4 space-y-4">
            <Link 
              to="/pricing" 
              className="block text-muted-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Prijzen
            </Link>
            <Link 
              to="/sales" 
              className="block text-muted-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <div className="pt-4 border-t space-y-2">
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Inloggen
                </Button>
              </Link>
              <Link to="/auth?tab=signup" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
                  <Rocket className="h-4 w-4 mr-2" />
                  Gratis Starten
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SimpleHeader;