export interface CampaignType {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

export interface Audience {
  id: string;
  label: string;
  description: string;
}

export interface AdContent {
  copy: string;
  cta: string;
  targeting: string;
}

export interface AdPlatform {
  platform: string;
  icon: any;
  title: string;
  dimensions: string;
  visualDescription: string;
}

export interface GeneratedAd extends AdPlatform {
  copy: string;
  cta: string;
  targeting: string;
  campaignType: string;
  audience: string;
  variant: string;
}

export interface PerformanceEstimates {
  ctr: number;
  cpc: number;
  conversionRate: number;
}

export interface MockupState {
  [key: string]: string;
}

export interface SocialAdsState {
  selectedCampaignType: string;
  selectedAudience: string;
  selectedVariant: string;
  generatedMockups: MockupState;
  generatingMockup: string | null;
  copiedText: string;
}