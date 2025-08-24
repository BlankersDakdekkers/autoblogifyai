import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'AutoBlog Producer', href: '/dashboard/autoblog' },
      { label: 'Website Builder', href: '/dashboard/website-builder' },
      { label: 'AI Website Generator', href: '/dashboard/ai-website' },
      { label: 'Analytics', href: '/dashboard/analytics' },
    ],
    company: [
      { label: 'Over Ons', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Help & Support', href: '/help' },
    ],
    resources: [
      { label: 'Knowledge Base', href: '/knowledge-base' },
      { label: 'Cursus', href: '/course' },
      { label: 'Resource Center', href: '/dashboard/resources' },
      { label: 'Templates', href: '/dashboard/templates' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-gradient-to-br from-muted/50 to-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AutoblogifyAI
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              De krachtigste AI-gestuurde content automatisering tool voor moderne bedrijven. 
              Genereer professionele blogposts en websites in minuten, niet dagen.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@autoblogifyai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+31 20 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Amsterdam, Netherlands</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <NavLink 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Bedrijf</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <NavLink 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <NavLink 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {currentYear} AutoblogifyAI. Alle rechten voorbehouden.
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <NavLink 
                  key={link.href}
                  to={link.href} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200 group"
                  title={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
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