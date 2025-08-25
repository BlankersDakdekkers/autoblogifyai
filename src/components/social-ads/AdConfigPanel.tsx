import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { CampaignType, Audience } from "@/types/social-ads";

interface AdConfigPanelProps {
  campaignTypes: CampaignType[];
  audiences: Audience[];
  variants: string[];
  selectedCampaignType: string;
  selectedAudience: string;
  selectedVariant: string;
  onCampaignTypeChange: (value: string) => void;
  onAudienceChange: (value: string) => void;
  onVariantChange: (value: string) => void;
}

export const AdConfigPanel = ({
  campaignTypes,
  audiences,
  variants,
  selectedCampaignType,
  selectedAudience,
  selectedVariant,
  onCampaignTypeChange,
  onAudienceChange,
  onVariantChange
}: AdConfigPanelProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Campagne Configuratie
        </CardTitle>
        <CardDescription>
          Kies je campagne type, doelgroep en variant voor gepersonaliseerde advertenties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Campaign Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Campagne Doel</label>
            <Select value={selectedCampaignType} onValueChange={onCampaignTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {campaignTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audience */}
          <div>
            <label className="text-sm font-medium mb-2 block">Doelgroep</label>
            <Select value={selectedAudience} onValueChange={onAudienceChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map(audience => (
                  <SelectItem key={audience.id} value={audience.id}>
                    <div>
                      <div className="font-medium">{audience.label}</div>
                      <div className="text-xs text-muted-foreground">{audience.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variant */}
          <div>
            <label className="text-sm font-medium mb-2 block">A/B Test Variant</label>
            <Select value={selectedVariant} onValueChange={onVariantChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variants.map(variant => (
                  <SelectItem key={variant} value={variant}>
                    Variant {variant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campaign Type Visual Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          {campaignTypes.map(type => (
            <div 
              key={type.id}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all 
                ${selectedCampaignType === type.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'}
              `}
              onClick={() => onCampaignTypeChange(type.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <type.icon className="h-5 w-5" />
                <span className="font-medium text-sm">{type.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {type.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};