-- Voeg enkele demo knowledge base items toe
INSERT INTO public.knowledge_items (user_id, title, content, category, type, author, tags, status) VALUES 
(
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'Long-tail Keywords Vinden voor Niche Markten',
  '## Inleiding
  
Het vinden van **long-tail keywords voor niche markten** is een essentiële strategie voor ondernemers, marketeers en contentmakers die willen doorbreken in competitieve sectoren.

## Wat zijn Long-tail Keywords?

Long-tail keywords zijn zoektermen van drie of meer woorden die zeer specifiek zijn en gewoonlijk minder zoekvolume hebben, maar een hogere conversieratio.

### Voordelen van Long-tail Keywords:
- Lagere concurrentie
- Hogere conversiekans
- Betere doelgroep targeting
- Lagere kosten per klik (CPC)

## Strategieën voor het Vinden van Long-tail Keywords

### 1. Google Suggest
Begin met het typen van je hoofdkeyword in Google en bekijk de automatische suggesties.

### 2. Keyword Tools
- **Google Keyword Planner**
- **Ubersuggest**
- **AnswerThePublic**
- **SEMrush**

### 3. Competitor Analyse
Analyseer welke keywords je concurrenten gebruiken en vind gaten in hun strategie.

## Implementatie

Zodra je long-tail keywords hebt gevonden:
1. Creëer specifieke content rond deze keywords
2. Optimaliseer je meta tags
3. Bouw interne links op
4. Monitor je rankings

## Conclusie

Long-tail keywords zijn de sleutel tot succes in niche markten. Ze bieden een kosteneffectieve manier om gericht verkeer aan te trekken.',
  'seo',
  'article',
  'Beheerder',
  ARRAY['SEO', 'Keywords', 'Marketing'],
  'published'
),
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Blog Performance Meten: Welke Metrics Tellen Echt?',
  '## Inleiding

De digitale concurrentie voor blogs is in 2024 zonder inzicht in prestaties is als varen zonder kompas. Maar welke metrics zijn werkelijk belangrijk?

## Kernmetrics voor Blog Success

### 1. Organisch Verkeer
Het percentage bezoekers dat via zoekmachines komt bepaalt je SEO-succes.

**Tools om te meten:**
- Google Analytics 4
- Google Search Console
- SEMrush Organic Research

### 2. Engagement Metrics
- **Bounce Rate**: Ideaal onder 60%
- **Time on Page**: Streef naar 2+ minuten
- **Pages per Session**: Meer dan 1.5 is goed

### 3. Conversie Tracking
Uiteindelijk draait het om conversies:
- Newsletter aanmeldingen
- Download van lead magnets
- Product verkopen
- Contact formulier invullingen

## Geavanceerde Analytics

### Content Performance Matrix
Meet welke content het beste presteert:
- Aantal shares op social media
- Backlinks gegenereerd
- Keyword rankings verbeteringen

### User Journey Mapping
Begrijp hoe bezoekers door je blog navigeren:
1. Entry pages analyseren
2. Exit pages identificeren  
3. Conversion paths optimaliseren

## Actionable Insights

### Wekelijkse Rapportage
Stel een dashboard in met:
- Top 10 performing posts
- Keyword ranking changes
- Traffic growth trends
- Goal completions

### Maandelijkse Diepduik
- Content gaps identificeren
- Competitor analyse
- Technical SEO audit
- Backlink profiel review

## Tools & Resources

**Gratis Tools:**
- Google Analytics 4
- Google Search Console
- Google PageSpeed Insights

**Premium Tools:**
- Ahrefs
- SEMrush  
- Screaming Frog

## Conclusie

Effectieve blog performance meting vereist een mix van traffic, engagement en conversie metrics. Focus op data die actionable insights biedt in plaats van vanity metrics.',
  'analytics',
  'article', 
  'Beheerder',
  ARRAY['Analytics', 'Blog', 'Performance', 'Metrics'],
  'published'
);