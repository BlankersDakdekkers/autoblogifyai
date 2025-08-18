import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  Calendar, 
  User, 
  MapPin, 
  Hash,
  ExternalLink,
  FileText
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  publish_date: string;
  summary: string;
  author: string;
  city: string;
  canonical_url?: string;
  word_count: number;
  created_at: string;
  meta_title?: string;
  meta_description?: string;
  hero_image_url?: string;
  hero_image_alt?: string;
  body_markdown?: string;
  tags?: string[];
  faq_json?: any;
  cta_heading?: string;
  cta_subtext?: string;
}

interface BlogViewModalProps {
  post: BlogPost;
  children: React.ReactNode;
}

const BlogViewModal = ({ post, children }: BlogViewModalProps) => {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return "bg-green-100 text-green-800 border-green-200";
      case 'draft':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Blog Voorvertoning
          </DialogTitle>
          <DialogDescription>
            Bekijk hoe je blogpost eruit ziet
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(post.status)}>
                  {post.status === 'published' ? 'Gepubliceerd' : 'Concept'}
                </Badge>
                {post.canonical_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={post.canonical_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Live bekijken
                    </a>
                  </Button>
                )}
              </div>

              <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
              
              {post.summary && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {post.summary}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publish_date)}
                </div>
                {post.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                )}
                {post.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {post.city}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {post.word_count || 0} woorden
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Hero Image */}
            {post.hero_image_url && (
              <div className="space-y-2">
                <img 
                  src={post.hero_image_url} 
                  alt={post.hero_image_alt || post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {post.hero_image_alt && (
                  <p className="text-xs text-muted-foreground italic">
                    {post.hero_image_alt}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            {post.body_markdown && (
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>
                  {post.body_markdown}
                </ReactMarkdown>
              </div>
            )}

            {/* CTA Section */}
            {(post.cta_heading || post.cta_subtext) && (
              <>
                <Separator />
                <div className="bg-primary/5 p-6 rounded-lg space-y-3">
                  {post.cta_heading && (
                    <h3 className="text-xl font-semibold">{post.cta_heading}</h3>
                  )}
                  {post.cta_subtext && (
                    <p className="text-muted-foreground">{post.cta_subtext}</p>
                  )}
                </div>
              </>
            )}

            {/* FAQ Section */}
            {post.faq_json && Array.isArray(post.faq_json) && post.faq_json.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Veelgestelde Vragen</h3>
                  <div className="space-y-4">
                    {post.faq_json.map((faq: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <h4 className="font-medium">{faq.q}</h4>
                        <p className="text-muted-foreground">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SEO Info */}
            {(post.meta_title || post.meta_description) && (
              <>
                <Separator />
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    SEO Informatie
                  </h4>
                  {post.meta_title && (
                    <div>
                      <span className="text-sm font-medium">Meta Title:</span>
                      <p className="text-sm">{post.meta_title}</p>
                    </div>
                  )}
                  {post.meta_description && (
                    <div>
                      <span className="text-sm font-medium">Meta Description:</span>
                      <p className="text-sm">{post.meta_description}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BlogViewModal;