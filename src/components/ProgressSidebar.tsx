import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet,
  Database,
  Cpu,
  Download,
  Shield,
  ChevronRight,
  Activity
} from "lucide-react";

interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
}

interface ProgressSidebarProps {
  steps: ProcessingStep[];
  isProcessing: boolean;
  currentJob?: {
    id: string;
    total_rows: number;
    processed_rows: number;
    status: string;
  } | null;
}

export const ProgressSidebar = ({ steps, isProcessing, currentJob }: ProgressSidebarProps) => {
  const { state } = useSidebar();

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.id) {
      case 'download': return Download;
      case 'validate': return Shield;
      case 'parse': return FileSpreadsheet;
      case 'generate': return Cpu;
      case 'store': return Database;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'pending': return 'bg-muted-foreground/30';
      default: return 'bg-muted-foreground/30';
    }
  };

  const getOverallProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    const totalSteps = steps.length;
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };

  const isCollapsed = state === "collapsed";
  return (
    <Sidebar 
      className={`${isCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 border-r border-border`}
      collapsible="icon"
    >
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          {!isCollapsed && (
            <div>
              <h3 className="font-semibold text-sm">Verwerking</h3>
              <p className="text-xs text-muted-foreground">
                {isProcessing ? 'Bezig...' : 'Wachtend'}
              </p>
            </div>
          )}
        </div>
        <SidebarTrigger className="absolute top-2 right-2" />
      </div>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {!isCollapsed && "CSV Verwerking"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            {/* Overall Progress */}
            {!isCollapsed && (isProcessing || steps.some(s => s.status !== 'pending')) && (
              <div className="mb-6 p-3 bg-card rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Totale Voortgang</span>
                  <Badge variant={isProcessing ? "secondary" : "outline"} className="text-xs">
                    {Math.round(getOverallProgress())}%
                  </Badge>
                </div>
                <Progress value={getOverallProgress()} className="h-2" />
                {currentJob && (
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{currentJob.processed_rows} van {currentJob.total_rows}</span>
                    <span>{currentJob.status}</span>
                  </div>
                )}
              </div>
            )}

            <SidebarMenu>
              {steps.map((step, index) => {
                const StepIcon = getStepIcon(step);
                const isActive = step.status === 'running';
                const isCompleted = step.status === 'completed';
                const isFailed = step.status === 'failed';

                return (
                  <SidebarMenuItem key={step.id}>
                    <div className={`p-3 rounded-lg border transition-all duration-300 ${
                      isActive ? 'bg-primary/5 border-primary/20 animate-fade-in' : 
                      isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                      isFailed ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
                      'bg-card border-border'
                    }`}>
                      <div className="flex items-start gap-3">
                        {/* Step Number/Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isCollapsed ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                              <StepIcon className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getStatusColor(step.status)} text-white`}>
                                {index + 1}
                              </div>
                              {getStatusIcon(step.status)}
                            </div>
                          )}
                        </div>

                        {/* Step Content */}
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">{step.name}</h4>
                              <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ${
                                isActive ? 'rotate-90' : ''
                              }`} />
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {step.description}
                            </p>

                            {/* Progress Bar */}
                            {step.status !== 'pending' && (
                              <div className="space-y-1">
                                <Progress 
                                  value={step.progress} 
                                  className="h-1.5"
                                />
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {step.status === 'running' ? 'Bezig...' : 
                                     step.status === 'completed' ? 'Voltooid' :
                                     step.status === 'failed' ? 'Mislukt' : 'Wachtend'}
                                  </span>
                                  <span className="font-medium">{step.progress}%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Connection Line */}
                      {index < steps.length - 1 && !isCollapsed && (
                        <div className={`ml-3 mt-2 h-4 w-px ${
                          step.status === 'completed' ? 'bg-green-300' : 
                          step.status === 'running' ? 'bg-primary/30' :
                          'bg-border'
                        }`} />
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            {/* Processing Stats */}
            {!isCollapsed && currentJob && isProcessing && (
              <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Live Statistieken
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verwerkt:</span>
                    <span className="font-medium">{currentJob.processed_rows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Totaal:</span>
                    <span className="font-medium">{currentJob.total_rows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resterend:</span>
                    <span className="font-medium">{currentJob.total_rows - currentJob.processed_rows}</span>
                  </div>
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};