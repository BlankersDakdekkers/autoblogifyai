import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CSVPreviewItem {
  title: string;
  content: string;
  category: string;
  type: string;
  author: string;
  tags: string[];
}

interface CSVFileUploaderProps {
  onPreviewGenerated: (items: CSVPreviewItem[], fileName: string) => void;
  onPublishItems: (items: CSVPreviewItem[], fileName: string) => Promise<void>;
}

export const CSVFileUploader = ({ onPreviewGenerated, onPublishItems }: CSVFileUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewItems, setPreviewItems] = useState<CSVPreviewItem[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Upload alleen CSV of Excel bestanden (.csv, .xlsx, .xls)",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setPreviewItems([]);
    setShowPreview(false);

    try {
      // Get user session
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.access_token) {
        throw new Error("Niet ingelogd");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'setup'); // default category

      // Call parse-excel edge function
      const response = await fetch(`https://pmhplzqfdmgkkosapkit.supabase.co/functions/v1/parse-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Fout bij verwerken bestand');
      }

      setPreviewItems(result.preview || []);
      setFileName(result.fileName || file.name);
      setShowPreview(true);
      onPreviewGenerated(result.preview || [], result.fileName || file.name);

      toast({
        title: "Bestand succesvol verwerkt! 🎉",
        description: `${result.preview?.length || 0} items gevonden voor preview`
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast, onPreviewGenerated]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
      // Reset file input
      event.target.value = '';
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handlePublishAll = async () => {
    if (previewItems.length === 0) return;

    setIsPublishing(true);
    try {
      await onPublishItems(previewItems, fileName);
      
      // Clear preview after successful publish
      setPreviewItems([]);
      setShowPreview(false);
      setFileName("");
      
      toast({
        title: "Items gepubliceerd! 🎉",
        description: `${previewItems.length} items succesvol toegevoegd aan knowledge base`
      });
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "Publicatie fout",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden bij publiceren",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const clearPreview = () => {
    setPreviewItems([]);
    setShowPreview(false);
    setFileName("");
  };

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <Card className="overflow-hidden border-2 border-gradient-to-r from-primary/20 to-secondary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Upload className="h-6 w-6" />
            <span className="font-bold">✨ Bestand Upload</span>
          </CardTitle>
          <CardDescription className="text-base">
            🚀 Upload een CSV of Excel bestand om content te importeren met AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div 
              className={`relative flex items-center justify-center border-4 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                isDragOver 
                  ? 'border-primary bg-primary/10 scale-105 shadow-lg' 
                  : 'border-primary/30 hover:border-primary hover:bg-primary/5 hover:shadow-md'
              } ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'} bg-gradient-to-br from-blue-50 to-purple-50`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="text-center space-y-6">
                <div className={`mx-auto transition-all duration-300 ${isDragOver ? 'scale-125 animate-bounce' : ''}`}>
                  <FileSpreadsheet className={`mx-auto h-20 w-20 ${isDragOver ? 'text-primary animate-pulse' : 'text-primary/70'}`} />
                </div>
                
                {!isUploading ? (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-primary">
                        {isDragOver ? '🎯 Laat bestand hier vallen!' : '📁 Upload je CSV of Excel bestand'}
                      </h3>
                      <p className="text-base text-muted-foreground font-medium">
                        Sleep en laat vallen of klik om te selecteren
                      </p>
                    </div>
                    
                    <Button 
                      type="button" 
                      size="lg"
                      className="mt-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Selecteer Bestand
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 animate-pulse text-primary" />
                    <div>
                      <p className="text-xl font-bold text-primary">⚡ Bestand wordt verwerkt...</p>
                      <p className="text-base text-muted-foreground">Even geduld alstublieft</p>
                    </div>
                  </div>
                )}
                
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground justify-center">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Ondersteunt CSV, XLS, XLSX
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Maximaal 10MB</span>
              <span className="hidden sm:inline">•</span>
              <span>Drag & drop ondersteund</span>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {showPreview && previewItems.length > 0 && (
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-green-800">
                  <div className="p-2 rounded-full bg-green-600">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold">✅ Preview Resultaten</span>
                </CardTitle>
                <CardDescription className="text-green-700 text-base">
                  <strong className="text-lg">{previewItems.length}</strong> items succesvol gevonden in 
                  <span className="font-mono text-sm bg-green-200 px-2 py-1 rounded ml-1">{fileName}</span>
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={clearPreview} 
                  variant="outline" 
                  size="sm" 
                  className="order-2 sm:order-1 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <X className="h-4 w-4 mr-2" />
                  <span>Wissen</span>
                </Button>
                <Button 
                  onClick={handlePublishAll}
                  disabled={isPublishing}
                  size="sm"
                  className="order-1 sm:order-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6"
                >
                  {isPublishing ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      <span>Publiceren...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>🚀 Alles Publiceren</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {previewItems.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="relative bg-white border-2 border-green-200 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          #{index + 1}
                        </span>
                        <span className="text-xs text-green-600 font-medium uppercase tracking-wide">
                          {item.type}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-gray-800 leading-tight line-clamp-2">
                        {item.title}
                      </h4>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* Item Footer */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">📁 Categorie:</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">👤 Auteur:</span>
                      <span>{item.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">📊 Woorden:</span>
                      <span>~{item.content.length}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {previewItems.length > 3 && (
                <div className="text-center py-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-dashed border-green-300">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">+</span>
                    </div>
                    <p className="text-green-800 font-semibold">
                      En nog <strong>{previewItems.length - 3}</strong> items meer klaar voor publicatie!
                    </p>
                  </div>
                  <p className="text-green-600 text-sm">
                    Alle {previewItems.length} items worden gepubliceerd wanneer je op "Alles Publiceren" klikt
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showPreview && previewItems.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-2 text-sm font-semibold">Geen data gevonden</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Het bestand bevat geen geldige data of mist verplichte kolommen
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};