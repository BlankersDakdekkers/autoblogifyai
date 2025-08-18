import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  BookOpen,
  Award,
  Video,
  FileText,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CoursePage = () => {
  const { toast } = useToast();
  const [userPlan] = useState("free"); // free, pro, premium

  const courses = [
    {
      id: 1,
      title: "AutoblogifyAI Masterclass",
      description: "Leer hoe je complete content workflows automatiseert",
      level: "Beginner",
      duration: "4 uur",
      students: 1247,
      rating: 4.8,
      price: "Gratis",
      thumbnail: "/api/placeholder/300/200",
      modules: [
        { id: 1, title: "Introductie tot AutoblogifyAI", duration: "15 min", free: true, completed: false },
        { id: 2, title: "Google Sheets Setup", duration: "25 min", free: true, completed: false },
        { id: 3, title: "CSV Schema & Validatie", duration: "30 min", free: false, completed: false },
        { id: 4, title: "Content Generatie Workflow", duration: "45 min", free: false, completed: false },
        { id: 5, title: "SEO Optimalisatie", duration: "35 min", free: false, completed: false },
        { id: 6, title: "Publicatie & Scheduling", duration: "40 min", free: false, completed: false }
      ]
    },
    {
      id: 2,
      title: "Advanced SEO Content Strategies",
      description: "Geavanceerde technieken voor content die ranking",
      level: "Gevorderd",
      duration: "6 uur",
      students: 892,
      rating: 4.9,
      price: "€49",
      thumbnail: "/api/placeholder/300/200",
      modules: [
        { id: 1, title: "Keyword Research Automation", duration: "45 min", free: false, completed: false },
        { id: 2, title: "Content Clustering", duration: "50 min", free: false, completed: false },
        { id: 3, title: "Local SEO Workflows", duration: "60 min", free: false, completed: false },
        { id: 4, title: "Schema Markup Implementatie", duration: "40 min", free: false, completed: false }
      ]
    },
    {
      id: 3,
      title: "Website Builder Professional",
      description: "Bouw professionele websites met onze tools",
      level: "Intermediate",
      duration: "5 uur",
      students: 623,
      rating: 4.7,
      price: "€29",
      thumbnail: "/api/placeholder/300/200",
      modules: [
        { id: 1, title: "Template Customization", duration: "35 min", free: true, completed: false },
        { id: 2, title: "Component Libraries", duration: "40 min", free: false, completed: false },
        { id: 3, title: "Deployment Strategies", duration: "30 min", free: false, completed: false }
      ]
    }
  ];

  const handleStartLesson = (courseId: number, moduleId: number, isFree: boolean) => {
    if (!isFree && userPlan === "free") {
      toast({
        title: "Premium Content 🔒",
        description: "Deze les is alleen beschikbaar voor Pro/Premium leden. Upgrade je account!",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Les Gestart! 🎓",
      description: "Video wordt geladen..."
    });
  };

  const getProgress = (modules: any[]) => {
    const completed = modules.filter(m => m.completed).length;
    return (completed / modules.length) * 100;
  };

  const canAccessContent = (isFree: boolean) => {
    return isFree || userPlan !== "free";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AutoblogifyAI Academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Masterclass cursussen om je content workflow te automatiseren en 
            <span className="font-semibold text-primary"> 95% tijd te besparen</span>
          </p>
          
          {userPlan === "free" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-2 text-amber-700">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Gratis Account</span>
              </div>
              <p className="text-sm text-amber-600 mt-1">
                Upgrade voor toegang tot premium cursussen
              </p>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20" />
                <div className="relative z-10">
                  <Play className="h-12 w-12 text-primary" />
                </div>
                <Badge className="absolute top-2 right-2 bg-white/90 text-primary">
                  {course.level}
                </Badge>
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-primary">{course.price}</div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.students}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                    {course.rating}
                  </div>
                </div>
                
                <Progress value={getProgress(course.modules)} className="h-2" />
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {course.modules.slice(0, 3).map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {!canAccessContent(module.free) ? (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        ) : module.completed ? (
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Video className="h-3 w-3 text-primary" />
                        )}
                        <span className={!canAccessContent(module.free) ? "text-muted-foreground" : ""}>
                          {module.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{module.duration}</span>
                    </div>
                  ))}
                  {course.modules.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{course.modules.length - 3} meer modules
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => handleStartLesson(course.id, 1, course.modules[0]?.free || false)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Cursus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Detail Modal zou hier komen met meer modules */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Premium Voordelen
            </CardTitle>
            <CardDescription>
              Upgrade voor volledige toegang tot alle cursussen en materialen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Video className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">HD Video Content</div>
                  <div className="text-sm text-muted-foreground">Alle lessen in 1080p</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Downloadbare Resources</div>
                  <div className="text-sm text-muted-foreground">Templates & checklists</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Certificaten</div>
                  <div className="text-sm text-muted-foreground">Bewijs je expertise</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursePage;