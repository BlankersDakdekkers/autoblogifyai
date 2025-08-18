import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight, User, FileText, Target } from 'lucide-react';

const OnboardingPage = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: profile?.display_name || '',
    bio: profile?.bio || '',
    goals: [] as string[],
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const goalOptions = [
    'Content schaalbaar maken',
    'SEO verbeteren',
    'Tijd besparen',
    'Meer organisch verkeer',
    'Brand autoriteit opbouwen',
    'Lead generatie',
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await updateProfile({
      display_name: formData.displayName,
      bio: formData.bio,
      onboarding_completed: true,
    });
    
    navigate('/dashboard');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.displayName.trim().length > 0;
      case 2:
        return formData.bio.trim().length > 0;
      case 3:
        return formData.goals.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welkom bij AutoblogifyAI</h1>
          <p className="text-muted-foreground mt-2">
            Laten we je account instellen om de beste ervaring te bieden
          </p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Stap {currentStep} van {totalSteps}</span>
            <span>{Math.round(progress)}% voltooid</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              {currentStep === 1 && <User className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <FileText className="h-5 w-5 text-primary" />}
              {currentStep === 3 && <Target className="h-5 w-5 text-primary" />}
              <CardTitle>
                {currentStep === 1 && 'Persoonlijke informatie'}
                {currentStep === 2 && 'Vertel over jezelf'}
                {currentStep === 3 && 'Jouw doelen'}
              </CardTitle>
            </div>
            <CardDescription>
              {currentStep === 1 && 'Hoe mogen we je noemen?'}
              {currentStep === 2 && 'Deel wat meer over je achtergrond'}
              {currentStep === 3 && 'Wat wil je bereiken met AutoblogifyAI?'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Weergavenaam</Label>
                  <Input
                    id="displayName"
                    placeholder="Hoe wil je genoemd worden?"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Vertel iets over jezelf, je bedrijf of je rol..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecteer je doelen (kies er minimaal één)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <div
                        key={goal}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.goals.includes(goal)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleGoalToggle(goal)}
                      >
                        <div className="flex items-center space-x-2">
                          {formData.goals.includes(goal) && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">{goal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Vorige
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Volgende
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                >
                  Voltooien
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;