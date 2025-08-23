import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  X,
  Zap,
  Database,
  FileText,
  Brain,
  Download
} from 'lucide-react';
import { ProcessingProgress as ProgressType } from '@/hooks/useCSVProcessor';

interface ProcessingProgressProps {
  progress: ProgressType[];
  overallProgress: number;
  isProcessing: boolean;
  onCancel?: () => void;
  currentStep?: ProgressType;
}

const stepIcons = {
  download: Download,
  validate: CheckCircle,
  parse: FileText,
  generate: Brain,
  store: Database,
};

const stepLabels = {
  download: 'CSV Downloaden',
  validate: 'Schema Validatie',
  parse: 'Data Parsing',
  generate: 'AI Content Generatie',
  store: 'Database Opslag',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-600',
  running: 'bg-blue-100 text-blue-700 animate-pulse',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const statusIcons = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: AlertCircle,
};

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  overallProgress,
  isProcessing,
  onCancel,
  currentStep
}) => {
  const getStatusIcon = (status: ProgressType['status']) => {
    const IconComponent = statusIcons[status];
    return <IconComponent className={`h-4 w-4 ${status === 'running' ? 'animate-spin' : ''}`} />;
  };

  const getStepIcon = (step: ProgressType['step']) => {
    const IconComponent = stepIcons[step];
    return <IconComponent className="h-5 w-5" />;
  };

  if (progress.length === 0) return null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="h-5 w-5" />
            <span>Verwerkingsvoortgang</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isProcessing ? "default" : "secondary"}
              className={isProcessing ? "bg-blue-600 text-white" : ""}
            >
              {Math.round(overallProgress)}% Voltooid
            </Badge>
            {isProcessing && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Annuleren
              </Button>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2 mt-4">
          <Progress 
            value={overallProgress} 
            className="h-3"
          />
          {currentStep && (
            <p className="text-sm text-blue-700 font-medium">
              {currentStep.message || `${stepLabels[currentStep.step]} wordt uitgevoerd...`}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {progress.map((step, index) => (
          <div
            key={step.step}
            className={`
              flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300
              ${step.status === 'running' 
                ? 'border-blue-300 bg-blue-50 shadow-md' 
                : step.status === 'completed'
                ? 'border-green-300 bg-green-50'
                : step.status === 'failed'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-gray-50'
              }
            `}
          >
            {/* Step Number & Icon */}
            <div className="flex items-center gap-3">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  ${step.status === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : step.status === 'running'
                    ? 'bg-blue-600 text-white'
                    : step.status === 'failed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }
                `}
              >
                {step.status === 'completed' || step.status === 'failed' ? (
                  getStatusIcon(step.status)
                ) : (
                  index + 1
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStepIcon(step.step)}
                  <h3 className="font-semibold text-gray-800">
                    {stepLabels[step.step]}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={statusColors[step.status]}
                  >
                    {step.status === 'pending' && 'Wachtend'}
                    {step.status === 'running' && 'Actief'}
                    {step.status === 'completed' && 'Voltooid'}
                    {step.status === 'failed' && 'Gefaald'}
                  </Badge>
                </div>
                
                {step.message && (
                  <p className="text-sm text-gray-600">
                    {step.message}
                  </p>
                )}
              </div>
            </div>

            {/* Progress for current step */}
            {step.status === 'running' && step.progress > 0 && (
              <div className="flex-1">
                <Progress value={step.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(step.progress)}%
                </p>
              </div>
            )}

            {/* Details for completed/failed steps */}
            {step.details && (
              <div className="text-xs text-gray-500">
                {step.status === 'completed' && step.details.duration && (
                  <span>⏱️ {step.details.duration}s</span>
                )}
                {step.status === 'failed' && step.details.error && (
                  <span className="text-red-600">❌ {step.details.error}</span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Processing Summary */}
        {isProcessing && (
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <div className="flex items-center gap-2 text-blue-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">
                Verwerking actief - Dit kan enkele minuten duren
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Je kunt de pagina sluiten, de verwerking gaat door op de achtergrond.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};