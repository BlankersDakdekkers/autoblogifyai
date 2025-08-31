import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, Clock, FileText, Plus, TrendingUp, Zap, Loader2, PenTool, Video, Image } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { useContentPlanner } from "@/hooks/useContentPlanner";

const ContentPlanner = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    content_type: 'blog_post',
    status: 'planned' as const,
    priority: 3,
    planned_date: '',
    platform: '',
    category: '',
    tags: [] as string[],
    notes: '',
  });

  const { 
    plans, 
    loading, 
    error, 
    createPlan, 
    updatePlan, 
    deletePlan, 
    getPlansForDate 
  } = useContentPlanner();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getContentForDay = (date: Date) => {
    return getPlansForDate(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'in_progress': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {  
    switch (type) {
      case 'blog_post': return FileText;
      case 'video': return Video;
      case 'social_media': return TrendingUp;
      case 'email': return Zap;
      case 'infographic': return Image;
      case 'podcast': return PenTool;
      default: return FileText;
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.title || !newPlan.planned_date) {
      return; // Basic validation
    }

    const result = await createPlan(newPlan);
    if (result) {
      setShowAddDialog(false);
      setNewPlan({
        title: '',
        description: '',
        content_type: 'blog_post',
        status: 'planned' as const,
        priority: 3,
        planned_date: '',
        platform: '',
        category: '',
        tags: [] as string[],
        notes: '',
      });
    }
  };

  const getStatsFromPlans = () => {
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const thisWeekEnd = addDays(thisWeekStart, 6);
    
    const thisWeekPlans = plans.filter(plan => {
      const planDate = new Date(plan.planned_date);
      return planDate >= thisWeekStart && planDate <= thisWeekEnd;
    });

    return {
      thisWeek: thisWeekPlans.length,
      inProgress: plans.filter(p => p.status === 'in_progress').length,
      completed: plans.filter(p => p.status === 'completed').length,
      efficiency: plans.length > 0 ? Math.round((plans.filter(p => p.status === 'completed').length / plans.length) * 100) : 0
    };
  };

  const stats = getStatsFromPlans();

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
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.thisWeek}</div>
                <div className="text-sm text-muted-foreground">Deze week gepland</div>
              </CardContent>
            </Card>
            <Card className="text-center border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600 mb-1">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In bewerking</div>
              </CardContent>
            </Card>
            <Card className="text-center border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Voltooid</div>
              </CardContent>
            </Card>
            <Card className="text-center border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.efficiency}%</div>
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
                        {dayContent.map((plan) => {
                          const IconComponent = getTypeIcon(plan.content_type);
                          return (
                            <div
                              key={plan.id}
                              className={`p-2 rounded text-xs border cursor-pointer hover:shadow-sm ${getStatusColor(plan.status)}`}
                              onClick={() => {
                                // Handle plan click - could open edit dialog
                                console.log('Plan clicked:', plan);
                              }}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <IconComponent className="h-3 w-3" />
                                <span className="font-medium capitalize">{plan.content_type.replace('_', ' ')}</span>
                                <Badge variant="outline" className="text-xs py-0 px-1 ml-auto">
                                  P{plan.priority}
                                </Badge>
                              </div>
                              <div className="text-xs opacity-90 line-clamp-2 font-medium">
                                {plan.title}
                              </div>
                              {plan.platform && (
                                <div className="text-xs opacity-70 mt-1">
                                  {plan.platform}
                                </div>
                              )}
                              {plan.category && (
                                <div className="text-xs opacity-60 mt-1">
                                  #{plan.category}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {dayContent.length === 0 && (
                          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-auto p-2 text-xs opacity-50 hover:opacity-100"
                                onClick={() => {
                                  setNewPlan(prev => ({
                                    ...prev,
                                    planned_date: format(day, 'yyyy-MM-dd')
                                  }));
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Voeg toe
                              </Button>
                            </DialogTrigger>
                          </Dialog>
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                  Nieuwe content plannen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nieuwe content plannen</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titel *</Label>
                      <Input
                        id="title"
                        value={newPlan.title}
                        onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                        placeholder="Titel van je content"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_type">Content Type</Label>
                      <Select value={newPlan.content_type} onValueChange={(value) => setNewPlan({...newPlan, content_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog_post">Blog Post</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="infographic">Infographic</SelectItem>
                          <SelectItem value="podcast">Podcast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      placeholder="Korte beschrijving van de content"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="planned_date">Geplande Datum *</Label>
                      <Input
                        id="planned_date"
                        type="date"
                        value={newPlan.planned_date}
                        onChange={(e) => setNewPlan({...newPlan, planned_date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioriteit</Label>
                      <Select value={newPlan.priority.toString()} onValueChange={(value) => setNewPlan({...newPlan, priority: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Laag</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3 - Normaal</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5 - Hoog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newPlan.status} onValueChange={(value: any) => setNewPlan({...newPlan, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Gepland</SelectItem>
                          <SelectItem value="in_progress">In bewerking</SelectItem>
                          <SelectItem value="completed">Voltooid</SelectItem>
                          <SelectItem value="cancelled">Geannuleerd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Input
                        id="platform"
                        value={newPlan.platform}
                        onChange={(e) => setNewPlan({...newPlan, platform: e.target.value})}
                        placeholder="YouTube, LinkedIn, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categorie</Label>
                      <Input
                        id="category"
                        value={newPlan.category}
                        onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
                        placeholder="SEO, Marketing, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notities</Label>
                    <Textarea
                      id="notes"
                      value={newPlan.notes}
                      onChange={(e) => setNewPlan({...newPlan, notes: e.target.value})}
                      placeholder="Extra notities of instructies"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleCreatePlan} disabled={loading || !newPlan.title || !newPlan.planned_date}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Plan aanmaken
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="lg">
              <Clock className="mr-2 h-5 w-5" />
              Bulk import CSV
            </Button>
            <Button variant="outline" size="lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Analytics bekijken
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentPlanner;