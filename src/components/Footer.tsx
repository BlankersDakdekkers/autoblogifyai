import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  ArrowRight,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/sales" },
        { name: "Prijzen", href: "/pricing" },
        { name: "Klantencases", href: "/customer-cases" },
        { name: "Demo Aanvragen", href: "/contact" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Kennisbank", href: "/dashboard/knowledge-base" },
        { name: "Help Center", href: "/dashboard/help" },
        { name: "API Documentatie", href: "/dashboard/resources" },
        { name: "Blog", href: "/dashboard/blogs" },
      ]
    },
    {
      title: "Bedrijf",
      links: [
        { name: "Over Ons", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/contact" },
        { name: "Partners", href: "/contact" },
      ]
    },
    {
      title: "Juridisch",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Algemene Voorwaarden", href: "/terms" },
        { name: "Cookie Beleid", href: "/privacy" },
        { name: "GDPR", href: "/privacy" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/autoblogifyai", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/autoblogifyai", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/autoblogifyai", label: "GitHub" },
    { icon: Facebook, href: "https://facebook.com/autoblogifyai", label: "Facebook" },
  ];

  return (
    <footer className="bg-background border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-gradient">AutoblogifyAI</span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Revolutionaliseer uw content strategie met AI-gestuurde blog automatisering. 
              Creëer professionele, SEO-geoptimaliseerde content in seconden.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@autoblogifyai.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+31 (0)20 123 4567</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Amsterdam, Nederland</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm group flex items-center"
                    >
                      {link.name}
                      <ArrowRight className="h-3 w-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t bg-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h3 className="font-heading font-semibold mb-2">Blijf op de hoogte</h3>
              <p className="text-muted-foreground text-sm">
                Ontvang de nieuwste updates over AI, content marketing en product features.
              </p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Uw e-mailadres"
                className="flex-1 md:w-64 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-primary to-primary-glow text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                Aanmelden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {currentYear} AutoblogifyAI B.V. Alle rechten voorbehouden.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center space-x-1">
                <span>Gemaakt met</span>
                <Heart className="h-3 w-3 text-red-500 fill-current" />
                <span>in Amsterdam</span>
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-secondary/50 rounded-lg"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;