import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import WordPressSetupWizard from "./WordPressSetupWizard";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Play,
  BookOpen,
  Zap,
  Target,
  Globe,
  Settings
} from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickStartSteps = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Maak je eerste blog",
      description: "Start met de AI Blog Generator",
      action: () => {
        onClose();
        navigate('/dashboard/csv-processor');
      },
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Upload CSV bestand",
      description: "Bulk generatie met CSV Processor",
      action: () => {
        onClose();
        navigate('/dashboard/csv-processor');
      },
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Bekijk kennisbank",
      description: "Leer over SEO en content marketing",
      action: () => {
        onClose();
        navigate('/dashboard/knowledge');
      },
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Welkom bij AutoblogifyAI! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            Hoi {user?.email?.split('@')[0]}! Geweldig dat je er bent. Je hebt <strong>5 gratis credits</strong> om te starten. 
            Laten we samen je eerste AI-blog maken!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid gap-4">
            <h4 className="font-semibold">🚀 Quick Start - Kies je eerste stap:</h4>
            <div className="space-y-3">
              {quickStartSteps.map((step, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={step.action}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${step.color}`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{step.title}</h5>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h5 className="font-medium mb-1">Pro tip 💡</h5>
                <p className="text-sm text-muted-foreground">
                  Begin met één blog om te zien hoe krachtig onze AI is. Vervolgens kun je CSV uploaden voor bulk generatie van tientallen blogs tegelijk!
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Zelf verkennen
            </Button>
            <Button 
              onClick={() => {
                onClose();
                navigate('/dashboard/csv-processor');
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Nu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const EmptyState = ({ icon, title, description, actionText, onAction }: EmptyStateProps) => (
  <Card className="text-center p-8">
    <CardContent className="space-y-4">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Button onClick={onAction} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
        {actionText}
      </Button>
    </CardContent>
  </Card>
);

export const NewUserDashboard = () => {
  const { user, credits } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [showWordPressSetup, setShowWordPressSetup] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome modal
    const welcomeSeen = localStorage.getItem(`welcome_seen_${user?.id}`);
    if (!welcomeSeen && user) {
      // Reduce delay to show modal faster
      setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500); // Reduced from 1000ms to 500ms
    } else {
      setHasSeenWelcome(true);
    }
  }, [user]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    setHasSeenWelcome(true);
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true');
    }
  };

  const demoStats = [
    {
      title: "Credits Beschikbaar",
      value: credits.toString(),
      description: "Gratis startcredits",
      icon: <Zap className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "Blogs Gegenereerd", 
      value: "0",
      description: "Begin met je eerste blog",
      icon: <FileText className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "Totale Woorden",
      value: "0",
      description: "AI-gegenereerde content",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      title: "Gemiddelde Score",
      value: "-",
      description: "SEO optimalisatie score",
      icon: <Target className="h-4 w-4" />,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-8">
      <WelcomeModal isOpen={showWelcomeModal} onClose={handleWelcomeClose} />
      
      {/* Enhanced Welcome Card - Mobile Optimized */}
      {hasSeenWelcome && (
        <Card className="group bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Welkom bij AutoblogifyAI! 
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Je hebt <Badge className="bg-primary/10 text-primary border-primary/20 mx-1">{credits} gratis credits</Badge> om te starten. 
                  Tijd om je eerste AI-blog te maken! 🚀
                </p>
              </div>
              <Button 
                onClick={() => setShowWelcomeModal(true)}
                variant="outline"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 group-hover:scale-105 w-full sm:w-auto"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {demoStats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] via-transparent to-accent/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-3 sm:p-6 relative">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-200`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{stat.description}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 ${stat.color} group-hover:scale-110 transition-transform duration-200 ml-2`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Quick Actions - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card className="group text-center p-4 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden cursor-pointer"
              onClick={() => navigate('/dashboard/csv-processor')}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="space-y-4 p-0 relative">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Eerste Blog Maken</h3>
              <p className="text-sm text-muted-foreground mb-4">Gebruik onze AI om in minuten een professionele blog te schrijven</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 group-hover:scale-105 w-full sm:w-auto">
              Start AI Generator
            </Button>
          </CardContent>
        </Card>
        
        <Card className="group text-center p-4 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden cursor-pointer"
              onClick={() => navigate('/dashboard/csv-processor')}>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="space-y-4 p-0 relative">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Bulk Upload</h3>
              <p className="text-sm text-muted-foreground mb-4">Upload een CSV bestand om meerdere blogs tegelijk te genereren</p>
            </div>
            <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 transition-all duration-300 group-hover:scale-105 w-full sm:w-auto">
              Upload CSV
            </Button>
          </CardContent>
        </Card>
        
        <Card className="group text-center p-4 sm:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-card via-card/95 to-card/80 shadow-elegant backdrop-blur-sm relative overflow-hidden cursor-pointer md:col-span-2 xl:col-span-1"
              onClick={() => setShowWordPressSetup(true)}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="space-y-4 p-0 relative">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">WordPress Koppelen</h3>
              <p className="text-sm text-muted-foreground mb-4">Verbind je WordPress site om direct te kunnen publiceren</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 group-hover:scale-105 w-full sm:w-auto">
              WordPress Instellen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Aan de slag tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">🎯 Voor beginners:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Start met 1 blog om de kwaliteit te zien</li>
                <li>• Gebruik specifieke, relevante onderwerpen</li>
                <li>• Voeg je doelstad toe voor lokale SEO</li>
                <li>• Review en pas gegenereerde content aan</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">⚡ Voor professionals:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bereid CSV bestanden voor met keyword research</li>
                <li>• Gebruik consistente formatting voor betere resultaten</li>
                <li>• Overweeg Premium voor onbeperkte generatie</li>
                <li>• Integreer met je WordPress site</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Setup Knop */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-yellow-800">Admin Setup</h4>
              <p className="text-sm text-yellow-700">Maak jezelf admin voor volledige toegang</p>
            </div>
            <Button 
              onClick={async () => {
                try {
                  const { error } = await supabase.rpc('make_self_admin');
                  if (error) throw error;
                  
                  toast({
                    title: "Admin rechten toegekend",
                    description: "Je hebt nu admin rechten. Pagina wordt herladen...",
                  });
                  
                  setTimeout(() => window.location.reload(), 1500);
                } catch (error: any) {
                  toast({
                    title: "Fout",
                    description: error.message,
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Maak mij admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WordPress Setup Dialog */}
      <Dialog open={showWordPressSetup} onOpenChange={setShowWordPressSetup}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              WordPress Koppeling Instellen
            </DialogTitle>
            <DialogDescription>
              Configureer je WordPress site voor automatische publicatie van je gegenereerde content.
            </DialogDescription>
          </DialogHeader>
          <WordPressSetupWizard
            onComplete={(config) => {
              console.log('WordPress configured:', config);
              setShowWordPressSetup(false);
              toast({
                title: "WordPress Gekoppeld!",
                description: "Je kunt nu direct publiceren naar je WordPress site",
              });
              // TODO: Save config to user settings in Supabase
            }}
            onSkip={() => setShowWordPressSetup(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};