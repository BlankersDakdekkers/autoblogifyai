import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Clock, FileText, Plus, TrendingUp, Zap } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'social' | 'email';
  status: 'planned' | 'draft' | 'published';
  date: Date;
  platform?: string;
}

const ContentPlanner = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'SEO Blog: Lokale Marketing Tips',
      type: 'blog',
      status: 'planned',
      date: addDays(new Date(), 1)
    },
    {
      id: '2', 
      title: 'Social Media: Product Launch',
      type: 'social',
      status: 'draft',
      date: addDays(new Date(), 2),
      platform: 'LinkedIn'
    },
    {
      id: '3',
      title: 'Email Campaign: Nieuwe Features',
      type: 'email', 
      status: 'planned',
      date: addDays(new Date(), 3)
    },
    {
      id: '4',
      title: 'Blog: AI Content Trends 2025',
      type: 'blog',
      status: 'published',
      date: addDays(new Date(), -1)
    }
  ]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getContentForDay = (date: Date) => {
    return contentItems.filter(item => isSameDay(item.date, date));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'draft': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'published': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'social': return TrendingUp;
      case 'email': return Zap;
      default: return FileText;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-secondary/5 to-accent/5">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20">
              <Calendar className="mr-2 h-4 w-4" />
              Content Planner
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Plan je content strategisch
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Organiseer al je content in één overzichtelijke planner. Van blogposts tot social media - 
              plan, track en optimaliseer je hele content strategie.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                <div className="text-sm text-muted-foreground">Deze week gepland</div>
              </CardContent>
            </Card>
            <Card className="text-center border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600 mb-1">5</div>
                <div className="text-sm text-muted-foreground">In concept</div>
              </CardContent>
            </Card>
            <Card className="text-center border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600 mb-1">28</div>
                <div className="text-sm text-muted-foreground">Gepubliceerd</div>
              </CardContent>
            </Card>
            <Card className="text-center border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
                <div className="text-sm text-muted-foreground">Planning efficientie</div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Weekoverzicht
                </CardTitle>
                <CardDescription>
                  {format(weekStart, 'dd MMMM', { locale: nl })} - {format(addDays(weekStart, 6), 'dd MMMM yyyy', { locale: nl })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  Vorige week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                >
                  Volgende week
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, index) => {
                  const dayContent = getContentForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 min-h-[150px] transition-all hover:shadow-md ${
                        isToday ? 'border-primary bg-primary/5' : 'border-border bg-card'
                      }`}
                    >
                      <div className="text-center mb-3">
                        <div className="text-sm text-muted-foreground">
                          {format(day, 'EEEE', { locale: nl })}
                        </div>
                        <div className={`text-lg font-semibold ${
                          isToday ? 'text-primary' : ''
                        }`}>
                          {format(day, 'd')}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {dayContent.map((item) => {
                          const IconComponent = getTypeIcon(item.type);
                          return (
                            <div
                              key={item.id}
                              className={`p-2 rounded text-xs border ${getStatusColor(item.status)}`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <IconComponent className="h-3 w-3" />
                                <span className="font-medium">{item.type}</span>
                              </div>
                              <div className="text-xs opacity-90 line-clamp-2">
                                {item.title}
                              </div>
                              {item.platform && (
                                <div className="text-xs opacity-70 mt-1">
                                  {item.platform}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {dayContent.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-auto p-2 text-xs opacity-50 hover:opacity-100"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Voeg toe
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="mr-2 h-5 w-5" />
              Nieuwe content plannen
            </Button>
            <Button variant="outline" size="lg">
              <Clock className="mr-2 h-5 w-5" />
              Bulk import CSV
            </Button>
            <Button variant="outline" size="lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Analytics bekijken
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentPlanner;