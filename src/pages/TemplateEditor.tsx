import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Eye, 
  Save, 
  Copy, 
  Download,
  Upload,
  Edit,
  Plus,
  Wand2,
  Code,
  Settings,
  Trash2,
  Star,
  Crown,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Palette,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "blog" | "service" | "landing" | "email" | "social";
  content: string;
  variables: string[];
  tags: string[];
  isPublic: boolean;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  author: string;
  createdAt: string;
}

const TemplateEditor = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<Partial<Template>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Wizard steps for better UX
  const steps = [
    { id: 1, title: "Template Info", description: "Basisinformatie", icon: FileText },
    { id: 2, title: "Content", description: "Template inhoud", icon: Edit },
    { id: 3, title: "Variabelen", description: "Dynamische velden", icon: Zap },
    { id: 4, title: "Instellingen", description: "Configuratie", icon: Settings },
    { id: 5, title: "Preview", description: "Voorbeeld", icon: Eye }
  ];

  // Predefined variable suggestions
  const variableSuggestions = [
    { name: "title", description: "Hoofdtitel van de content", example: "{{title}}" },
    { name: "city", description: "Stad of locatie", example: "{{city}}" },
    { name: "service", description: "Service of product", example: "{{service}}" },
    { name: "phone", description: "Telefoonnummer", example: "{{phone}}" },
    { name: "company_name", description: "Bedrijfsnaam", example: "{{company_name}}" },
    { name: "price", description: "Prijs informatie", example: "{{price}}" },
    { name: "date", description: "Datum", example: "{{date}}" },
    { name: "author", description: "Auteur naam", example: "{{author}}" }
  ];

  // Template starters for different categories
  const templateStarters = {
    blog: `# {{title}} | {{city}} - Professionele {{service}}

> **💡 Tip:** Dit artikel helpt u {{problem_description}} op te lossen

## Inleiding
Bent u op zoek naar {{service}} in {{city}}? Dan bent u bij ons aan het juiste adres. Met meer dan {{years_experience}} jaar ervaring weten wij precies hoe we u het beste kunnen helpen.

## {{main_topic}} - Wat u Moet Weten

{{main_content}}

### Waarom is dit Belangrijk?
- **Kwaliteit:** {{quality_reason}}
- **Snelheid:** {{speed_reason}}  
- **Expertise:** {{expertise_reason}}

## Veelgestelde Vragen

**Q: {{faq_question_1}}**
A: {{faq_answer_1}}

**Q: {{faq_question_2}}**  
A: {{faq_answer_2}}

## Klaar voor Actie?

{{conclusion_text}} Neem vandaag nog contact met ons op voor een **gratis offerte** zonder verplichtingen.

**📞 Direct bereikbaar:** {{phone}}
**✉️ Of mail naar:** {{email}}

*{{company_name}} - Uw betrouwbare partner sinds {{founded_year}}*`,
    
    landing: `# 🎯 {{headline}}

---

## 😰 Herkenbaar? Dit Probleem Heeft Iedereen...

{{problem_description}}

**Gevolgen als u niets doet:**
- ❌ {{negative_consequence_1}}
- ❌ {{negative_consequence_2}}  
- ❌ {{negative_consequence_3}}

---

## ✨ Wij Hebben DE Oplossing!

{{solution_description}}

**Resultaat na onze aanpak:**
- ✅ {{positive_result_1}}
- ✅ {{positive_result_2}}
- ✅ {{positive_result_3}}

---

## 🏆 Waarom {{customer_count}}+ Klanten Voor Ons Kiezen

### ⭐ {{benefit_1}}
{{benefit_1_explanation}}

### ⭐ {{benefit_2}}  
{{benefit_2_explanation}}

### ⭐ {{benefit_3}}
{{benefit_3_explanation}}

---

## 💬 Wat Onze Klanten Zeggen

> *"{{testimonial_quote}}"*  
> **- {{testimonial_name}}, {{testimonial_location}}**

⭐⭐⭐⭐⭐ **{{rating}}/5 sterren** (gebaseerd op {{review_count}} reviews)

---

## 🚀 {{cta_text}}

### 🎁 **BEPERKTE TIJD:** {{special_offer}}

**📞 Bel direct:** [{{phone}}](tel:{{phone}})  
**✉️ Of mail:** [{{email}}](mailto:{{email}})

*Reactie binnen 2 uur gegarandeerd • {{guarantee_text}}*`,

    email: `Onderwerp: {{subject}} | {{company_name}}

Beste {{first_name}},

{{intro_text}}

## Waarom deze email?
{{reason_for_email}}

## Wat betekent dit voor u?
{{main_message}}

### Uw voordelen:
✅ {{benefit_1}}  
✅ {{benefit_2}}
✅ {{benefit_3}}

## Volgende stap
{{next_step_instruction}}

**Direct actie ondernemen?**
📞 Bel: {{phone}}
✉️ Mail: {{email}}
🌐 Website: {{website}}

---

Met vriendelijke groet,

**{{sender_name}}**  
{{job_title}}  
{{company_name}}  

*P.S. {{ps_message}}*`,

    social: `🔥 {{headline}}

{{description}}

💡 **Waarom dit belangrijk is:**
{{why_important}}

🎯 **Resultaat:**  
{{expected_result}}

👆 **Actie vereist:**
{{call_to_action}}

💬 Reageer met "{{response_keyword}}" voor meer info!

#{{hashtag1}} #{{hashtag2}} #{{hashtag3}}
#{{location_hashtag}} #{{industry_hashtag}}`
  };

  const templates: Template[] = [
    {
      id: "seo-blog-nl",
      name: "SEO Blog Post - Nederland",
      description: "Geoptimaliseerd voor Nederlandse markt met lokale SEO focus",
      category: "blog",
      content: templateStarters.blog,
      variables: ["title", "city", "topic", "service", "main_content", "phone"],
      tags: ["seo", "nederland", "lokaal", "blog"],
      isPublic: true,
      isPremium: false,
      usageCount: 1247,
      rating: 4.8,
      author: "SEO Expert",
      createdAt: "2025-01-18"
    },
    {
      id: "service-page-pro",
      name: "Dienstenpagina Pro - Lokale Dienstverlener",
      description: "Complete servicepagina template met prijzen, werkgebied, FAQ en contactgegevens",
      category: "service",
      content: `# {{service_title}} in {{city}} | {{company_name}}

## ⭐ {{years_experience}} Jaar Ervaring | {{customer_count}}+ Tevreden Klanten

---

## 🎯 Onze {{service_type}} Diensten

### Wat Wij Doen
{{service_description}}

### Onze Specialisaties:
✅ {{specialization_1}}
✅ {{specialization_2}}  
✅ {{specialization_3}}
✅ {{specialization_4}}

---

## 🌍 Werkgebied

**Wij werken in {{city}} en omgeving:**
- {{area_1}}
- {{area_2}}
- {{area_3}}
- {{area_4}}

*Twijfelt u of wij bij u in de buurt werken? Bel {{phone}} voor informatie.*

---

## 💰 Transparante Prijzen

| Service | Prijs vanaf | Duur |
|---------|-------------|------|
| {{service_1}} | €{{price_1}} | {{duration_1}} |
| {{service_2}} | €{{price_2}} | {{duration_2}} |
| {{service_3}} | €{{price_3}} | {{duration_3}} |

> **💡 Gratis offerte:** Exacte prijs krijgt u na onze gratis inspectie

---

## 🏆 Waarom Kiezen Voor {{company_name}}?

### ⚡ {{benefit_1}}
{{benefit_1_description}}

### 🛡️ {{benefit_2}}  
{{benefit_2_description}}

### 👨‍🔧 {{benefit_3}}
{{benefit_3_description}}

### 📞 {{benefit_4}}
{{benefit_4_description}}

---

## 📝 Hoe Wij Werken

**1️⃣ Contact & Afspraak**  
{{step_1_description}}

**2️⃣ Gratis Inspectie**  
{{step_2_description}}

**3️⃣ Offerte & Planning**  
{{step_3_description}}

**4️⃣ Professionele Uitvoering**  
{{step_4_description}}

**5️⃣ Nazorg & Garantie**  
{{step_5_description}}

---

## 💬 Wat Onze Klanten Zeggen

### ⭐⭐⭐⭐⭐ {{rating}}/5 Sterren

> *"{{testimonial_1}}"*  
> **- {{customer_1}}, {{location_1}}**

> *"{{testimonial_2}}"*  
> **- {{customer_2}}, {{location_2}}**

[Lees alle {{review_count}} reviews →](#reviews)

---

## ❓ Veelgestelde Vragen

### {{faq_question_1}}
{{faq_answer_1}}

### {{faq_question_2}}
{{faq_answer_2}}

### {{faq_question_3}}
{{faq_answer_3}}

### {{faq_question_4}}
{{faq_answer_4}}

---

## 🚨 Spoeddienst Beschikbaar

**Noodsituatie? Wij zijn er voor u!**

📞 **Spoed telefoon:** {{emergency_phone}}  
⏰ **24/7 bereikbaar** voor noodgevallen  
🚗 **Binnen {{response_time}} ter plaatse**

---

## 📞 Contact & Offerte

### Direct Contact
**Telefoon:** [{{phone}}](tel:{{phone}})  
**WhatsApp:** [{{whatsapp}}](https://wa.me/{{whatsapp}})  
**Email:** [{{email}}](mailto:{{email}})

### Bezoekadres  
{{address}}  
{{postal_code}} {{city}}

### Openingstijden
{{opening_hours}}

---

## 🎁 Actie: {{special_offer}}

**{{cta_text}}**

[📞 Bel Direct](tel:{{phone}}) | [💬 WhatsApp](https://wa.me/{{whatsapp}}) | [✉️ Mail Ons](mailto:{{email}})

*Reactie gegarandeerd binnen {{response_guarantee}}*`,
      variables: ["service_title", "city", "company_name", "years_experience", "customer_count", "service_type", "service_description", "specialization_1", "specialization_2", "specialization_3", "specialization_4", "phone", "email"],
      tags: ["diensten", "lokaal", "business", "contact"],
      isPublic: true,
      isPremium: true,
      usageCount: 892,
      rating: 4.9,
      author: "Business Expert",
      createdAt: "2025-01-18"
    },
    {
      id: "service-landing-page",
      name: "Service Landing Page",
      description: "Conversie-geoptimaliseerde landingspagina voor lokale diensten",
      category: "landing",
      content: templateStarters.landing,
      variables: ["headline", "problem_description", "solution_description", "benefit_1", "benefit_2", "benefit_3", "cta_text", "phone", "email"],
      tags: ["conversie", "landing", "service", "lokaal"],
      isPublic: true,
      isPremium: true,
      usageCount: 892,
      rating: 4.9,
      author: "Conversion Expert",
      createdAt: "2025-01-18"
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Debug logging
  console.log('Templates available:', templates.length);
  console.log('Filtered templates:', filteredTemplates.length);
  console.log('IsEditing:', isEditing);
  console.log('Selected template:', selectedTemplate?.name);
  console.log('Current step:', currentStep);

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(editingTemplate.name && editingTemplate.category);
      case 2:
        return !!(editingTemplate.content && editingTemplate.content.length > 10);
      case 3:
        return true; // Variables are optional
      case 4:
        return true; // Settings are optional
      case 5:
        return true; // Preview is just viewing
      default:
        return false;
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = editingTemplate.content || '';
      const newContent = currentContent.substring(0, start) + `{{${variable}}}` + currentContent.substring(end);
      
      setEditingTemplate(prev => ({ ...prev, content: newContent }));
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const startNewTemplate = (category?: string, withStarter: boolean = false) => {
    const content = withStarter && category ? templateStarters[category as keyof typeof templateStarters] : "";
    
    setSelectedTemplate(null);
    setEditingTemplate({
      name: "",
      description: "",
      category: (category as any) || "blog",
      content: content,
      tags: [],
      isPublic: true,
      isPremium: false
    });
    setCurrentStep(1);
    setIsEditing(true);
    setIsDialogOpen(false);
    
    toast({
      title: "Wizard gestart!",
      description: withStarter ? 
        `Template wizard gestart met ${category} starter` : 
        "Template wizard gestart met leeg template"
    });
  };

  // Uitgebreide sample data voor professionele preview inclusief service pagina
  const sampleData = {
    // Basis informatie
    title: "Dakdekker Amsterdam - Professionele Dakwerkzaamheden & Renovatie",
    city: "Amsterdam", 
    service: "dakdekker diensten",
    company_name: "DakPro Amsterdam",
    phone: "020-1234567",
    email: "info@dakpro-amsterdam.nl",
    website: "www.dakpro-amsterdam.nl",
    
    // Service pagina specifiek
    service_title: "Professionele Dakdekkersdiensten",
    service_type: "dakdekker",
    service_description: "Van kleine reparaties tot complete dakrenovaties - wij zorgen voor een waterdicht en duurzaam resultaat. Onze gecertificeerde vakmannen werken uitsluitend met A-merk materialen en bieden 15 jaar garantie.",
    
    // Specialisaties
    specialization_1: "Daklekkage reparatie & noodhulp",
    specialization_2: "Complete dakbedekking (pannen, bitumen, EPDM)",
    specialization_3: "Dakisolatie & energiezuinige oplossingen", 
    specialization_4: "Dakgoot installatie & onderhoud",
    
    // Werkgebied
    area_1: "Amsterdam Centrum & Zuid",
    area_2: "Amstelveen & Uithoorn",
    area_3: "Diemen & Duivendrecht",
    area_4: "Ouderkerk & Abcoude",
    
    // Prijzen & diensten
    service_1: "Daklekkage reparatie",
    price_1: "125",
    duration_1: "1-2 uur",
    service_2: "Dakbedekking vernieuwen",
    price_2: "85/m²", 
    duration_2: "2-5 dagen",
    service_3: "Dakisolatie plaatsing",
    price_3: "45/m²",
    duration_3: "1-2 dagen",
    
    // Werkwijze stappen
    step_1_description: "Binnen 2 uur teruggebeld, afspraak binnen 24 uur mogelijk",
    step_2_description: "Grondige inspectie van uw dak met meetrapport en foto's",
    step_3_description: "Gedetailleerde offerte met materialen en arbeidskosten",
    step_4_description: "Vakkundige uitvoering door gecertificeerde specialisten",
    step_5_description: "15 jaar garantie + jaarlijkse controle op afspraak",
    
    // Contact & locatie
    address: "Herengracht 123",
    postal_code: "1015 BE",
    opening_hours: "Ma-Vr: 07:00-18:00 | Za: 08:00-16:00",
    whatsapp: "31201234567",
    emergency_phone: "06-12345678",
    response_time: "2 uur",
    response_guarantee: "2 uur",
    
    // Landing page specifiek
    headline: "🏠 Daklek? Wij Lossen Het Vandaag Nog Op!",
    problem_description: "Heeft u last van een lekkend dak, losliggende dakpannen of verouderde dakbedekking? Dit kan leiden tot kostbare waterschade, schimmel en structurele problemen aan uw woning.",
    solution_description: "Onze gecertificeerde dakspecialisten komen binnen 4 uur ter plaatse en bieden directe noodoplossingen. Van kleine reparaties tot complete dakrenovaties - wij zorgen voor een waterdicht resultaat.",
    
    // Verbeterde benefits
    benefit_1: "24/7 Spoeddienst - Ook in weekenden",
    benefit_1_explanation: "Dakproblemen wachten niet op kantooruren. Onze nooddienst is 24/7 bereikbaar voor urgente reparaties.",
    benefit_1_description: "Onze spoeddienst is 24 uur per dag bereikbaar voor noodgevallen. Weekend, avond of feestdag - wij staan altijd voor u klaar.",
    benefit_2: "15 jaar garantie op alle werkzaamheden", 
    benefit_2_explanation: "Wij staan achter ons werk met de langste garantieperiode in Amsterdam - 15 jaar volledige dekking.",
    benefit_2_description: "Als enige in Amsterdam bieden wij 15 jaar volledige garantie op materiaal én vakmanschap. Uw zekerheid is onze trots.",
    benefit_3: "Gratis inspectie & offerte binnen 2 uur",
    benefit_3_explanation: "Onze experts komen langs voor een grondige dakinsectie en uitgebreide offerte, volledig kosteloos.",
    benefit_3_description: "Binnen 2 uur na uw telefoontje staat onze specialist bij u op de stoep voor een gratis, vrijblijvende inspectie.",
    benefit_4: "Ervaren vakmanschap sinds 1998",
    benefit_4_description: "Met 25 jaar ervaring en meer dan 5.000 tevreden klanten bent u verzekerd van vakkundig en betrouwbaar werk.",
    
    // Testimonials uitgebreid
    testimonial_1: "Binnen 3 uur was mijn daklek verholpen. Professioneel, snel en netjes opgeruimd. Absolute aanrader!",
    customer_1: "Maria van der Berg",
    location_1: "Amsterdam Zuid",
    testimonial_2: "Complete dakvernieuwing volgens planning en budget. Team werkt zeer netjes en communiceert uitstekend.",
    customer_2: "Johan Vermeer", 
    location_2: "Amstelveen",
    
    // FAQ uitgebreid  
    faq_question_1: "Hoe snel kunnen jullie langskomen bij een noodgeval?",
    faq_answer_1: "Bij spoedgevallen komen we binnen 2-4 uur ter plaatse, ook 's avonds en in weekenden. Voor normale werkzaamheden plannen we binnen 48 uur een afspraak.",
    faq_question_2: "Welke garantie krijg ik op de werkzaamheden?", 
    faq_answer_2: "Wij geven 15 jaar garantie op alle dakwerkzaamheden. Dit is de langste garantieperiode in Amsterdam en toont ons vertrouwen in de kwaliteit.",
    faq_question_3: "Werken jullie ook met verzekeringen?",
    faq_answer_3: "Ja, wij hebben ervaring met alle grote verzekeraars en helpen u graag bij het afhandelen van schadeformulieren en declaraties.",
    faq_question_4: "Kan ik een kostenloze offerte krijgen?",
    faq_answer_4: "Absoluut! Elke inspectie en offerte is volledig gratis en vrijblijvend. U betaalt alleen als u ons de opdracht geeft.",
    
    // Gevolgen en resultaten
    negative_consequence_1: "Waterschade kan oplopen tot €25.000+",
    negative_consequence_2: "Schimmelvorming bedreigt uw gezondheid", 
    negative_consequence_3: "Waardevermindering van uw woning met 10-15%",
    positive_result_1: "100% waterdicht dak met 15 jaar garantie",
    positive_result_2: "Waardeverhoging woning tot €35.000",
    positive_result_3: "Energiebesparing tot 40% door isolatie",
    
    // CTA en aanbiedingen
    cta_text: "Bel Nu Voor Gratis Spoedinsectie", 
    special_offer: "Geen voorrijdkosten + 20% korting bij opdracht deze maand",
    customer_count: "1.200",
    rating: "4.9",
    review_count: "347",
    guarantee_text: "15 jaar garantie & tevredenheidsgarantie",
    
    // Testimonial
    testimonial_quote: "Binnen 3 uur was mijn daklek verholpen. Professioneel, snel en netjes opgeruimd. Absolute aanrader!",
    testimonial_name: "Maria van der Berg",
    testimonial_location: "Amsterdam Zuid",
    
    // Blog specifiek  
    topic: "daklekkage repareren",
    main_topic: "Daklekkage Herkennen & Voorkomen",
    main_content: "Een lekkend dak is meer dan alleen een ongemak - het kan binnen enkele maanden duizenden euro's schade aanrichten. Vroege signalen zijn: vochtige plekken op het plafond, schimmelgeur, of dakpannen die zijn verschoven na storm. Onze ervaring leert dat 80% van de dakproblemen voorkomen had kunnen worden met tijdig onderhoud.",
    years_experience: "25",
    founded_year: "1998",
    quality_reason: "Alleen A-merk materialen en gecertificeerde monteurs",
    speed_reason: "Gemiddelde responstijd van 2,5 uur binnen Amsterdam", 
    expertise_reason: "Gespecialiseerd in monumentale panden én moderne woningen",
    conclusion_text: "Wacht niet tot een klein probleem een grote reparatie wordt.",
    
    // Email specifiek
    subject: "Uw dakprobleem opgelost binnen 24 uur - Gratis inspectie",
    first_name: "Meneer/Mevrouw",
    intro_text: "Wij begrijpen dat dakproblemen stress veroorzaken. Daarom bieden wij u een complete oplossing zonder zorgen.",
    reason_for_email: "U heeft recent gezocht naar dakdekkers in Amsterdam, en wij willen u helpen met betrouwbare en snelle service.",
    main_message: "Onze gecertificeerde dakspecialisten staan klaar om uw dakprobleem vandaag nog op te lossen. Van kleine reparaties tot complete renovaties - wij regelen alles van A tot Z.",
    next_step_instruction: "Bel ons voor een gratis inspectie en ontvang binnen 2 uur een gedetailleerde offerte.",
    sender_name: "Piet Janssen",
    job_title: "Senior Dakspecialist",
    ps_message: "Bij opdracht deze maand: geen voorrijkosten én 15% korting op alle werkzaamheden.",
    
    // Social media specifiek
    description: "🏠 Daklek in Amsterdam? Onze experts lossen het binnen 4 uur op! ⚡",
    why_important: "Elke dag uitstel kan duizenden euro's extra schade betekenen",
    expected_result: "Waterdicht dak + 15 jaar garantie + geen stress meer",
    call_to_action: "Bel 020-1234567 voor gratis spoedinsectie", 
    response_keyword: "DAKLEK",
    hashtag1: "dakdekkeramsterdam",
    hashtag2: "daklekreparatie", 
    hashtag3: "spoeddienst",
    location_hashtag: "amsterdam",
    industry_hashtag: "dakkappellen"
  };

  const renderPreview = (content: string, withSampleData: boolean = false) => {
    if (!content) return '';
    
    let previewContent = content;
    
    if (withSampleData) {
      // Debug logging
      console.log('Rendering with sample data:', withSampleData);
      console.log('Original content:', content.substring(0, 100) + '...');
      
      // Replace variables with sample data
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        const beforeCount = (previewContent.match(regex) || []).length;
        previewContent = previewContent.replace(regex, `<span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">${value}</span>`);
        if (beforeCount > 0) {
          console.log(`Replaced ${beforeCount} instances of {{${key}}} with "${value}"`);
        }
      });
      
      // Replace any remaining variables with highlighted placeholders  
      const remainingVars = previewContent.match(/\{\{([^}]+)\}\}/g);
      if (remainingVars) {
        console.log('Remaining unmatched variables:', remainingVars);
      }
      
      previewContent = previewContent.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md border border-dashed border-orange-300">Ontbreekt: $1</span>');
    } else {
      // Just highlight variable names
      previewContent = previewContent.replace(/\{\{([^}]+)\}\}/g, '<span class="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md font-mono text-xs">{{$1}}</span>');
    }
    
    // Convert markdown-style formatting with better styling
    previewContent = previewContent
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground border-b pb-2">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground mt-6">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 text-foreground mt-4">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 list-disc">$1</li>')
      .replace(/^✅ (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded"><span class="text-green-600 font-medium">✅</span> <span>$1</span></div>')
      .replace(/^👉 (.+)$/gm, '<div class="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded"><span class="text-blue-600 font-medium">👉</span> <span>$1</span></div>')
      .replace(/\n\n/g, '<div class="mb-4"></div>')
      .replace(/\n/g, '<br/>');
    
    console.log('Final preview content:', previewContent.substring(0, 200) + '...');
    return previewContent;
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.content) {
      toast({
        title: "Ontbrekende velden",
        description: "Vul tenminste een naam en content in.",
        variant: "destructive"
      });
      return;
    }

    const variables = extractVariables(editingTemplate.content);
    
    toast({
      title: "Template opgeslagen",
      description: `"${editingTemplate.name}" is succesvol opgeslagen met ${variables.length} variabelen.`
    });
    
    setIsEditing(false);
    setEditingTemplate({});
    setCurrentStep(1);
  };

  const handleUseTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    toast({
      title: "Template gekopieerd",
      description: `"${template.name}" is naar het klembord gekopieerd.`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/5">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl shadow-lg">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            Template Editor Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Maak professionele, converterende templates met onze geavanceerde wizard. 
            <br className="hidden md:block" />
            <span className="font-medium text-primary">Van concept naar conversie in minuten</span>
          </p>
          <div className="flex justify-center mt-6">
            <Badge className="px-6 py-2 text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200">
              <Crown className="h-4 w-4 mr-2" />
              Pro Features Unlocked
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-5 w-5 mr-3" />
                Nieuw Template Maken
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl">
                    <Wand2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Template Wizard - Start je Project
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Kies een professioneel template of begin helemaal opnieuw. Elke optie is geoptimaliseerd voor maximale conversie.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(templateStarters).map(([category, content]) => (
                    <Card 
                      key={category} 
                      className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 overflow-hidden relative"
                      onClick={() => startNewTemplate(category, true)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-6 text-center relative z-10">
                        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          {category === 'blog' ? '📝' :
                           category === 'service' ? '🏢' :
                           category === 'landing' ? '🎯' :
                           category === 'email' ? '📧' : '📱'}
                        </div>
                        <h4 className="font-bold text-lg mb-3 text-foreground">
                          {category === 'blog' ? 'Blog Post Pro' :
                           category === 'service' ? 'Dienstenpagina Expert' :
                           category === 'landing' ? 'Landing Page Expert' :
                           category === 'email' ? 'Email Marketing' : 'Social Media Boost'}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          {category === 'blog' ? 'SEO-geoptimaliseerde artikelen die ranking verzekeren' :
                           category === 'service' ? 'Complete servicepagina met prijzen, FAQ en contactgegevens' :
                           category === 'landing' ? 'High-converting paginas met bewezen CTA structuur' :
                           category === 'email' ? 'Professionele templates met hoge open rates' : 'Virale content templates met trending hashtags'}
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group-hover:shadow-lg"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Start Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center border-t pt-6 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-lg p-6">
                  <div className="mb-4">
                    <Code className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Custom Template</h4>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Voor gevorderde gebruikers: Begin helemaal opnieuw zonder voorbeeldcontent en bouw je eigen unieke template
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => startNewTemplate()}
                    className="px-8 py-3 border-2 hover:bg-muted/50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Blank Canvas Maken
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

        {/* Main Content Grid - Enhanced Layout */}
        <div className="grid gap-8 xl:grid-cols-4">
          {/* Template Library - Enhanced */}
          <Card className="xl:col-span-1 bg-gradient-to-br from-card to-card/50 shadow-elegant border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Template Galerie
              </CardTitle>
              <CardDescription className="text-sm">
                Kies uit professionele templates of maak je eigen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Input
                  placeholder="🔍 Zoek professionele templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-2 focus:border-primary/50"
                />
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="border-2 focus:border-primary/50">
                    <SelectValue placeholder="Filter categorie" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">🎯 Alle categorieën</SelectItem>
                    <SelectItem value="blog">📝 Blog Posts</SelectItem>
                    <SelectItem value="service">🏢 Dienstenpagina's</SelectItem>
                    <SelectItem value="landing">🎯 Landing Pages</SelectItem>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="social">📱 Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20 ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={template.isPremium ? "default" : "outline"} 
                            className={`text-xs font-medium ${template.isPremium ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800' : ''}`}
                          >
                            {template.category}
                          </Badge>
                          {template.isPremium && (
                            <Crown className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{template.rating}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {template.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {template.usageCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {template.variables.length}
                          </span>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            Geselecteerd
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Geen templates gevonden</p>
                    <p className="text-xs text-muted-foreground mt-1">Probeer een andere zoekopdracht</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Editor/Preview Panel */}
          <div className="xl:col-span-3">
            <Card className="h-full bg-gradient-to-br from-card to-card/50 shadow-elegant border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                      {isEditing ? (
                        <Edit className="h-5 w-5 text-primary" />
                      ) : (
                        <Eye className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {isEditing ? (selectedTemplate ? 'Template Editor Pro' : 'Nieuw Template Maken') : 'Template Preview'}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {selectedTemplate?.name || editingTemplate.name || 'Selecteer een template om te beginnen'}
                      </CardDescription>
                    </div>
                  </div>
                
                <div className="flex gap-2">
                  {!isEditing && selectedTemplate && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseTemplate(selectedTemplate)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Kopieer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(selectedTemplate);
                          setCurrentStep(1);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Bewerk
                      </Button>
                    </>
                  )}
                  
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditingTemplate({});
                          setCurrentStep(1);
                        }}
                      >
                        Annuleer
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Step Progress Indicator */}
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(step.id) === 'completed' 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : getStepStatus(step.id) === 'current'
                            ? 'bg-primary/10 text-primary border-primary'
                            : 'bg-background text-muted-foreground border-muted-foreground'
                        }`}>
                          {getStepStatus(step.id) === 'completed' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-4 w-4" />
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`w-16 h-0.5 ml-2 ${
                            getStepStatus(step.id) === 'completed' ? 'bg-primary' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Step Titles */}
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-semibold">
                      {steps[currentStep - 1]?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {steps[currentStep - 1]?.description}
                    </p>
                  </div>

                  {/* Step Content */}
                  <div className="min-h-[400px]">
                    {/* Step 1: Template Info */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Template Starter</h4>
                              <p className="text-sm text-blue-700 mb-3">
                                Begin snel met een vooraf gemaakte template structuur
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(templateStarters).map(([category, content]) => (
                                  <Button
                                    key={category}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingTemplate(prev => ({
                                        ...prev,
                                        content: content,
                                        category: category as any
                                      }));
                                      setCurrentStep(2);
                                      toast({
                                        title: "Template starter geladen!",
                                        description: `${category} template is toegevoegd aan je content`
                                      });
                                    }}
                                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                                  >
                                    {category === 'blog' ? 'Blog Post' :
                                     category === 'landing' ? 'Landing Page' :
                                     category === 'email' ? 'Email' : 'Social Media'}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="template-name" className="flex items-center gap-2">
                              Template Naam
                              <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                            </Label>
                            <Input
                              id="template-name"
                              value={editingTemplate.name || ""}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Bijv. SEO Blog Post Nederland"
                              className={`${!editingTemplate.name ? 'border-red-200 focus:border-red-500' : 'border-green-200'}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Kies een duidelijke naam die het doel van je template beschrijft
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="template-category" className="flex items-center gap-2">
                              Categorie
                              <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                            </Label>
                            <Select 
                              value={editingTemplate.category || ""} 
                              onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, category: value as any }))}
                            >
                              <SelectTrigger className={`${!editingTemplate.category ? 'border-red-200' : 'border-green-200'}`}>
                                <SelectValue placeholder="Selecteer categorie" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blog">📝 Blog Post</SelectItem>
                                <SelectItem value="landing">🎯 Landing Page</SelectItem>
                                <SelectItem value="email">📧 Email</SelectItem>
                                <SelectItem value="social">📱 Social Media</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="template-description">Beschrijving</Label>
                          <Textarea
                            id="template-description"
                            value={editingTemplate.description || ""}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Korte beschrijving van wat dit template doet en wanneer je het gebruikt"
                            rows={3}
                            className="resize-none"
                          />
                          <p className="text-xs text-muted-foreground">
                            Leg uit wanneer en hoe dit template gebruikt moet worden
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Content */}
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-start gap-3">
                            <Palette className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-purple-900">Template Content Tips</h4>
                              <ul className="text-sm text-purple-700 space-y-1 mt-1">
                                <li>• Gebruik <code className="bg-purple-100 px-1 rounded">{"{{variabele}}"}</code> voor dynamische content</li>
                                <li>• Schrijf in duidelijke, simpele taal</li>
                                <li>• Gebruik koppen (# ## ###) voor structuur</li>
                                <li>• Voeg call-to-actions toe waar relevant</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          {/* Content Editor */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="template-content" className="text-base font-medium flex items-center gap-2">
                                Template Content
                                <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                              </Label>
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setShowHelp(!showHelp)}
                              >
                                <HelpCircle className="h-4 w-4 mr-1" />
                                Help
                              </Button>
                            </div>
                            
                            <Textarea
                              id="template-content"
                              value={editingTemplate.content || ""}
                              onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Schrijf hier je template content. Gebruik {{variabele}} voor dynamische velden..."
                              rows={18}
                              className={`font-mono text-sm resize-none ${!editingTemplate.content ? 'border-destructive/50 focus:border-destructive' : 'border-success/50'}`}
                            />
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {editingTemplate.content?.length || 0} karakters
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {extractVariables(editingTemplate.content || "").length} variabelen gevonden
                              </span>
                            </div>
                          </div>

                          {/* Live Preview */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Live Preview</Label>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewMode(!previewMode)}
                              >
                                {previewMode ? (
                                  <>
                                    <Code className="h-4 w-4 mr-1" />
                                    Variabelen
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Sample Data
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="border rounded-lg p-4 bg-muted/30 min-h-[430px] max-h-[430px] overflow-y-auto">
                              {editingTemplate.content ? (
                                <div 
                                  className="text-sm prose prose-sm max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium"
                                  dangerouslySetInnerHTML={{ 
                                    __html: renderPreview(editingTemplate.content, previewMode) 
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                  <Eye className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                  <p className="text-sm text-muted-foreground font-medium">
                                    Begin met typen om een live preview te zien
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Variabelen worden automatisch gedetecteerd
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="text-xs bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-muted-foreground">Preview Tips:</p>
                                  <p className="text-muted-foreground mt-1">
                                    {previewMode ? 
                                      "✨ Je ziet nu hoe de template eruit ziet met echte sample data" : 
                                      "🔤 Variabelen worden getoond zoals ze in de template staan"
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {showHelp && (
                          <div className="bg-muted/50 p-4 rounded-lg space-y-3 animate-fade-in">
                            <h4 className="font-medium flex items-center gap-2">
                              <HelpCircle className="h-4 w-4" />
                              Markdown Syntax Help
                            </h4>
                            <div className="grid gap-2 text-sm">
                              <div><code># Hoofdkop</code> - Grote titel</div>
                              <div><code>## Subkop</code> - Subtitel</div>
                              <div><code>**Vet tekst**</code> - Vetgedrukt</div>
                              <div><code>*Cursief*</code> - Cursieve tekst</div>
                              <div><code>- Lijst item</code> - Opsommingsteken</div>
                              <div><code>[Link tekst](url)</code> - Hyperlink</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Variables */}
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-start gap-3">
                            <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-900">Variabelen Beheer</h4>
                              <p className="text-sm text-green-700">
                                Klik op een variabele om deze in je content toe te voegen
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Gevonden Variabelen
                            </h4>
                            {extractVariables(editingTemplate.content || "").length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {extractVariables(editingTemplate.content || "").map(variable => (
                                  <Badge key={variable} variant="secondary" className="text-xs py-1">
                                    {variable}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Geen variabelen gevonden. Voeg variabelen toe met {"{{naam}}"} syntax.
                              </p>
                            )}
                          </div>

                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Voorgestelde Variabelen
                            </h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {variableSuggestions.map((suggestion) => (
                                <div
                                  key={suggestion.name}
                                  className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => insertVariable(suggestion.name)}
                                >
                                  <div className="flex items-center justify-between">
                                    <code className="text-xs bg-muted px-1 rounded">{suggestion.example}</code>
                                    <Plus className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Settings */}
                    {currentStep === 4 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h4 className="font-medium">Organisatie</h4>
                            <div className="space-y-2">
                              <Label htmlFor="template-tags">Tags (gescheiden door komma's)</Label>
                              <Input
                                id="template-tags"
                                value={editingTemplate.tags?.join(', ') || ""}
                                onChange={(e) => setEditingTemplate(prev => ({ 
                                  ...prev, 
                                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                }))}
                                placeholder="seo, lokaal, dienstverlening, marketing"
                              />
                              <p className="text-xs text-muted-foreground">
                                Tags helpen bij het organiseren en zoeken van templates
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium">Zichtbaarheid</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="template-public"
                                  checked={editingTemplate.isPublic || false}
                                  onCheckedChange={(checked) => setEditingTemplate(prev => ({ ...prev, isPublic: !!checked }))}
                                />
                                <Label htmlFor="template-public" className="flex items-center gap-2">
                                  Publiek template
                                  <Badge variant="secondary" className="text-xs">Aanbevolen</Badge>
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground ml-6">
                                Andere gebruikers kunnen dit template gebruiken
                              </p>
                              
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="template-premium"
                                  checked={editingTemplate.isPremium || false}
                                  onCheckedChange={(checked) => setEditingTemplate(prev => ({ ...prev, isPremium: !!checked }))}
                                />
                                <Label htmlFor="template-premium" className="flex items-center gap-2">
                                  Premium template
                                  <Crown className="h-3 w-3 text-yellow-600" />
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground ml-6">
                                Alleen premium gebruikers kunnen dit template gebruiken
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Preview */}
                    {currentStep === 5 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                          <div className="flex items-start gap-3">
                            <Eye className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-amber-900">Template Voorvertoning</h4>
                              <p className="text-sm text-amber-700">
                                Controleer je template voordat je het opslaat
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-3">Template Samenvatting</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Naam:</span>
                                <span className="font-medium">{editingTemplate.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Categorie:</span>
                                <Badge variant="outline">{editingTemplate.category}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Variabelen:</span>
                                <span>{extractVariables(editingTemplate.content || "").length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Content lengte:</span>
                                <span>{editingTemplate.content?.length || 0} karakters</span>
                              </div>
                              <Separator />
                              <div>
                                <span className="text-muted-foreground block mb-1">Tags:</span>
                                <div className="flex flex-wrap gap-1">
                                  {editingTemplate.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                  )) || <span className="text-xs text-muted-foreground">Geen tags</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Preview</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {previewMode ? 'Met Sample Data' : 'Variabelen Zichtbaar'}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewMode(!previewMode)}
                                >
                                  {previewMode ? (
                                    <>
                                      <Code className="h-3 w-3 mr-1" />
                                      Variabelen
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Sample Data
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="bg-card border rounded-lg p-4 max-h-80 overflow-y-auto text-sm">
                              <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: renderPreview(editingTemplate.content || "", previewMode) 
                                }} 
                              />
                            </div>
                            
                            <div className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                              {previewMode ? 
                                "💡 Dit is hoe je template eruit ziet met echte content data" : 
                                "💡 Variabelen worden getoond zoals ze in de template staan"
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Vorige
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      Stap {currentStep} van {steps.length}
                    </div>

                    <div className="flex gap-2">
                      {currentStep < steps.length ? (
                        <Button
                          onClick={() => {
                            if (validateStep(currentStep)) {
                              setCurrentStep(currentStep + 1);
                            } else {
                              toast({
                                title: "Ontbrekende informatie",
                                description: "Vul alle verplichte velden in voordat je doorgaat.",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={!validateStep(currentStep)}
                        >
                          Volgende
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <Button onClick={handleSaveTemplate}>
                          <Save className="h-4 w-4 mr-1" />
                          Template Opslaan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ) : selectedTemplate ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Template Bekijken</h4>
                        <p className="text-sm text-blue-700">
                          Bekijk de template details en variabelen. Klik 'Bewerk' om aan te passen.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-sm font-medium">Categorie</Label>
                      <Badge variant="outline" className="mt-1">
                        {selectedTemplate.category}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Rating</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{selectedTemplate.rating}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Gebruik</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.usageCount}x gebruikt
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Variabelen ({selectedTemplate.variables.length})</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTemplate.variables.map(variable => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {"{{" + variable + "}}"}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deze variabelen worden vervangen door echte content bij gebruik
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTemplate.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Content Preview</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={previewMode ? "default" : "secondary"} className="text-xs">
                          {previewMode ? 'Preview Mode' : 'Raw Mode'} 
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {selectedTemplate.content.length} karakters
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 p-4 bg-card border rounded-lg max-h-80 overflow-y-auto">
                      <div 
                        className="text-sm prose prose-sm max-w-none [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium"
                        dangerouslySetInnerHTML={{ 
                          __html: previewMode ? 
                            renderPreview(selectedTemplate.content, true) : 
                            `<pre class="text-xs font-mono whitespace-pre-wrap text-muted-foreground">${selectedTemplate.content}</pre>`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewMode(!previewMode)}
                        >
                          {previewMode ? (
                            <>
                              <Code className="h-4 w-4 mr-1" />
                              Raw Code
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </>
                          )}
                        </Button>
                        <Badge variant={previewMode ? "default" : "secondary"} className="text-xs">
                          {previewMode ? 'Met Sample Data' : 'Raw Template'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUseTemplate(selectedTemplate)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Kopieer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingTemplate({...selectedTemplate});
                            setIsEditing(true);
                            setCurrentStep(1);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Bewerk
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Geen template geselecteerd</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecteer een template uit de bibliotheek om te bekijken of bewerken, 
                      of maak een nieuw template met de wizard.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => startNewTemplate()}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Start Template Wizard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;