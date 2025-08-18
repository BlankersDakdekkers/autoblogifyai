# AutoblogifyAI CSV Functionaliteit - TODO Lijst

## 🎯 Huidige Status
- ✅ UI/UX voor CSV import is gereed
- ✅ Database tabellen zijn aangemaakt (blog_posts, csv_processing_jobs)
- ✅ Edge functions zijn geïmplementeerd (process-csv, wordpress-publish, generate-keywords)
- ❌ Frontend integratie met backend ontbreekt
- ❌ Echte CSV verwerking werkt nog niet
- ❌ Validatie en error handling moet worden verbeterd

## 📋 Prioriteit 1: Core CSV Functionaliteit

### 1. Frontend <-> Backend Integratie
- [ ] **CSV Upload Component maken**
  - Supabase edge function aanroepen vanuit frontend
  - Loading states en progress tracking
  - Error handling en user feedback

### 2. CSV Verwerking Edge Function Verbeteren
- [ ] **process-csv function uitbreiden**
  - CSV parsing en validatie
  - Row-by-row processing met progress updates
  - Database inserts naar blog_posts tabel
  - Error logging naar csv_processing_jobs

### 3. Real-time Status Updates
- [ ] **Supabase Realtime implementeren**
  - Live progress updates tijdens CSV verwerking
  - Status changes van jobs in real-time tonen
  - WebSocket verbinding voor instant feedback

## 📋 Prioriteit 2: Validatie & Error Handling

### 4. CSV Schema Validatie
- [ ] **Veld validatie implementeren**
  - Verplichte velden (title, slug, status, publish_date)
  - Datatype validatie (datum formaat, JSON structuur)
  - Slug format checking (lowercase, dashes only)
  - Duplicate slug detection

### 5. User Feedback Systeem
- [ ] **Error Reporting**
  - Duidelijke foutmeldingen per rij
  - Suggestions voor fixes
  - Download van error rapport
  - Retry mechanisme voor gefaalde rows

## 📋 Prioriteit 3: Content Generatie

### 6. AI Content Generation
- [ ] **OpenAI integratie voltooien**
  - Body content genereren op basis van metadata
  - SEO optimalisatie (title tags, meta descriptions)
  - FAQ generatie vanuit JSON input
  - Afbeelding alt-text generatie

### 7. Bulk Processing
- [ ] **Batch processing optimaliseren**
  - Queue systeem voor grote CSV bestanden
  - Rate limiting voor API calls
  - Parallel processing waar mogelijk
  - Memory management voor grote datasets

## 📋 Prioriteit 4: WordPress Integratie

### 8. WordPress Publishing
- [ ] **wordpress-publish function uitbreiden**
  - WordPress API authenticatie
  - Post scheduling functionaliteit
  - Media upload (featured images)
  - Category en tag assignment
  - Custom fields mapping

### 9. Multi-site Support
- [ ] **Meerdere WordPress sites**
  - Site configuratie management
  - Conditional publishing rules
  - Site-specific templates
  - Cross-posting capabilities

## 📋 Prioriteit 5: Advanced Features

### 10. Template System
- [ ] **Content templates**
  - Predefined post structures
  - Variable substitution
  - Conditional content blocks
  - Template library management

### 11. SEO & Analytics
- [ ] **SEO verbetering**
  - Keyword density analysis
  - Readability scoring
  - Internal linking suggestions
  - Schema markup generation

### 12. Scheduling & Automation
- [ ] **Geavanceerde planning**
  - Cron job scheduling
  - Time zone support
  - Conditional publishing (weather, news, etc.)
  - Social media integration

## 🔧 Technische Implementatie

### Database Updates Nodig:
```sql
-- Extra kolommen voor blog_posts tabel
ALTER TABLE blog_posts ADD COLUMN processing_status TEXT DEFAULT 'pending';
ALTER TABLE blog_posts ADD COLUMN error_message TEXT;
ALTER TABLE blog_posts ADD COLUMN wordpress_post_id INTEGER;
ALTER TABLE blog_posts ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE;
```

### Edge Functions Te Maken:
- `validate-csv`: CSV structuur validatie
- `generate-content`: AI content generatie
- `schedule-posts`: Geplande publicatie
- `sync-wordpress`: WordPress synchronisatie

### Frontend Components Te Maken:
- `CSVUploader.tsx`: File upload met drag & drop
- `ProcessingStatus.tsx`: Real-time progress indicator
- `ErrorReport.tsx`: Error display en fixing suggestions
- `ContentPreview.tsx`: Preview van gegenereerde content

## 🚀 Quick Wins (Deze Week)

1. **CSV Upload Component** - Simpele file upload met backend call
2. **Progress Tracking** - Basic progress bar en status updates  
3. **Error Display** - Toon validatie errors aan gebruiker
4. **Real CSV Parsing** - Vervang mock data met echte CSV processing

## 📞 Vervolgstappen

Na implementatie van bovenstaande punten:
- User testing met echte CSV bestanden
- Performance optimization voor grote datasets
- Security audit van file uploads
- Backup en recovery procedures
- Monitoring en alerting setup

---
*Laatste update: 18 augustus 2025*