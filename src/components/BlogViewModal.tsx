import * as React from "react";
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
  const [open, setOpen] = React.useState(false);

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
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5" />
            Blog Voorvertoning
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Bekijk hoe je blogpost eruit ziet voor lezers
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[75vh] overflow-y-auto">
          <div className="space-y-8 p-6">
            {/* Header Section */}
            <header className="space-y-4 pb-6 border-b">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(post.status)} variant="outline">
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

              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight text-foreground">
                  {post.title}
                </h1>
                
                {post.summary && (
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                    {post.summary}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publish_date)}</span>
                </div>
                {post.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                )}
                {post.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{post.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  <span>{post.word_count || 0} woorden</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* Hero Image */}
            {post.hero_image_url && (
              <figure className="space-y-3">
                <img 
                  src={post.hero_image_url} 
                  alt={post.hero_image_alt || post.title}
                  className="w-full h-48 md:h-64 object-cover rounded-lg shadow-sm"
                />
                {post.hero_image_alt && (
                  <figcaption className="text-xs text-muted-foreground italic text-center">
                    {post.hero_image_alt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Content */}
            {post.body_markdown && (
              <article className="prose prose-sm md:prose-base max-w-none prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-li:text-foreground prose-strong:text-foreground prose-a:text-primary prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg md:text-xl font-medium mt-6 mb-3 text-foreground">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 space-y-2">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{children}</blockquote>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  }}
                >
                  {post.body_markdown}
                </ReactMarkdown>
              </article>
            )}

            {/* CTA Section */}
            {(post.cta_heading || post.cta_subtext) && (
              <aside className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-xl space-y-3">
                {post.cta_heading && (
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground">{post.cta_heading}</h3>
                )}
                {post.cta_subtext && (
                  <p className="text-muted-foreground leading-relaxed">{post.cta_subtext}</p>
                )}
              </aside>
            )}

            {/* FAQ Section */}
            {post.faq_json && Array.isArray(post.faq_json) && post.faq_json.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground">Veelgestelde Vragen</h3>
                <div className="space-y-4">
                  {post.faq_json.map((faq: any, index: number) => (
                    <div key={index} className="bg-muted/30 p-4 rounded-lg space-y-3">
                      <h4 className="font-semibold text-foreground text-base">{faq.q}</h4>
                      <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
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