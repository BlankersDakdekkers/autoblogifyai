import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  User, Settings, LogOut, Crown, Sparkles, 
  Menu, Home, Info, Phone, HelpCircle, BookOpen 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface OptimizedHeaderProps {
  className?: string;
}

const OptimizedHeader: React.FC<OptimizedHeaderProps> = ({ className = '' }) => {
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const publicNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Pricing', href: '/pricing', icon: Sparkles },
    { label: 'Over Ons', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Phone },
    { label: 'Help', href: '/help', icon: HelpCircle },
    { label: 'Kennis', href: '/knowledge-base', icon: BookOpen },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AutoblogifyAI
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {profile?.display_name || user.email?.split('@')[0]}
                      </span>
                      {userRole === 'admin' && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard" className="flex items-center gap-2 w-full">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard/settings" className="flex items-center gap-2 w-full">
                      <Settings className="h-4 w-4" />
                      Instellingen
                    </NavLink>
                  </DropdownMenuItem>
                  {userRole === 'admin' && (
                    <DropdownMenuItem asChild>
                      <NavLink to="/admin" className="flex items-center gap-2 w-full">
                        <Crown className="h-4 w-4" />
                        Admin Panel
                      </NavLink>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Uitloggen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <NavLink to="/auth">Inloggen</NavLink>
                </Button>
                <Button asChild>
                  <NavLink to="/auth?tab=signup">Registreren</NavLink>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-4 mt-8">
                  {publicNavItems.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  ))}
                  {!user && (
                    <>
                      <hr className="my-4" />
                      <NavLink
                        to="/auth"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Inloggen
                      </NavLink>
                      <NavLink
                        to="/auth?tab=signup"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        Registreren
                      </NavLink>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OptimizedHeader;