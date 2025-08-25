import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, AlertTriangle, Crown, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionManager } from "@/hooks/useSubscriptionManager";

interface CreditStatusBarProps {
  className?: string;
  showRefreshButton?: boolean;
}

export const CreditStatusBar = ({ className = "", showRefreshButton = true }: CreditStatusBarProps) => {
  const { user } = useAuth();
  const { checkCreditStatus, refreshCredits, isLoading } = useSubscriptionManager();
  const [creditStatus, setCreditStatus] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    if (!user) return;
    const status = await checkCreditStatus();
    if (status) {
      setCreditStatus(status);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCredits();
    await fetchStatus();
    setIsRefreshing(false);
  };

  if (!user || !creditStatus) {
    return null;
  }

  const { credits, subscription } = creditStatus;
  const remaining = credits.remaining || 0;
  const monthlyLimit = subscription.monthly_limit || 5;
  const usagePercentage = Math.round(((monthlyLimit - remaining) / monthlyLimit) * 100);
  
  const isLowCredits = remaining <= Math.floor(monthlyLimit * 0.2);
  const isVeryLowCredits = remaining <= Math.floor(monthlyLimit * 0.1);
  
  const getStatusColor = () => {
    if (isVeryLowCredits) return "from-red-50 to-orange-50 border-red-200";
    if (isLowCredits) return "from-yellow-50 to-orange-50 border-yellow-200";
    return "from-green-50 to-blue-50 border-green-200";
  };

  const getStatusText = () => {
    if (isVeryLowCredits) return "Kritiek laag";
    if (isLowCredits) return "Laag";
    return "Goed";
  };

  return (
    <Card className={`${getStatusColor()} shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Credits Info */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isVeryLowCredits ? 'bg-red-100' : isLowCredits ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <Coins className={`h-5 w-5 ${isVeryLowCredits ? 'text-red-600' : isLowCredits ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{remaining}</span>
                <span className="text-muted-foreground">van {monthlyLimit} credits</span>
                <Badge 
                  variant={subscription.subscribed ? "default" : "secondary"}
                  className="text-xs"
                >
                  {subscription.tier?.toUpperCase() || 'FREE'}
                </Badge>
                <Badge 
                  variant={isVeryLowCredits ? "destructive" : isLowCredits ? "secondary" : "default"}
                  className="text-xs"
                >
                  {getStatusText()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <Progress 
                  value={usagePercentage} 
                  className="flex-1 h-2" 
                />
                <span className="text-xs text-muted-foreground font-medium">
                  {usagePercentage}% gebruikt
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showRefreshButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="bg-white/50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            {isLowCredits && (
              <Button
                size="sm"
                variant={isVeryLowCredits ? "default" : "outline"}
                className={isVeryLowCredits ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Crown className="h-4 w-4 mr-1" />
                {isVeryLowCredits ? "Upgrade Nu" : "Upgrade"}
              </Button>
            )}
          </div>
        </div>

        {/* Reset Info */}
        {subscription.next_reset && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              📅 Credits verversen op: {new Date(subscription.next_reset).toLocaleDateString('nl-NL')}
            </p>
          </div>
        )}

        {/* Warning for very low credits */}
        {isVeryLowCredits && (
          <div className="mt-3 pt-2 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Let op: Je hebt nog maar {remaining} credits over!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};