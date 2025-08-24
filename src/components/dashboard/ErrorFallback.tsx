import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleReport = () => {
    // Log error for monitoring
    console.error('Dashboard Error:', error);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive/20 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive mb-2">
            Oeps! Er ging iets mis
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Het dashboard kon niet correct laden. Dit is waarschijnlijk een tijdelijk probleem.
            </AlertDescription>
          </Alert>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Debug informatie:</h4>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>
          )}

          <div className="grid gap-3">
            <Button 
              onClick={resetErrorBoundary} 
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Probeer opnieuw
            </Button>
            
            <Button 
              onClick={handleReload} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Pagina herladen
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Ga naar startpagina
              </Link>
            </Button>
          </div>

          <div className="text-center space-y-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Probleem blijft bestaan?
            </p>
            <Button 
              onClick={handleReport}
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Rapporteer probleem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;