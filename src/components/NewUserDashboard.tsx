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
      
      {/* Welcome Message */}
      {hasSeenWelcome && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Welkom bij AutoblogifyAI! 
                </h2>
                <p className="text-gray-600">
                  Je hebt <Badge className="bg-blue-100 text-blue-800">{credits} gratis credits</Badge> om te starten. 
                  Tijd om je eerste AI-blog te maken! 🚀
                </p>
              </div>
              <Button 
                onClick={() => setShowWelcomeModal(true)}
                variant="outline"
                className="border-blue-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {demoStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Eerste Blog Maken"
          description="Gebruik onze AI om in minuten een professionele blog te schrijven"
          actionText="Start AI Generator"
          onAction={() => navigate('/dashboard/csv-processor')}
        />
        
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Bulk Upload"
          description="Upload een CSV bestand om meerdere blogs tegelijk te genereren"
          actionText="Upload CSV"
          onAction={() => navigate('/dashboard/csv-processor')}
        />
        
        <EmptyState
          icon={<Globe className="h-6 w-6" />}
          title="WordPress Koppelen"
          description="Verbind je WordPress site om direct te kunnen publiceren"
          actionText="WordPress Instellen"
          onAction={() => setShowWordPressSetup(true)}
        />
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