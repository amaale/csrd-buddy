# CSRD Buddy - Supabase + Vercel Deployment Guide

## 🚀 Quick Deployment Setup

Your CSRD Buddy application is now configured to work perfectly with Supabase (database) and Vercel (hosting) - your original stack!

## 📋 Prerequisites

- [Supabase](https://supabase.com/) account
- [Vercel](https://vercel.com/) account  
- [OpenAI API](https://platform.openai.com/) key
- (Optional) [Climatiq API](https://climatiq.io/) key

## 🗄️ Supabase Database Setup

### 1. Create New Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill project details:
   - **Name**: `csrd-buddy`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Database Connection String
1. In your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Find **Connection string** section
4. **Copy the URI format** (it will look like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. **Replace the placeholders** with your actual values:
   - `[YOUR-PASSWORD]` → The database password you created in step 1
   - `[YOUR-PROJECT-REF]` → Your unique project reference (already filled in by Supabase)

**Example:**
If your project reference is `abcdefghijklmnop` and your password is `MySecretPass123`, your final connection string would be:
```
postgresql://postgres:MySecretPass123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

**Important:** In the Supabase dashboard, the connection string will already have your project reference filled in. You only need to replace `[YOUR-PASSWORD]` with the actual password you set when creating the project.

### 3. Configure Database Schema
```bash
# Install dependencies
npm install

# Create .env file with your actual Supabase connection string
# Replace the example below with your real connection string from step 2
echo "DATABASE_URL=postgresql://postgres:YourActualPassword@db.yourprojectref.supabase.co:5432/postgres" > .env

# Push schema to Supabase
npm run db:push
```

**Example of what the command should look like:**
```bash
# If your connection string is: postgresql://postgres:MyPass123@db.abcdefg.supabase.co:5432/postgres
echo "DATABASE_URL=postgresql://postgres:MyPass123@db.abcdefg.supabase.co:5432/postgres" > .env
```

**Or create the .env file manually:**
1. Create a new file called `.env` in your project root
2. Add this line with your actual connection string:
   ```
   DATABASE_URL=postgresql://postgres:YourPassword@db.yourprojectref.supabase.co:5432/postgres
   ```

## 🌐 Vercel Deployment Setup

### 1. Install Vercel CLI (if you haven't)
```bash
npm install -g vercel
```

### 2. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy your project
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Choose your account
# - Link to existing project? No
# - Project name: csrd-buddy
# - Directory: ./
# - Override settings? No
```

### 3. Configure Environment Variables in Vercel

#### Via Vercel Dashboard:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your `csrd-buddy` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
SESSION_SECRET=Ys2zltTeWY4k3Es64yON5yPN7ZErPIWciWYtjpfMOW8=
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIMATIQ_API_KEY=your-climatiq-api-key-here
NODE_ENV=production
```

#### Via Vercel CLI:
```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add OPENAI_API_KEY
vercel env add CLIMATIQ_API_KEY
vercel env add NODE_ENV
```

### 4. Redeploy with Environment Variables
```bash
vercel --prod
```

## 🔧 Local Development Setup

### 1. Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SESSION_SECRET=Ys2zltTeWY4k3Es64yON5yPN7ZErPIWciWYtjpfMOW8=
OPENAI_API_KEY=sk-your-openai-api-key
CLIMATIQ_API_KEY=your-climatiq-api-key
NODE_ENV=development
PORT=5000
```

### 2. Database Setup
```bash
# Push schema to Supabase
npm run db:push
```

### 3. Start Development
```bash
npm run dev
```

Your app will be available at `http://localhost:5000`

## 📦 Package Changes Made

I've updated your configuration to work with Supabase:

### Removed:
- `@neondatabase/serverless` (Neon-specific)

### Added:
- `pg` - Standard PostgreSQL driver for Supabase
- `@types/pg` - TypeScript types

### Updated:
- `server/db.ts` - Now uses standard PostgreSQL connection
- `vercel.json` - Vercel deployment configuration
- Environment variables - Supabase-specific format

## 🔗 Supabase Features You Can Use

Since you're using Supabase, you can also leverage:

### 1. Supabase Auth (Optional Alternative)
If you want to use Supabase's built-in auth instead of custom auth:
```bash
npm install @supabase/supabase-js
```

### 2. Supabase Storage
For file uploads (CSV files, PDF reports):
```bash
# Already available in your Supabase project
# Configure in Supabase dashboard → Storage
```

### 3. Real-time Subscriptions
For live updates on data changes:
```typescript
// Example: Real-time transaction updates
const subscription = supabase
  .channel('transactions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transactions'
  }, (payload) => {
    console.log('New transaction:', payload)
  })
  .subscribe()
```

## 🚀 Production Checklist

### Before Going Live:
- [ ] Database connection tested
- [ ] All environment variables set in Vercel
- [ ] OpenAI API key has sufficient credits
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified (automatic with Vercel)

### Monitoring:
- [ ] Supabase dashboard for database monitoring
- [ ] Vercel dashboard for deployment logs
- [ ] OpenAI usage dashboard for API costs

## 🔍 Troubleshooting

### Common Issues:

**"Database connection failed"**
- Check DATABASE_URL format in Vercel environment variables
- Verify Supabase project is not paused
- Check database password is correct

**"OpenAI API Error"**
- Verify API key in Vercel environment variables
- Check OpenAI account has sufficient credits
- Ensure API key has correct permissions

**"Build failed on Vercel"**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Check TypeScript compilation with `npm run check`

### Support Resources:
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Your project's Vercel dashboard](https://vercel.com/dashboard)

## 🎉 You're All Set!

Your CSRD Buddy application is now configured for:
- ✅ **Supabase** for secure, scalable PostgreSQL database
- ✅ **Vercel** for fast, global deployment
- ✅ **Independent** from Replit (no subscription fees!)
- ✅ **Production-ready** with proper SSL and domain handling

**Next step**: Deploy with `vercel --prod` and start using your independent CSRD compliance platform! 🚀
