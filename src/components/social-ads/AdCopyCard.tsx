import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2 } from "lucide-react";
import { GeneratedAd, CampaignType, Audience } from "@/types/social-ads";

interface AdCopyCardProps {
  ad: GeneratedAd;
  campaignTypes: CampaignType[];
  audiences: Audience[];
  selectedCampaignType: string;
  copiedText: string;
  onCopyText: (text: string, type: string) => void;
}

export const AdCopyCard = ({
  ad,
  campaignTypes,
  audiences,
  selectedCampaignType,
  copiedText,
  onCopyText
}: AdCopyCardProps) => {
  const campaignLabel = campaignTypes.find(c => c.id === selectedCampaignType)?.label;
  const audienceDescription = audiences.find(a => a.id === ad.audience)?.description;

  const getCampaignBadgeStyles = (campaignType: string) => {
    const styles = {
      conversion: 'bg-orange-100 text-orange-700',
      leadgen: 'bg-green-100 text-green-700',
      retargeting: 'bg-purple-100 text-purple-700',
      awareness: 'bg-blue-100 text-blue-700'
    };
    return styles[campaignType] || styles.awareness;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Advertentie Tekst
          <Badge className={getCampaignBadgeStyles(selectedCampaignType)}>
            {campaignLabel}
          </Badge>
        </CardTitle>
        <CardDescription>
          Geoptimaliseerd voor {audienceDescription?.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg border max-h-80 overflow-y-auto">
            {ad.copy}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 flex items-center gap-1"
            onClick={() => onCopyText(ad.copy, ad.title)}
          >
            {copiedText === ad.copy ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copiedText === ad.copy ? "Gekopieerd!" : "Kopieer"}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Targeting Suggestie:</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              {ad.targeting}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-2">Call-to-Action:</h4>
            <Badge variant="outline" className="font-medium">
              {ad.cta}
            </Badge>
          </div>
        </div>

        <Button 
          className="w-full flex items-center gap-2"
          onClick={() => onCopyText(ad.copy, ad.title)}
        >
          <Copy className="h-4 w-4" />
          Kopieer Advertentie Tekst
        </Button>
      </CardContent>
    </Card>
  );
};