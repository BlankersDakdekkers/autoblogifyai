import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ImageIcon, Loader2 } from "lucide-react";
import { GeneratedAd, CampaignType, Audience } from "@/types/social-ads";

interface AdPreviewCardProps {
  ad: GeneratedAd;
  campaignTypes: CampaignType[];
  audiences: Audience[];
  selectedCampaignType: string;
  selectedVariant: string;
  mockupUrl?: string;
  isGenerating: boolean;
  onGenerateMockup: () => void;
  getPerformanceEstimate: (platform: string, metric: 'ctr' | 'cpc' | 'conversion') => number;
}

export const AdPreviewCard = ({
  ad,
  campaignTypes,
  audiences,
  selectedCampaignType,
  selectedVariant,
  mockupUrl,
  isGenerating,
  onGenerateMockup,
  getPerformanceEstimate
}: AdPreviewCardProps) => {
  const campaignLabel = campaignTypes.find(c => c.id === selectedCampaignType)?.label;
  const audienceLabel = audiences.find(a => a.id === ad.audience)?.label;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ad.icon className="h-5 w-5" />
            {ad.title}
          </div>
          <Badge variant="outline">
            {campaignLabel} - Variant {selectedVariant}
          </Badge>
        </CardTitle>
        <CardDescription>
          Afmetingen: {ad.dimensions} • {audienceLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Visual Mockup */}
        <div 
          className={`
            relative overflow-hidden
            border border-primary/20 rounded-lg mb-4 
            flex flex-col items-center justify-center
            ${ad.platform.includes('story') ? 'aspect-[9/16] max-h-96' : 
              ad.platform.includes('video') ? 'aspect-square' : 'aspect-video'}
          `}
        >
          {mockupUrl ? (
            <img 
              src={mockupUrl}
              alt={`${ad.title} mockup`}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : isGenerating ? (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Mockup genereren...</p>
            </div>
          ) : (
            <div 
              className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={onGenerateMockup}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AutoblogifyAI</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {ad.visualDescription}
                  </p>
                  <Button size="sm" className="mt-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Genereer Mockup
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* CTA Overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button size="sm" variant="secondary" className="shadow-lg">
              <ArrowRight className="h-4 w-4 mr-1" />
              {ad.cta}
            </Button>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-semibold text-blue-600">
              {getPerformanceEstimate(ad.platform, 'ctr')}%
            </div>
            <div className="text-muted-foreground">CTR</div>
          </div>
          <div>
            <div className="font-semibold text-green-600">
              €{getPerformanceEstimate(ad.platform, 'cpc')}
            </div>
            <div className="text-muted-foreground">CPC</div>
          </div>
          <div>
            <div className="font-semibold text-purple-600">
              {getPerformanceEstimate(ad.platform, 'conversion')}%
            </div>
            <div className="text-muted-foreground">Conv</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};