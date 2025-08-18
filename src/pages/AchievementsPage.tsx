import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  Star, 
  Crown, 
  Target, 
  Zap, 
  TrendingUp,
  Users,
  Calendar,
  Award,
  Medal,
  Flame,
  CheckCircle2,
  Lock,
  Timer,
  Gift,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "content" | "seo" | "engagement" | "milestone" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  requirements?: string[];
}

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  totalAchievements: number;
  recentAchievement?: string;
}

const AchievementsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userLevel] = useState(12);
  const [userXP] = useState(2847);
  const [userRank] = useState(3);
  const [nextLevelXP] = useState(3000);

  const { toast } = useToast();

  const achievements: Achievement[] = [
    {
      id: "first-post",
      title: "Eerste Stappen",
      description: "Publiceer je eerste blogpost",
      icon: Star,
      category: "content",
      rarity: "common",
      points: 100,
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: "2024-01-15"
    },
    {
      id: "prolific-writer",
      title: "Productieve Schrijver",
      description: "Publiceer 100 blogposts",
      icon: Trophy,
      category: "content",
      rarity: "epic",
      points: 1000,
      progress: 87,
      target: 100,
      unlocked: false
    },
    {
      id: "seo-master",
      title: "SEO Meester",
      description: "Behaal 10 top-3 rankings in Google",
      icon: Crown,
      category: "seo",
      rarity: "legendary",
      points: 2500,
      progress: 7,
      target: 10,
      unlocked: false
    },
    {
      id: "viral-content",
      title: "Viral Hit",
      description: "Een post krijgt 10.000+ views in 24 uur",
      icon: Flame,
      category: "engagement",
      rarity: "rare",
      points: 500,
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: "2024-01-20"
    },
    {
      id: "consistent-creator",
      title: "Consistente Creator",
      description: "Publiceer 30 dagen achter elkaar",
      icon: Calendar,
      category: "milestone",
      rarity: "rare",
      points: 750,
      progress: 23,
      target: 30,
      unlocked: false
    },
    {
      id: "ai-pioneer",
      title: "AI Pioneer",
      description: "Gebruik alle AI features van het platform",
      icon: Sparkles,
      category: "special",
      rarity: "epic",
      points: 1500,
      progress: 3,
      target: 5,
      unlocked: false
    }
  ];

  const leaderboard: LeaderboardUser[] = [
    {
      rank: 1,
      name: "Sarah van der Berg",
      avatar: "/placeholder.svg",
      level: 25,
      xp: 8540,
      totalAchievements: 34,
      recentAchievement: "SEO Meester"
    },
    {
      rank: 2,
      name: "Marco Jansen", 
      avatar: "/placeholder.svg",
      level: 18,
      xp: 5230,
      totalAchievements: 28,
      recentAchievement: "Viral Hit"
    },
    {
      rank: 3,
      name: "Jij",
      avatar: "/placeholder.svg",
      level: userLevel,
      xp: userXP,
      totalAchievements: 12,
      recentAchievement: "Consistente Creator"
    },
    {
      rank: 4,
      name: "Lisa Chen",
      avatar: "/placeholder.svg", 
      level: 11,
      xp: 2650,
      totalAchievements: 15,
      recentAchievement: "Eerste Stappen"
    },
    {
      rank: 5,
      name: "Tom de Vries",
      avatar: "/placeholder.svg",
      level: 9,
      xp: 1890,
      totalAchievements: 8,
      recentAchievement: "Productieve Schrijver"
    }
  ];

  const challenges = [
    {
      title: "Weekend Warrior",
      description: "Publiceer 5 posts dit weekend",
      reward: "500 XP + Exclusive Badge",
      timeLeft: "2 dagen",
      progress: 2,
      target: 5,
      active: true
    },
    {
      title: "SEO Sprint",
      description: "Optimaliseer 10 posts voor nieuwe keywords",
      reward: "1000 XP + SEO Badge",
      timeLeft: "5 dagen",
      progress: 3,
      target: 10,
      active: true
    },
    {
      title: "Engagement Boost",
      description: "Krijg 1000 nieuwe website bezoekers deze maand",
      reward: "2000 XP + Viral Badge",
      timeLeft: "12 dagen",
      progress: 650,
      target: 1000,
      active: true
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600 border-gray-200 bg-gray-50";
      case "rare": return "text-blue-600 border-blue-200 bg-blue-50";
      case "epic": return "text-purple-600 border-purple-200 bg-purple-50";
      case "legendary": return "text-yellow-600 border-yellow-200 bg-yellow-50";
      default: return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "content": return Trophy;
      case "seo": return Target;
      case "engagement": return TrendingUp;
      case "milestone": return Award;
      case "special": return Crown;
      default: return Star;
    }
  };

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  const claimReward = (challengeTitle: string) => {
    toast({
      title: "Beloning ontvangen!",
      description: `Je hebt de "${challengeTitle}" challenge voltooid!`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trofeeën & Rankings</h2>
          <p className="text-muted-foreground">
            Verdien achievements en klim omhoog in de rankings
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">Level {userLevel}</div>
          <div className="text-sm text-muted-foreground">{userXP.toLocaleString()} XP</div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huidige Rang</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{userRank}</div>
            <p className="text-xs text-muted-foreground">
              van 2,847 gebruikers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnlocked}/{achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              ontgrendeld
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal XP</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalXP.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              verdiende punten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tot Volgend Level</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextLevelXP - userXP}</div>
            <Progress value={(userXP / nextLevelXP) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Beloningen</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mijn Achievements</CardTitle>
                  <CardDescription>
                    Ontgrendel badges door verschillende doelen te behalen
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    Alle
                  </Button>
                  <Button 
                    variant={selectedCategory === "content" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("content")}
                  >
                    Content
                  </Button>
                  <Button 
                    variant={selectedCategory === "seo" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("seo")}
                  >
                    SEO
                  </Button>
                  <Button 
                    variant={selectedCategory === "engagement" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("engagement")}
                  >
                    Engagement
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAchievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  const progressPercentage = (achievement.progress / achievement.target) * 100;
                  
                  return (
                    <Card 
                      key={achievement.id} 
                      className={`relative transition-all duration-300 hover:scale-105 ${
                        achievement.unlocked 
                          ? "border-primary bg-primary/5" 
                          : "border-muted opacity-60"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col items-end">
                            <Badge className={getRarityColor(achievement.rarity)} variant="outline">
                              {achievement.rarity}
                            </Badge>
                            <div className="text-sm font-medium mt-1">
                              +{achievement.points} XP
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {achievement.description}
                        </p>
                        
                        {!achievement.unlocked ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Voortgang</span>
                              <span>{achievement.progress}/{achievement.target}</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              Ontgrendeld op {achievement.unlockedAt}
                            </span>
                          </div>
                        )}

                        {achievement.unlocked && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-yellow-400 rounded-full p-1">
                              <Crown className="h-4 w-4 text-yellow-800" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>
                Zie hoe je presteert ten opzichte van andere gebruikers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div 
                    key={user.rank} 
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                      user.name === "Jij" 
                        ? "bg-primary/5 border-primary" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      {user.rank <= 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                          user.rank === 2 ? "bg-gray-100 text-gray-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-muted-foreground">
                          #{user.rank}
                        </div>
                      )}
                    </div>
                    
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{user.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Level {user.level}</span>
                        <span>{user.xp.toLocaleString()} XP</span>
                        <span>{user.totalAchievements} achievements</span>
                      </div>
                    </div>
                    
                    {user.recentAchievement && (
                      <Badge variant="secondary" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        {user.recentAchievement}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actieve Challenges</CardTitle>
              <CardDescription>
                Voltooi tijdelijke uitdagingen voor extra beloningen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {challenge.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            <Timer className="h-3 w-3 mr-1" />
                            {challenge.timeLeft}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {challenge.reward}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Voortgang</span>
                          <span>{challenge.progress}/{challenge.target}</span>
                        </div>
                        <Progress 
                          value={(challenge.progress / challenge.target) * 100} 
                          className="h-2" 
                        />
                      </div>
                      
                      {challenge.progress >= challenge.target && (
                        <Button 
                          className="w-full mt-3" 
                          onClick={() => claimReward(challenge.title)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Beloning Claimen
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beschikbare Beloningen</CardTitle>
              <CardDescription>
                Wissel je XP in voor exclusieve beloningen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Crown className="h-8 w-8 mx-auto mb-3 text-yellow-600" />
                    <h4 className="font-semibold mb-2">Premium Theme</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Exclusief dashboard thema
                    </p>
                    <div className="text-lg font-bold text-primary mb-3">
                      2,500 XP
                    </div>
                    <Button size="sm" disabled={userXP < 2500}>
                      {userXP >= 2500 ? "Ontgrendelen" : "Niet genoeg XP"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <h4 className="font-semibold mb-2">AI Boost</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Extra AI credits voor 1 maand
                    </p>
                    <div className="text-lg font-bold text-primary mb-3">
                      1,000 XP
                    </div>
                    <Button size="sm" disabled={userXP < 1000}>
                      Claimen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Gift className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <h4 className="font-semibold mb-2">Custom Badge</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ontwerp je eigen achievement badge
                    </p>
                    <div className="text-lg font-bold text-primary mb-3">
                      5,000 XP
                    </div>
                    <Button size="sm" disabled={userXP < 5000}>
                      Ontgrendelen
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AchievementsPage;