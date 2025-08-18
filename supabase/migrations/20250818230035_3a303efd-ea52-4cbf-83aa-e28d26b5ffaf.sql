-- Test data voor blog management - alleen voor ontwikkeling/testing
-- Voeg een paar test blogs toe voor de huidige gebruiker

-- Controleer eerst of er al test data bestaat
-- Voeg alleen toe als er minder dan 5 blogs zijn voor testing

DO $$
DECLARE
    test_user_id uuid;
    blog_count integer;
BEGIN
    -- Haal een bestaande user op voor testing (neem de eerst beschikbare)
    SELECT user_id INTO test_user_id 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Als er een user is, check hoeveel blogs ze hebben
    IF test_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO blog_count 
        FROM public.blog_posts 
        WHERE user_id = test_user_id;
        
        -- Als er minder dan 3 blogs zijn, voeg test data toe
        IF blog_count < 3 THEN
            INSERT INTO public.blog_posts (
                user_id, 
                title, 
                slug, 
                status, 
                publish_date, 
                summary, 
                author, 
                city, 
                word_count,
                body_markdown,
                meta_title,
                meta_description,
                tags
            ) VALUES 
            (
                test_user_id,
                'AI Revolutie in Content Marketing - Alles Wat Je Moet Weten',
                'ai-revolutie-content-marketing-2024',
                'published',
                CURRENT_DATE,
                'Ontdek hoe AI de content marketing industrie transformeert en hoe jij hier optimaal van kunt profiteren.',
                'AutoblogifyAI',
                'Amsterdam',
                1250,
                '# AI Revolutie in Content Marketing

De wereld van content marketing staat op het punt van een grote verandering. Kunstmatige intelligentie (AI) heeft de manier waarop we content creëren, optimaliseren en distribueren fundamenteel veranderd.

## Waarom AI Belangrijk Is

AI-tools kunnen:
- Content 10x sneller genereren
- SEO automatisch optimaliseren  
- Gepersonaliseerde content creëren
- Data-gedreven beslissingen nemen

## De Toekomst van Content

Met platforms zoals AutoblogifyAI kunnen bedrijven nu:

1. **Schaalbare content productie** - Honderden blogs per maand
2. **Consistente kwaliteit** - AI zorgt voor uniforme tone-of-voice
3. **SEO optimalisatie** - Automatische keyword integratie
4. **Time-saving** - Meer tijd voor strategie en creativiteit

*Klaar om de sprong te maken naar AI-gedreven content marketing?*',
                'AI Revolutie in Content Marketing 2024 - Complete Gids',
                'Ontdek hoe AI content marketing transformeert. Complete gids met praktische tips, tools en strategieën voor 2024.',
                ARRAY['AI', 'Content Marketing', 'SEO', 'Automatisering']
            ),
            (
                test_user_id,
                'WordPress Automatisering: Van Concept naar Publicatie in Minuten',
                'wordpress-automatisering-concept-publicatie',
                'published', 
                CURRENT_DATE - INTERVAL '2 days',
                'Leer hoe je je WordPress publicatie workflow volledig kunt automatiseren met moderne AI-tools.',
                'AutoblogifyAI',
                'Rotterdam',
                980,
                '# WordPress Automatisering: Een Game Changer

WordPress blijft het meest gebruikte CMS ter wereld, maar handmatige content publicatie kost veel tijd. Hier komt automatisering om de hoek kijken.

## Voordelen van Automatisering

- **Tijdsbesparing**: 90% minder tijd kwijt aan publicatie
- **Consistentie**: Geen vergeten meta descriptions meer  
- **Schaalbaarheid**: Publiceer tientallen posts per dag
- **Foutreductie**: Minder menselijke fouten

## Hoe Het Werkt

1. Content genereren met AI
2. Automatische SEO optimalisatie
3. Directe WordPress publicatie
4. Real-time status updates

*Ready om je WordPress workflow te revolutioneren?*',
                'WordPress Automatisering 2024 - Complete Workflow Gids',
                'Automatiseer je WordPress publicatie workflow. Van AI content generatie tot directe publicatie in minuten.',
                ARRAY['WordPress', 'Automatisering', 'CMS', 'Workflow']
            ),
            (
                test_user_id,
                'SEO in 2024: De Macht van AI-Gedreven Keyword Research',
                'seo-2024-ai-keyword-research',
                'draft',
                CURRENT_DATE + INTERVAL '1 day',
                'Ontdek de nieuwste SEO trends en hoe AI-tools je keyword research naar een hoger niveau tillen.',
                'AutoblogifyAI',
                'Utrecht',
                1420,
                '# SEO in 2024: De AI Revolutie

Search Engine Optimization evolueert razendsnel. Wat vijf jaar geleden werkte, is nu achterhaald. AI heeft SEO volledig getransformeerd.

## Nieuwe SEO Realiteit

- **User Intent** is belangrijker dan ooit
- **Content clusters** vervangen losse keywords
- **AI content** moet natuurlijk aanvoelen
- **Technical SEO** blijft fundamenteel

## AI Keyword Research Tools

De beste tools voor 2024:

1. **Semantic analysis** - Begrijp zoekintentie
2. **Competitor gaps** - Vind gemiste kansen  
3. **Long-tail opportunities** - Minder competitie
4. **Content optimization** - Real-time suggestions

## Praktische Tips

- Focus op topic clusters in plaats van losse keywords
- Gebruik AI voor content gap analysis
- Optimaliseer voor voice search
- Monitor je competitors automatisch

*Klaar om je SEO strategie te updaten voor 2024?*',
                'SEO 2024: AI Keyword Research - Complete Gids',
                'Master SEO in 2024 met AI-gedreven keyword research. Praktische tips, tools en strategieën voor betere rankings.',
                ARRAY['SEO', 'Keyword Research', 'AI', '2024 Trends']
            );
            
            RAISE NOTICE 'Test blog posts toegevoegd voor user: %', test_user_id;
        ELSE
            RAISE NOTICE 'User heeft al % blogs, geen test data toegevoegd', blog_count;
        END IF;
    ELSE
        RAISE NOTICE 'Geen gebruiker gevonden voor test data';
    END IF;
END $$;