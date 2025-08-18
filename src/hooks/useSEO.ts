import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  url?: string;
  siteName?: string;
}

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();

  useEffect(() => {
    // Set document title
    document.title = seoData.title;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    // Create meta tags
    const metaTags = [
      { name: 'description', content: seoData.description },
      { name: 'keywords', content: seoData.keywords || 'AutoblogifyAI, AI blog, content generatie' },
      { name: 'author', content: seoData.author || 'AutoblogifyAI' },
      { name: 'robots', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      
      // Open Graph tags
      { property: 'og:title', content: seoData.title },
      { property: 'og:description', content: seoData.description },
      { property: 'og:type', content: seoData.type || 'website' },
      { property: 'og:url', content: seoData.url || window.location.href },
      { property: 'og:site_name', content: seoData.siteName || 'AutoblogifyAI' },
      { property: 'og:image', content: seoData.image || '/og-image.png' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seoData.title },
      { name: 'twitter:description', content: seoData.description },
      { name: 'twitter:image', content: seoData.image || '/og-image.png' },
      
      // Additional SEO tags
      { name: 'theme-color', content: '#3B82F6' },
      { name: 'msapplication-TileColor', content: '#3B82F6' },
    ];

    // Add meta tags to head
    metaTags.forEach(({ name, property, content }) => {
      if (content) {
        const meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        meta.setAttribute('data-seo', 'true');
        document.head.appendChild(meta);
      }
    });

    // Add canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoData.url || window.location.href;

  }, [seoData, location]);
};

// Page-specific SEO configurations
export const SEO_CONFIG = {
  home: {
    title: 'AutoblogifyAI - AI-Powered Blog Generator | SEO Geoptimaliseerde Content',
    description: 'Genereer professionele, SEO-geoptimaliseerde blogs met AI. Van CSV naar complete blogposts in minuten. WordPress integratie, 5 gratis credits.',
    keywords: 'AI blog generator, SEO content, WordPress integratie, automatische blogs, content marketing, AI writing tool',
    type: 'website' as const,
  },
  dashboard: {
    title: 'Dashboard - AutoblogifyAI',
    description: 'Beheer je AI-gegenereerde blogs, bekijk statistieken en publiceer direct naar WordPress vanuit je persoonlijke dashboard.',
    keywords: 'blog dashboard, content management, AI blogs beheren, WordPress publicatie',
    type: 'website' as const,
  },
  blogs: {
    title: 'Blog Management - AutoblogifyAI',
    description: 'Beheer je AI-gegenereerde blogposts, bewerk content, en publiceer direct naar WordPress. Volledige controle over je content.',
    keywords: 'blog management, content editing, WordPress publishing, AI content',
    type: 'website' as const,
  },
  pricing: {
    title: 'Prijzen - AutoblogifyAI | Affordable AI Content Plans',
    description: 'Betaalbare prijzen voor professionele AI content generatie. Start gratis met 5 credits. Premium plannen voor schaalbare content productie.',
    keywords: 'AI content pricing, blog generator costs, WordPress automation pricing, content marketing plans',
    type: 'website' as const,
  },
  wordpress: {
    title: 'WordPress Integratie - AutoblogifyAI',
    description: 'Naadloze WordPress integratie voor automatische blog publicatie. Publiceer AI-gegenereerde content direct naar je WordPress site.',
    keywords: 'WordPress AI integration, automatic blog posting, WordPress content automation, AI WordPress plugin',
    type: 'website' as const,
  },
  admin: {
    title: 'Admin Dashboard - AutoblogifyAI',
    description: 'Administrator dashboard voor gebruikersbeheer, systeem monitoring en analytics.',
    keywords: 'admin dashboard, user management, system monitoring',
    type: 'website' as const,
  },
} as const;

// Hook voor pagina-specifieke SEO
export const usePageSEO = (page: keyof typeof SEO_CONFIG, customData?: Partial<SEOData>) => {
  const baseConfig = SEO_CONFIG[page];
  const finalConfig = { ...baseConfig, ...customData };
  
  useSEO(finalConfig);
  
  return finalConfig;
};

// Structured data generator
export const generateStructuredData = (type: 'WebSite' | 'Article' | 'Organization', data: any) => {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'WebSite':
      return {
        ...baseStructuredData,
        name: 'AutoblogifyAI',
        description: 'AI-powered blog generator for SEO-optimized content creation',
        url: 'https://autoblogifyai.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://autoblogifyai.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      };

    case 'Article':
      return {
        ...baseStructuredData,
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Person',
          name: data.author || 'AutoblogifyAI',
        },
        publisher: {
          '@type': 'Organization',
          name: 'AutoblogifyAI',
          logo: {
            '@type': 'ImageObject',
            url: 'https://autoblogifyai.com/logo.png',
          },
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        image: data.image,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url,
        },
        ...data,
      };

    case 'Organization':
      return {
        ...baseStructuredData,
        name: 'AutoblogifyAI',
        description: 'AI-powered content generation platform',
        url: 'https://autoblogifyai.com',
        logo: 'https://autoblogifyai.com/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+31-20-123-4567',
          contactType: 'customer service',
          availableLanguage: ['Dutch', 'English'],
        },
        sameAs: [
          'https://twitter.com/autoblogifyai',
          'https://linkedin.com/company/autoblogifyai',
        ],
        ...data,
      };

    default:
      return baseStructuredData;
  }
};

// Add structured data to page
export const useStructuredData = (type: 'WebSite' | 'Article' | 'Organization', data: any) => {
  useEffect(() => {
    const structuredData = generateStructuredData(type, data);
    
    // Remove existing structured data
    const existingScript = document.querySelector('script[data-structured-data="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const script = document.querySelector('script[data-structured-data="true"]');
      if (script) {
        script.remove();
      }
    };
  }, [type, data]);
};