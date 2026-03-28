# 🚀 ShaadiSetGo - GitHub, Deploy & Domain Setup Guide

## 📦 STEP 1: GitHub Pe Push Karna

### 1.1 GitHub Par Naya Repository Banao
1. GitHub.com pe login karo
2. Right side me **"+"** click karo → **"New repository"**
3. Repository name: `shaadisetgo`
4. Description: `Bihar & UP's #1 Wedding Vendor Marketplace`
5. **Public** ya **Private** select karo
6. **"Create repository"** click karo

### 1.2 Local Se GitHub Push Karo

Terminal me ye commands run karo:

```bash
# Project directory me jao
cd /home/z/my-project

# .gitignore file check karo (important files ignore ho rahe hain)
cat .gitignore

# Sab changes add karo
git add .

# Commit karo
git commit -m "🚀 Initial commit - ShaadiSetGo Wedding Vendor Marketplace"

# GitHub remote add karo (apna username daalo)
git remote add origin https://github.com/YOUR_USERNAME/shaadisetgo.git

# Push karo
git push -u origin main
```

### 1.3 Agar Authentication Error Aaye

**Option A: Personal Access Token (Recommended)**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" click karo
3. Repository permissions select karo
4. Token copy karo
5. Push ke time password ki jagah token use karo

**Option B: SSH Key**
```bash
# SSH key generate karo
ssh-keygen -t ed25519 -C "your_email@example.com"

# Public key copy karo
cat ~/.ssh/id_ed25519.pub

# GitHub → Settings → SSH and GPG keys → New SSH key → Paste karo

# Remote URL change karo
git remote set-url origin git@github.com:YOUR_USERNAME/shaadisetgo.git
```

---

## 🌐 STEP 2: Deployment (FREE Options)

### Option A: ▲ Vercel (Best for Next.js) - FREE

**Why Vercel?**
- Next.js ke creators ne banaya hai
- Automatic SSL certificate
- Global CDN
- Zero configuration needed
- Free tier me bahut saari features

**Steps:**

1. **Vercel Account Banao**
   - https://vercel.com pe jao
   - "Sign Up" click karo
   - "Continue with GitHub" select karo

2. **Project Import Karo**
   - Dashboard se "Add New..." → "Project" click karo
   - GitHub repository select karo: `shaadisetgo`
   - "Import" click karo

3. **Environment Variables Add Karo**
   ```
   # .env file ke content copy karo
   DATABASE_URL="file:./db/custom.db"
   
   # Supabase credentials (image upload ke liye)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Deploy Karo**
   - "Deploy" button click karo
   - 2-3 minute wait karo
   - Deployed! 🎉

5. **Free URL Milega**
   - `https://shaadisetgo.vercel.app`

---

### Option B: 🚂 Railway (Database + Hosting) - FREE Tier

**Why Railway?**
- SQLite database support
- Easy deployment
- Free $5/month credit

**Steps:**

1. https://railway.app pe jao
2. "Start a New Project" → "Deploy from GitHub repo"
3. Repository select karo
4. Add environment variables
5. Deploy!

---

### Option C: 🐱 Render - FREE

1. https://render.com pe jao
2. "New" → "Web Service"
3. GitHub repository connect karo
4. Build Command: `npm run build`
5. Start Command: `npm start`
6. Free tier select karo

---

## 🔗 STEP 3: Custom Domain Connect Karna

### 3.1 Domain Khareedo (Buy Domain)

**Popular Domain Registrars (India):**
| Registrar | Price (.in) | Price (.com) |
|-----------|-------------|--------------|
| GoDaddy | ₹199/yr | ₹699/yr |
| Namecheap | ₹300/yr | ₹700/yr |
| BigRock | ₹199/yr | ₹699/yr |
| Hostinger | ₹199/yr | ₹849/yr |
| Google Domains | ₹450/yr | ₹860/yr |

**Recommended Domain Names:**
- `shaadisetgo.in` (₹199/year)
- `shaadisetgo.com` (₹699-899/year)
- `shaadi-setgo.com`
- `shaadisetgo.co.in`

### 3.2 Domain Vercel Pe Connect Karna

**Step 1: Vercel Dashboard me jao**
1. Project select karo (`shaadisetgo`)
2. "Settings" → "Domains" click karo
3. "Add Domain" me apna domain enter karo
4. Example: `shaadisetgo.in` ya `www.shaadisetgo.in`

**Step 2: DNS Records Configure Karo**

Domain registrar (GoDaddy, Namecheap, etc.) me jao → DNS Management:

**For Apex Domain (shaadisetgo.in):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
```

**For WWW (www.shaadisetgo.in):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 3: SSL Certificate**
- Vercel automatically free SSL dega
- Kuch minute wait karo
- `https://shaadisetgo.in` ready! 🔒

### 3.3 DNS Propagation Check

```bash
# DNS propagation check karo
nslookup shaadisetgo.in
# ya
dig shaadisetgo.in

# Online tools:
# https://dnschecker.org
# https://whatsmydns.net
```

---

## 🎯 Quick Summary (Sabse Fast Tarika)

### 1. GitHub Push (5 min)
```bash
git add .
git commit -m "🚀 Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/shaadisetgo.git
git push -u origin main
```

### 2. Vercel Deploy (5 min)
- vercel.com → Sign up with GitHub
- Import repository → Add env vars → Deploy
- Free URL: `https://shaadisetgo.vercel.app`

### 3. Domain Connect (15 min)
- Domain buy karo (GoDaddy, Namecheap)
- Vercel me domain add karo
- DNS records update karo
- SSL automatic

---

## 📱 Important: Production Ke Liye Ye Changes Karo

### 1. Environment Variables (Vercel me add karo)
```env
# Production Database (Use PostgreSQL for production)
DATABASE_URL="postgresql://user:password@host:5432/shaadisetgo"

# Supabase (for image storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Admin Password
ADMIN_PASSWORD=your_secure_password_here

# App URL
NEXT_PUBLIC_APP_URL=https://shaadisetgo.in
```

### 2. next.config.js Update
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
}

module.exports = nextConfig
```

---

## 💰 Total Cost Estimation

| Item | Cost |
|------|------|
| Domain (.in) | ₹199/year |
| Hosting (Vercel Free) | ₹0 |
| Database (SQLite/Supabase Free) | ₹0 |
| SSL Certificate | FREE |
| **Total** | **₹199/year** |

---

## 🆘 Common Problems & Solutions

### Problem 1: Git Push Authentication Error
```bash
# Solution: Personal Access Token use karo
# GitHub → Settings → Developer settings → Personal access tokens
```

### Problem 2: Build Fail on Vercel
```bash
# Solution: Build log check karo
# Vercel dashboard → Deployments → Failed deployment → View logs
```

### Problem 3: Database Error in Production
```bash
# Solution: Use PostgreSQL instead of SQLite
# Vercel doesn't support SQLite in production
# Use Vercel Postgres, Supabase, or Railway Postgres
```

### Problem 4: Images Not Loading
```bash
# Solution: Check Supabase bucket permissions
# Make sure NEXT_PUBLIC_SUPABASE_URL and keys are correct
```

---

## 📞 Need Help?

Agar koi problem aaye to batao, main help karunga! 🙏
