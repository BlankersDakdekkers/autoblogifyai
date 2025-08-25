import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";

interface PerformanceMetricsProps {
  ctr: number;
  cpc: number;
  conversionRate: number;
  audienceLabel: string;
}

export const PerformanceMetrics = ({ 
  ctr, 
  cpc, 
  conversionRate, 
  audienceLabel 
}: PerformanceMetricsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-blue-600">
          {ctr}%
        </div>
        <div className="text-sm text-muted-foreground">Verwachte CTR</div>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-green-600">
          €{cpc}
        </div>
        <div className="text-sm text-muted-foreground">Gemiddelde CPC</div>
      </div>
      
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-purple-600">
          {conversionRate}%
        </div>
        <div className="text-sm text-muted-foreground">Conversie Ratio</div>
      </div>
      
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <div className="text-2xl font-bold text-orange-600">
          {audienceLabel.split(' ')[0]}
        </div>
        <div className="text-sm text-muted-foreground">Doelgroep</div>
      </div>
    </div>
  );
};