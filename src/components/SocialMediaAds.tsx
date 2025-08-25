import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Instagram, 
  Facebook, 
  Download,
  ImageIcon
} from "lucide-react";
import { useSocialAds } from "@/hooks/useSocialAds";
import { AdConfigPanel } from "@/components/social-ads/AdConfigPanel";
import { PerformanceMetrics } from "@/components/social-ads/PerformanceMetrics";
import { AdPreviewCard } from "@/components/social-ads/AdPreviewCard";
import { AdCopyCard } from "@/components/social-ads/AdCopyCard";

const SocialMediaAds = () => {
  const {
    // State
    selectedCampaignType,
    selectedAudience,
    selectedVariant,
    generatedMockups,
    generatingMockup,
    copiedText,
    
    // Data
    campaignTypes,
    audiences,
    variants,
    
    // Computed
    getCurrentAds,
    getPerformanceEstimate,
    
    // Actions
    updateCampaignType,
    updateAudience,
    updateVariant,
    copyToClipboard,
    generateMockup,
    generateAllMockups,
    downloadAdKit
  } = useSocialAds();

  const currentAds = getCurrentAds();
  const selectedAudienceData = audiences.find(a => a.id === selectedAudience);

  // Auto-generate mockups when settings change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      generateAllMockups();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [selectedCampaignType, selectedAudience, selectedVariant]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Instagram className="h-6 w-6 text-pink-500" />
          <Facebook className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">Social Media Advertenties</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Professionele advertenties voor Instagram en Facebook om AutoblogifyAI te promoten
        </p>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={downloadAdKit} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Complete Ad Kit
          </Button>
          
          <Button 
            variant="outline" 
            onClick={generateAllMockups}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Genereer Alle Mockups
          </Button>
        </div>
      </div>

      {/* Campaign Configuration */}
      <AdConfigPanel
        campaignTypes={campaignTypes}
        audiences={audiences}
        variants={variants}
        selectedCampaignType={selectedCampaignType}
        selectedAudience={selectedAudience}
        selectedVariant={selectedVariant}
        onCampaignTypeChange={updateCampaignType}
        onAudienceChange={updateAudience}
        onVariantChange={updateVariant}
      />

      {/* Performance Metrics */}
      <PerformanceMetrics
        ctr={getPerformanceEstimate('facebook-feed', 'ctr')}
        cpc={getPerformanceEstimate('facebook-feed', 'cpc')}
        conversionRate={getPerformanceEstimate(selectedCampaignType, 'conversion')}
        audienceLabel={selectedAudienceData?.label || ""}
      />

      {/* Ad Tabs */}
      <Tabs defaultValue="instagram-feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {currentAds.map(ad => (
            <TabsTrigger key={ad.platform} value={ad.platform} className="flex items-center gap-2">
              <ad.icon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {ad.platform === 'instagram-feed' ? 'IG Feed' :
                 ad.platform === 'instagram-story' ? 'IG Story' :
                 ad.platform === 'facebook-feed' ? 'FB Feed' : 'FB Video'}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {currentAds.map((ad) => {
          const mockupKey = `${ad.platform}-${selectedCampaignType}-${selectedAudience}-${selectedVariant}`;
          const mockupUrl = generatedMockups[mockupKey];
          const isGenerating = generatingMockup === mockupKey;

          return (
            <TabsContent key={ad.platform} value={ad.platform}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Preview Card */}
                <AdPreviewCard
                  ad={ad}
                  campaignTypes={campaignTypes}
                  audiences={audiences}
                  selectedCampaignType={selectedCampaignType}
                  selectedVariant={selectedVariant}
                  mockupUrl={mockupUrl}
                  isGenerating={isGenerating}
                  onGenerateMockup={() => generateMockup(ad.platform, ad)}
                  getPerformanceEstimate={getPerformanceEstimate}
                />

                {/* Copy Card */}
                <AdCopyCard
                  ad={ad}
                  campaignTypes={campaignTypes}
                  audiences={audiences}
                  selectedCampaignType={selectedCampaignType}
                  copiedText={copiedText}
                  onCopyText={copyToClipboard}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Best Practices */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Tips voor Optimale Resultaten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">📱 Instagram</h4>
              <ul className="space-y-2 text-sm">
                <li>• Gebruik visueel aantrekkelijke mockups</li>
                <li>• Voeg relevante hashtags toe (#contentmarketing, #ai)</li>
                <li>• Test verschillende story formaten</li>
                <li>• Gebruik interactieve elementen (polls, vragen)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">📘 Facebook</h4>
              <ul className="space-y-2 text-sm">
                <li>• Focus op de business value proposition</li>
                <li>• Gebruik social proof en testimonials</li>
                <li>• Test video vs. statische afbeeldingen</li>
                <li>• Optimaliseer voor verschillende doelgroepen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAds;