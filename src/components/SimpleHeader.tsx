import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { 
  Menu, X, Zap, TrendingUp, Award, Users, Globe, 
  ChevronRight, Star, CheckCircle, ArrowRight, Rocket 
} from "lucide-react";

const SimpleHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useLanguage();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-gradient">AutoblogifyAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Prijzen
          </Link>
          <Link to="/sales" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            Features
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Inloggen
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary-glow">
                <Rocket className="h-4 w-4 mr-2" />
                Gratis Starten
              </Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-4">
            <Link 
              to="/pricing" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Prijzen
            </Link>
            <Link 
              to="/sales" 
              className="block text-muted-foreground hover:text-primary transition-colors"
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
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
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