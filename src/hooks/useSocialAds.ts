import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SocialAdsState, AdContent, GeneratedAd } from "@/types/social-ads";
import { 
  campaignTypes, 
  audiences, 
  adPlatforms, 
  variants,
  adContentMatrix,
  performanceEstimates 
} from "@/data/social-ads-content";

export const useSocialAds = () => {
  const { toast } = useToast();
  
  const [state, setState] = useState<SocialAdsState>({
    selectedCampaignType: "conversion",
    selectedAudience: "mkb",
    selectedVariant: "A",
    generatedMockups: {},
    generatingMockup: null,
    copiedText: ""
  });

  const updateCampaignType = useCallback((campaignType: string) => {
    setState(prev => ({ ...prev, selectedCampaignType: campaignType }));
  }, []);

  const updateAudience = useCallback((audience: string) => {
    setState(prev => ({ ...prev, selectedAudience: audience }));
  }, []);

  const updateVariant = useCallback((variant: string) => {
    setState(prev => ({ ...prev, selectedVariant: variant }));
  }, []);

  const getAdContent = useCallback((platform: string): AdContent => {
    const defaultContent = {
      copy: "Content wordt geladen...",
      cta: "Meer Info",
      targeting: "Algemene doelgroep"
    };

    const content = adContentMatrix[platform]?.[state.selectedCampaignType]?.[state.selectedAudience]?.[state.selectedVariant];
    return content || defaultContent;
  }, [state.selectedCampaignType, state.selectedAudience, state.selectedVariant]);

  const getCurrentAds = useCallback((): GeneratedAd[] => {
    return adPlatforms.map(platform => {
      const content = getAdContent(platform.platform);
      return {
        ...platform,
        ...content,
        campaignType: state.selectedCampaignType,
        audience: state.selectedAudience,
        variant: state.selectedVariant
      };
    });
  }, [getAdContent, state.selectedCampaignType, state.selectedAudience, state.selectedVariant]);

  const getPerformanceEstimate = useCallback((platform: string, metric: 'ctr' | 'cpc' | 'conversion') => {
    if (metric === 'conversion') {
      return performanceEstimates.conversion[state.selectedCampaignType] || 2.0;
    }
    return performanceEstimates[metric][platform]?.[state.selectedCampaignType] || (metric === 'ctr' ? 2.0 : 1.50);
  }, [state.selectedCampaignType]);

  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setState(prev => ({ ...prev, copiedText: text }));
    toast({
      title: "Gekopieerd!",
      description: `${type} tekst is gekopieerd naar het klembord`,
    });
    setTimeout(() => {
      setState(prev => ({ ...prev, copiedText: "" }));
    }, 2000);
  }, [toast]);

  const generateMockup = useCallback(async (platform: string, adContent: GeneratedAd): Promise<string | null> => {
    const mockupKey = `${platform}-${state.selectedCampaignType}-${state.selectedAudience}-${state.selectedVariant}`;
    
    if (state.generatedMockups[mockupKey]) {
      return state.generatedMockups[mockupKey];
    }
    
    setState(prev => ({ ...prev, generatingMockup: mockupKey }));
    
    try {
      let mockupPrompt = "";
      let dimensions = { width: 1080, height: 1080 };
      
      switch (platform) {
        case "instagram-feed":
          dimensions = { width: 1080, height: 1080 };
          mockupPrompt = `Professional Instagram feed post mockup for AutoblogifyAI content automation tool. Modern mobile interface showing: AutoblogifyAI logo and branding, dashboard screenshot with Google Sheets data transforming into blog posts, clean blue and white design, social media UI elements, engagement metrics, professional business tool aesthetic, mobile-first design, ${adContent.cta} call-to-action button prominently displayed. Ultra high resolution, clean and modern design.`;
          break;
          
        case "instagram-story":
          dimensions = { width: 1080, height: 1920 };
          mockupPrompt = `Vertical Instagram story mockup for AutoblogifyAI automation tool. 9:16 aspect ratio showing: animated progression from spreadsheet to published blog, swipe-up indicator, AutoblogifyAI branding, modern mobile UI, progress indicators, time-saving visualization, "${adContent.cta}" button at bottom, urgency elements, professional business tool, clean modern design. Ultra high resolution, mobile-optimized.`;
          break;
          
        case "facebook-feed":
          dimensions = { width: 1200, height: 630 };
          mockupPrompt = `Facebook feed advertisement mockup for AutoblogifyAI business tool. Professional landscape format showing: AutoblogifyAI dashboard interface, before/after content transformation visualization, business professional using laptop, clean corporate design, testimonial quotes overlay, ROI statistics, "${adContent.cta}" prominent call-to-action, blue and white color scheme, professional business aesthetic. Ultra high resolution.`;
          break;
          
        case "facebook-video":
          dimensions = { width: 1200, height: 1200 };
          mockupPrompt = `Square Facebook video advertisement thumbnail for AutoblogifyAI. Screen recording preview showing: computer screen with AutoblogifyAI interface, CSV file upload process, AI content generation in progress, WordPress publishing workflow, play button overlay, "${adContent.cta}" text overlay, professional business environment, modern office setup, time-lapse effect visualization. Ultra high resolution.`;
          break;
      }
      
      const { data, error } = await supabase.functions.invoke('generate-social-mockups', {
        body: {
          prompt: mockupPrompt,
          width: dimensions.width,
          height: dimensions.height,
          platform,
          campaignType: state.selectedCampaignType,
          audience: state.selectedAudience
        }
      });

      if (error || !data?.success || !data?.imageUrl) {
        throw new Error('Failed to generate mockup image');
      }
      
      setState(prev => ({
        ...prev,
        generatedMockups: {
          ...prev.generatedMockups,
          [mockupKey]: data.imageUrl
        }
      }));
      
      return data.imageUrl;
      
    } catch (error) {
      console.error('Error generating mockup:', error);
      toast({
        title: "Mockup generatie mislukt",
        description: "Er is een fout opgetreden bij het genereren van de mockup",
        variant: "destructive",
      });
      return null;
    } finally {
      setState(prev => ({ ...prev, generatingMockup: null }));
    }
  }, [state.selectedCampaignType, state.selectedAudience, state.selectedVariant, state.generatedMockups, toast]);

  const generateAllMockups = useCallback(async () => {
    const ads = getCurrentAds();
    for (const ad of ads) {
      await generateMockup(ad.platform, ad);
    }
    toast({
      title: "Mockups gegenereerd!",
      description: "Alle advertentie mockups zijn bijgewerkt",
    });
  }, [getCurrentAds, generateMockup, toast]);

  const downloadAdKit = useCallback(() => {
    const selectedCampaign = campaignTypes.find(c => c.id === state.selectedCampaignType);
    const selectedAud = audiences.find(a => a.id === state.selectedAudience);
    const currentAds = getCurrentAds();
    
    const adKit = currentAds.map(ad => (
      `=== ${ad.title.toUpperCase()} - ${selectedCampaign?.label} - ${selectedAud?.label} - Variant ${state.selectedVariant} ===
Afmetingen: ${ad.dimensions}
Platform: ${ad.platform}
Campagne Type: ${selectedCampaign?.label}
Doelgroep: ${selectedAud?.label}
Variant: ${state.selectedVariant}

COPY:
${ad.copy}

VISUEEL CONCEPT:
${ad.visualDescription}

CALL-TO-ACTION:
${ad.cta}

TARGETING SUGGESTIE:
${ad.targeting}

VERWACHTE METRICS:
- CTR: ${getPerformanceEstimate(ad.platform, 'ctr')}%
- CPC: €${getPerformanceEstimate(ad.platform, 'cpc')}
- Conversion Rate: ${getPerformanceEstimate(ad.platform, 'conversion')}%

=====================================

`
    )).join('\n');

    const blob = new Blob([adKit], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoblogifyAI-${selectedCampaign?.label}-${selectedAud?.label}-Variant-${state.selectedVariant}-Ad-Kit.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Ad Kit Gedownload!",
      description: `${selectedCampaign?.label} advertenties voor ${selectedAud?.label} zijn gedownload`,
    });
  }, [state, getCurrentAds, getPerformanceEstimate, toast]);

  return {
    // State
    ...state,
    
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
  };
};