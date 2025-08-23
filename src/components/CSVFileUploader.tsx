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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bestand Upload
          </CardTitle>
          <CardDescription>
            Upload een CSV of Excel bestand om content te importeren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div 
              className={`relative flex items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                isDragOver 
                  ? 'border-primary bg-primary/5 scale-102' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
              } ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto transition-all duration-200 ${isDragOver ? 'scale-110' : ''}`}>
                  <FileSpreadsheet className={`mx-auto h-16 w-16 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                
                {!isUploading ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {isDragOver ? 'Laat bestand hier vallen' : 'Upload je CSV of Excel bestand'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sleep en laat vallen of klik om te selecteren
                      </p>
                    </div>
                    
                    <Button 
                      type="button" 
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecteer Bestand
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto h-8 w-8 animate-pulse text-primary" />
                    <div>
                      <p className="text-lg font-medium">Bestand wordt verwerkt...</p>
                      <p className="text-sm text-muted-foreground">Even geduld alstublieft</p>
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
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Preview Resultaten
                </CardTitle>
                <CardDescription className="text-green-600">
                  <strong>{previewItems.length}</strong> items gevonden in <span className="font-mono text-xs">{fileName}</span>
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={clearPreview} variant="outline" size="sm" className="order-2 sm:order-1">
                  <X className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Wissen</span>
                </Button>
                <Button 
                  onClick={handlePublishAll}
                  disabled={isPublishing}
                  size="sm"
                  className="order-1 sm:order-2 bg-green-600 hover:bg-green-700"
                >
                  {isPublishing ? (
                    <>
                      <Upload className="h-4 w-4 mr-1 animate-spin" />
                      <span className="hidden sm:inline">Publiceren...</span>
                      <span className="sm:hidden">Bezig...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Alles Publiceren</span>
                      <span className="sm:hidden">Publiceren</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {previewItems.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="border border-green-200 rounded-xl p-4 space-y-3 bg-white/80 hover:bg-white transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <h4 className="font-semibold text-sm text-green-800 line-clamp-2">{item.title}</h4>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Categorie:</span> {item.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Type:</span> {item.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Auteur:</span> {item.author}
                    </span>
                  </div>
                </div>
              ))}
              
              {previewItems.length > 5 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    En nog {previewItems.length - 5} items meer...
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