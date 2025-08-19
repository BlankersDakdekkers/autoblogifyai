import React, { memo, Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  Zap, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  Globe,
  Award
} from "lucide-react";

// Lazy load heavy components
const AnimatedCounter = lazy(() => import('./AnimatedCounter'));

// Memoized stat card component
const StatCard = memo(({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  trend,
  delay = 0 
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: string;
  description: string;
  trend?: string;
  delay?: number;
}) => (
  <Card 
    className="card-premium hover-lift group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardContent className="pt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-xl group-hover:from-primary/20 group-hover:to-primary-glow/20 transition-all duration-300">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        {trend && (
          <Badge variant="outline" className="status-success">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        <Suspense fallback={<Skeleton className="h-8 w-20" />}>
          <div className="text-3xl font-heading font-bold text-gradient">
            <AnimatedCounter value={value} />
          </div>
        </Suspense>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

// Memoized feature card component
const FeatureCard = memo(({ 
  icon: Icon, 
  title, 
  description, 
  benefits,
  delay = 0 
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  benefits: string[];
  delay?: number;
}) => (
  <Card 
    className="card-glass hover-glow group border-0 shadow-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
          {title}
        </CardTitle>
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <CardDescription className="text-sm leading-relaxed">
        {description}
      </CardDescription>
      
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

// Memoized CTA section component
const CTASection = memo(() => (
  <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5 relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
    <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-primary-glow/20 to-transparent rounded-full blur-2xl" />
    
    <div className="container mx-auto max-w-4xl text-center relative z-10">
      <div className="animate-fade-in">
        <Badge variant="outline" className="mb-6 bg-background/80 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Klaar om te beginnen?
        </Badge>
        
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 heading-gradient">
          Start vandaag nog met AI-gestuurde content
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Sluit je aan bij <strong>500+ tevreden klanten</strong> die hun content productie 
          verhoogden met <strong>300%</strong> en kosten verlaagden met <strong>80%</strong>.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="btn-premium group relative overflow-hidden"
            asChild
          >
            <a href="/auth?tab=signup">
              <span className="relative z-10 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Gratis Trial Starten
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </a>
          </Button>
          
          <Button size="lg" variant="outline" className="btn-glass" asChild>
            <a href="/contact">
              Plan Demo
              <Clock className="h-5 w-5 ml-2" />
            </a>
          </Button>
        </div>
        
        <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Geen creditcard vereist
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            5 gratis artikelen
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Setup in 2 minuten
          </div>
        </div>
      </div>
    </div>
  </section>
));

CTASection.displayName = 'CTASection';

// Main optimized homepage sections
const OptimizedHomeSections = {
  StatCard: memo(StatCard),
  FeatureCard: memo(FeatureCard),
  CTASection: memo(CTASection),
};

export default OptimizedHomeSections;