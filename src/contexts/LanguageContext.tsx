import React, { createContext, useContext, useState, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface Translations {
  [key: string]: {
    [lang: string]: string;
  };
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: Language[];
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': {
    'nl': 'Dashboard',
    'en': 'Dashboard',
    'de': 'Dashboard',
    'fr': 'Tableau de bord',
    'es': 'Panel'
  },
  'nav.generator': {
    'nl': 'Generator',
    'en': 'Generator', 
    'de': 'Generator',
    'fr': 'Générateur',
    'es': 'Generador'
  },
  'nav.templates': {
    'nl': 'Templates',
    'en': 'Templates',
    'de': 'Vorlagen',
    'fr': 'Modèles',
    'es': 'Plantillas'
  },
  'nav.integrations': {
    'nl': 'Integraties',
    'en': 'Integrations',
    'de': 'Integrationen',
    'fr': 'Intégrations',
    'es': 'Integraciones'
  },
  
  // Common terms
  'common.save': {
    'nl': 'Opslaan',
    'en': 'Save',
    'de': 'Speichern',
    'fr': 'Enregistrer',
    'es': 'Guardar'
  },
  'common.cancel': {
    'nl': 'Annuleren',
    'en': 'Cancel',
    'de': 'Abbrechen', 
    'fr': 'Annuler',
    'es': 'Cancelar'
  },
  'common.create': {
    'nl': 'Aanmaken',
    'en': 'Create',
    'de': 'Erstellen',
    'fr': 'Créer',
    'es': 'Crear'
  },
  'common.edit': {
    'nl': 'Bewerken',
    'en': 'Edit',
    'de': 'Bearbeiten',
    'fr': 'Modifier',
    'es': 'Editar'
  },
  'common.delete': {
    'nl': 'Verwijderen',
    'en': 'Delete',
    'de': 'Löschen',
    'fr': 'Supprimer',
    'es': 'Eliminar'
  },
  'common.loading': {
    'nl': 'Laden...',
    'en': 'Loading...',
    'de': 'Laden...',
    'fr': 'Chargement...',
    'es': 'Cargando...'
  },
  
  // Content generation
  'content.title': {
    'nl': 'Content Generatie',
    'en': 'Content Generation',
    'de': 'Content-Generierung',
    'fr': 'Génération de contenu',
    'es': 'Generación de contenido'
  },
  'content.generate': {
    'nl': 'Genereren',
    'en': 'Generate',
    'de': 'Generieren',
    'fr': 'Générer',
    'es': 'Generar'
  },
  'content.keyword': {
    'nl': 'Zoekwoord',
    'en': 'Keyword',
    'de': 'Stichwort',
    'fr': 'Mot-clé',
    'es': 'Palabra clave'
  },
  'content.city': {
    'nl': 'Plaats',
    'en': 'City',
    'de': 'Stadt',
    'fr': 'Ville',
    'es': 'Ciudad'
  },
  
  // Templates
  'templates.seo_blog': {
    'nl': 'SEO Blog Template',
    'en': 'SEO Blog Template',
    'de': 'SEO Blog Vorlage',
    'fr': 'Modèle de blog SEO',
    'es': 'Plantilla de blog SEO'
  },
  'templates.local_service': {
    'nl': 'Lokale Service Template',
    'en': 'Local Service Template',
    'de': 'Lokaler Service Vorlage',
    'fr': 'Modèle de service local',
    'es': 'Plantilla de servicio local'
  },
  
  // Onboarding
  'onboarding.welcome': {
    'nl': 'Welkom bij AutoblogifyAI',
    'en': 'Welcome to AutoblogifyAI',
    'de': 'Willkommen bei AutoblogifyAI',
    'fr': 'Bienvenue sur AutoblogifyAI',
    'es': 'Bienvenido a AutoblogifyAI'
  },
  'onboarding.setup': {
    'nl': 'Laten we je account instellen',
    'en': 'Let\'s set up your account',
    'de': 'Richten wir Ihr Konto ein',
    'fr': 'Configurons votre compte',
    'es': 'Configuremos tu cuenta'
  }
};

const languages: Language[] = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('autoblogify_language');
    return saved || navigator.language.split('-')[0] || 'nl';
  });

  useEffect(() => {
    localStorage.setItem('autoblogify_language', currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (!translation) {
      return fallback || key;
    }
    return translation[currentLanguage] || translation['nl'] || translation['en'] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};