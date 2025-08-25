import { 
  Instagram, 
  Facebook, 
  Eye,
  UserPlus,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { CampaignType, Audience, AdPlatform } from "@/types/social-ads";

export const campaignTypes: CampaignType[] = [
  { 
    id: "awareness", 
    label: "Brand Awareness", 
    icon: Eye, 
    color: "blue", 
    description: "Vergroot merkbekendheid" 
  },
  { 
    id: "leadgen", 
    label: "Lead Generation", 
    icon: UserPlus, 
    color: "green", 
    description: "Genereer kwaliteit leads" 
  },
  { 
    id: "conversion", 
    label: "Conversion", 
    icon: DollarSign, 
    color: "orange", 
    description: "Directe verkoop focus" 
  },
  { 
    id: "retargeting", 
    label: "Retargeting", 
    icon: RefreshCw, 
    color: "purple", 
    description: "Heractiveer bezoekers" 
  }
];

export const audiences: Audience[] = [
  { 
    id: "mkb", 
    label: "MKB Ondernemers", 
    description: "Kleine en middelgrote bedrijven" 
  },
  { 
    id: "agencies", 
    label: "Marketing Bureaus", 
    description: "Digital marketing agencies" 
  },
  { 
    id: "freelancers", 
    label: "Freelancers", 
    description: "Zelfstandige content creators" 
  },
  { 
    id: "enterprise", 
    label: "Enterprise", 
    description: "Grote organisaties" 
  }
];

export const adPlatforms: AdPlatform[] = [
  {
    platform: "instagram-feed",
    icon: Instagram,
    title: "Instagram Feed Post",
    dimensions: "1080x1080",
    visualDescription: "Moderne carousel met AutoblogifyAI dashboard screenshots, voor/na vergelijking, testimonial quotes overlay"
  },
  {
    platform: "instagram-story", 
    icon: Instagram,
    title: "Instagram Story",
    dimensions: "1080x1920",
    visualDescription: "Verticale animatie met swipe-up CTA, progress indicators, urgentie timer"
  },
  {
    platform: "facebook-feed",
    icon: Facebook,
    title: "Facebook Feed Post", 
    dimensions: "1200x630",
    visualDescription: "Professional hero image met conversion-focus, testimonials sidebar, duidelijke value proposition"
  },
  {
    platform: "facebook-video",
    icon: Facebook,
    title: "Facebook Video Ad",
    dimensions: "1200x1200", 
    visualDescription: "Screen recording met voice-over, pain points visualization, solution demo, strong CTA overlay"
  }
];

export const variants = ["A", "B", "C"];

// Ad content matrix - organized by platform -> campaign -> audience -> variant
export const adContentMatrix = {
  "instagram-feed": {
    awareness: {
      mkb: {
        A: {
          copy: `🚀 Kennis je AutoblogifyAI al?

Van Google Sheets naar SEO-proof blogs in minuten! Perfect voor drukke ondernemers die geen tijd hebben voor handmatig bloggen.

✅ 90% sneller dan traditioneel bloggen
✅ Automatische SEO optimalisatie  
✅ Direct naar WordPress
✅ Professionele resultaten

Over 500+ MKB bedrijven gebruiken AutoblogifyAI al voor hun content marketing.

Ontdek waarom → Link in bio

#mkb #contentmarketing #automatisering #seo #wordpress`,
          cta: "Ontdek AutoblogifyAI",
          targeting: "MKB eigenaren, 25-55 jaar, geïnteresseerd in marketing automation"
        },
        B: {
          copy: `📊 Nog steeds handmatig blogs schrijven?

AutoblogifyAI transformeert je spreadsheet data in complete SEO artikelen. Binnen 5 minuten heb je professionele content klaar voor publicatie.

🎯 Perfect voor MKB:
• Bespaar 15+ uur per week
• Consistente content kwaliteit  
• Automatische WordPress sync
• ROI tracking ingebouwd

"Onze content output is verdrievoudigd!" - Johan, MKB eigenaar

Start vandaag → Link in bio

#mkbgroei #contentautomation #tijdbesparing`,
          cta: "Probeer Gratis",
          targeting: "MKB eigenaren met 5-50 medewerkers, marketing budget €1000+"
        },
        C: {
          copy: `⚡ STOP met content chaos!

MKB ondernemers kiezen AutoblogifyAI omdat het:
→ Hun marketing tijd halveert
→ Meer leads genereert  
→ Professioneler oogt dan de concurrentie

Vandaag nog 50% korting voor nieuwe MKB klanten!
Gebruik code: MKB50

Claim je deal → Link in bio
⏰ Geldig t/m vrijdag

#mkbaanbieding #contentmarketing #specialedeal`,
          cta: "Claim 50% Korting",
          targeting: "Warme leads, bezoekers website laatste 30 dagen"
        }
      },
      agencies: {
        A: {
          copy: `🎯 Schaal je content productie op zonder extra overhead

AutoblogifyAI helpt agencies 10x meer content produceren met hetzelfde team. Van client spreadsheets naar publishable blogs in minuten.

✅ White-label oplossing
✅ Bulk processing voor meerdere clients
✅ API integratie mogelijk
✅ Marge-vriendelijke pricing

Bekijk onze agency case studies → Link in bio

#digitalagency #contentscaling #whitelabel #automation`,
          cta: "Bekijk Agency Oplossing",
          targeting: "Digital marketing agencies, 10-100 medewerkers"
        }
      }
    },
    leadgen: {
      mkb: {
        A: {
          copy: `🎁 GRATIS Content Audit voor MKB bedrijven!

Ontdek hoeveel tijd en geld je bespaart door je content te automatiseren. Onze experts analyseren je huidige workflow en tonen je het potentieel van AutoblogifyAI.

Wat krijg je:
✅ Persoonlijke demo (15 min)
✅ Content strategie review  
✅ ROI calculatie
✅ Implementatie roadmap

Slechts 10 plekken beschikbaar deze maand!

Claim je gratis audit ↓`,
          cta: "Claim Gratis Audit",
          targeting: "MKB beslissers, marketing managers"
        }
      }
    },
    conversion: {
      mkb: {
        A: {
          copy: `⚡ Laatste kans: 7 dagen gratis trial + setup

Duizenden MKB bedrijven automatiseren al hun content met AutoblogifyAI. Wordt jij de volgende?

🚀 Start vandaag met:
✅ Volledige setup door ons team
✅ 7 dagen unlimited gebruik
✅ Persoonlijke onboarding call
✅ Geld-terug-garantie

⏰ Aanbieding eindigt za 23:59

Waarom wachten? Start nu →`,
          cta: "Start 7-Dagen Trial",
          targeting: "Warme leads, demo bezoekers laatste 14 dagen"
        },
        B: {
          copy: `🔥 Dit weekend alleen: 60% korting + bonus

Als MKB ondernemer weet je hoe duur content kan zijn. Met AutoblogifyAI krijg je enterprise-level content voor een fractie van de kosten.

💰 Weekend Deal:
• 60% korting eerste jaar
• Gratis WordPress setup  
• Bonus: 50 premium templates
• Priority support

Timer loopt... ⏰

Mis deze deal niet →`,
          cta: "Pak De Deal",
          targeting: "Pricing page bezoekers, cart abandoners"
        }
      }
    }
  },
  "facebook-feed": {
    conversion: {
      mkb: {
        A: {
          copy: `🚀 Stop met dure contentbureaus - Automatiseer je content productie!

Als MKB ondernemer betaal je waarschijnlijk €2000+ per maand voor content. AutoblogifyAI doet hetzelfde voor minder dan €100.

💡 Resultaat na 30 dagen:
→ 75% minder content kosten
→ 3x sneller publiceren  
→ Betere SEO rankings
→ Meer website traffic

"We besparen €30.000 per jaar op content kosten!" - Sarah, webshop eigenaar

🎯 Speciale MKB actie: Eerste maand gratis + persoonlijke setup

Bereken je besparing in 2 minuten →

#mkbbesparing #contentautomation #kostenreductie #roi`,
          cta: "Bereken Je Besparing",
          targeting: "MKB, marketing budget €1000+, contentkosten"
        }
      }
    }
  }
};

// Performance estimates
export const performanceEstimates = {
  ctr: {
    'instagram-feed': { awareness: 1.2, leadgen: 2.1, conversion: 3.8, retargeting: 5.2 },
    'instagram-story': { awareness: 1.8, leadgen: 3.2, conversion: 4.5, retargeting: 6.1 },
    'facebook-feed': { awareness: 1.1, leadgen: 1.9, conversion: 3.2, retargeting: 4.8 },
    'facebook-video': { awareness: 2.1, leadgen: 3.8, conversion: 5.2, retargeting: 7.3 }
  },
  cpc: {
    'instagram-feed': { awareness: 0.85, leadgen: 1.25, conversion: 2.10, retargeting: 1.85 },
    'instagram-story': { awareness: 0.92, leadgen: 1.35, conversion: 2.25, retargeting: 1.95 },
    'facebook-feed': { awareness: 0.78, leadgen: 1.15, conversion: 1.95, retargeting: 1.75 },
    'facebook-video': { awareness: 1.05, leadgen: 1.45, conversion: 2.35, retargeting: 2.05 }
  },
  conversion: { 
    awareness: 0.8, 
    leadgen: 2.1, 
    conversion: 4.5, 
    retargeting: 8.2 
  }
};