import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  FileText, 
  Image, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Zap
} from "lucide-react";

interface ProgressItem {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  step: string;
  timestamp: string;
}

interface AIProgressSidebarProps {
  isVisible: boolean;
  items: ProgressItem[];
  onClose?: () => void;
}

export const AIProgressSidebar = ({ isVisible, items, onClose }: AIProgressSidebarProps) => {
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    if (items.length > 0) {
      const avgProgress = items.reduce((sum, item) => sum + item.progress, 0) / items.length;
      setTotalProgress(Math.round(avgProgress));
    }
  }, [items]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 overflow-y-auto">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="sticky top-0 bg-background border-b z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AI Content Generator</CardTitle>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
          </div>
          <CardDescription>
            Real-time voortgang van AI tekstgeneratie
          </CardDescription>
          
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Totale voortgang</span>
                <span>{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Geen actieve AI generatie</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.step}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(item.status)}`}
                  >
                    {item.status === 'processing' ? 'Bezig...' : 
                     item.status === 'completed' ? 'Klaar' :
                     item.status === 'error' ? 'Fout' : 'Wachten'}
                  </Badge>
                </div>
                
                {item.status === 'processing' && (
                  <Progress value={item.progress} className="h-1" />
                )}
                
                <Separator />
              </div>
            ))
          )}

          {/* Legenda */}
          <div className="mt-6 pt-4 border-t">
            <h5 className="font-medium text-sm mb-3">Proces stappen:</h5>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Content generatie</span>
              </div>
              <div className="flex items-center gap-2">
                <Image className="h-3 w-3" />
                <span>Afbeelding creatie</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-3 w-3" />
                <span>SEO optimalisatie</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};