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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      // Reset file input
      event.target.value = '';
    }
  }, [toast, onPreviewGenerated]);

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
            <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    Selecteer bestand
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  CSV, XLS of XLSX bestanden (max 10MB)
                </p>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Bestand wordt verwerkt...</span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {showPreview && previewItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Preview Resultaten
                </CardTitle>
                <CardDescription>
                  {previewItems.length} items gevonden in {fileName}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={clearPreview} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Wissen
                </Button>
                <Button 
                  onClick={handlePublishAll}
                  disabled={isPublishing}
                  size="sm"
                >
                  {isPublishing ? (
                    <>
                      <Upload className="h-4 w-4 mr-1 animate-spin" />
                      Publiceren...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Alles Publiceren
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {previewItems.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2 bg-card"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <div className="flex gap-1">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-muted rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Categorie: {item.category}</span>
                    <span>Type: {item.type}</span>
                    <span>Auteur: {item.author}</span>
                  </div>
                </div>
              ))}
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