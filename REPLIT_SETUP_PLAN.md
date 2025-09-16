# 🚀 AutoblogifyAI Replit Setup Plan - Direct Copy/Paste

## 📋 STAP 1: Replit Project Aanmaken

1. Ga naar **replit.com**
2. Klik **+ Create Repl**
3. Kies **"Import from GitHub"**
4. Plak je GitHub repo URL of upload zip bestand
5. Klik **Import**

## ⚙️ STAP 2: .replit Configuratie Bestand

**Maak nieuw bestand: `.replit`**
```toml
run = "npm run dev"
modules = ["nodejs-20"]

[deployment]
run = ["sh", "-c", "npm run build && npm run preview"]

[nix]
channel = "stable-24_05"

[env]
XDG_CONFIG_HOME = "/home/runner/.config"
PATH = "/home/runner/.local/bin:/home/runner/$REPL_NAME/.config/npm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[[ports]]
localPort = 8080
externalPort = 80
```

## 🔐 STAP 3: Environment Variables Setup

**Open Replit Secrets (🔒 icoon links)**

Voeg deze secrets toe:
```
VITE_SUPABASE_PROJECT_ID = pmhplzqfdmgkkosapkit
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaHBsenFmZG1na2tvc2Fwa2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzE5MzgsImV4cCI6MjA3MTA0NzkzOH0.MK5-3lujJB7jjEXrM6A-gQN9SimblbdMbxqV4SmYXLM
VITE_SUPABASE_URL = https://pmhplzqfdmgkkosapkit.supabase.co
```

## 📦 STAP 4: Dependencies Installeren

**In Replit Console (Shell tab):**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Check kritieke packages
npm list @supabase/supabase-js @tanstack/react-query papaparse xlsx
```

## 🛠️ STAP 5: .replitignore Bestand

**Maak nieuw bestand: `.replitignore`**
```
node_modules/
.git/
dist/
*.log
.env.local
.DS_Store
coverage/
.nyc_output/
```

## 🚦 STAP 6: Test & Start

**In Console:**
```bash
# Start development server
npm run dev

# Test build
npm run build
npm run preview
```

**Verwachte output:**
```
➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

## 🔑 STAP 7: API Keys Controleren

**Ga naar Supabase Dashboard:**
1. https://supabase.com/dashboard/project/pmhplzqfdmgkkosapkit
2. Settings → Edge Functions
3. Controleer deze secrets bestaan:
   - ✅ OPENAI_API_KEY
   - ✅ ANTHROPIC_API_KEY
   - ✅ STRIPE_SECRET_KEY
   - ✅ SUPABASE_SERVICE_ROLE_KEY

**Indien ontbrekend, voeg toe via Supabase:**
- Klik **Add new secret**
- Naam: `OPENAI_API_KEY`
- Waarde: `sk-...` (je OpenAI key)

## 🗄️ STAP 8: Database Schema Check

**SQL Editor in Supabase:**
```sql
-- Controleer alle tabellen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verwachte tabellen:
-- ai_personas, blog_posts, cms_integrations, content_plans
-- csv_processing_jobs, profiles, user_credits, user_roles
-- subscribers, csv_processing_limits
```

## 🧪 STAP 9: Functionaliteit Testen

**Test Checklist:**
```
□ App laadt zonder errors
□ Login/register werkt
□ CSV upload interface zichtbaar
□ Database connectie actief
□ Credits systeem toont saldo
□ Edge functions bereikbaar
```

**Test CSV Upload:**
1. Maak test CSV:
```csv
title,slug,status,publish_date,body_markdown,meta_title,meta_description
Test Post,test-post-1,publish,2024-01-15,"# Test Content\n\nDit is test content.",Test Post SEO,Dit is een test post
```

2. Upload via interface
3. Check voor validatie messages
4. Controleer database: `SELECT * FROM blog_posts LIMIT 5;`

## 🚀 STAP 10: Deployment

**In Replit:**
1. Klik **Deploy** knop (rechts boven)
2. Kies **Autoscale Deployment**
3. Configureer:
   - Name: `autoblogify-ai`
   - Environment: **Production**
   - Secrets: **Same as development**

## 🐛 STAP 11: Troubleshooting Commands

**Als er problemen zijn:**
```bash
# Node version check
node --version  # Moet 18+ zijn

# Package issues
npm doctor
npm audit fix

# Cache clear
npm cache clean --force

# Supabase connection test
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaHBsenFmZG1na2tvc2Fwa2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzE5MzgsImV4cCI6MjA3MTA0NzkzOH0.MK5-3lujJB7jjEXrM6A-gQN9SimblbdMbxqV4SmYXLM" \
     https://pmhplzqfdmgkkosapkit.supabase.co/rest/v1/profiles?select=*&limit=1
```

## ⚠️ KRITIEKE CONTROLES

**Voor je live gaat:**
- [ ] Alle API keys werkend
- [ ] Database RLS policies actief
- [ ] CSV processing werkt (test met 5 rijen)
- [ ] Error handling functioneert
- [ ] Credits systeem correct
- [ ] WordPress integratie (indien gebruikt)

## 🔗 Handige Links

- **Replit Console:** `Ctrl+Shift+S`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/pmhplzqfdmgkkosapkit
- **Edge Function Logs:** https://supabase.com/dashboard/project/pmhplzqfdmgkkosapkit/functions
- **Database Editor:** https://supabase.com/dashboard/project/pmhplzqfdmgkkosapkit/editor

---

## 🆘 Emergency Fix Commands

**App crashed? Run deze commands:**
```bash
# Stop alle processen
pkill -f node

# Clean restart
rm -rf node_modules .next dist
npm install
npm run dev
```

**Database issues:**
```sql
-- Reset user credits
UPDATE user_credits SET credits_remaining = 100 WHERE user_id = 'YOUR_USER_ID';

-- Check failed jobs
SELECT * FROM csv_processing_jobs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
```

**Ready to go! 🎉**