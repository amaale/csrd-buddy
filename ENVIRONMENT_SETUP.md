# Environment Variables Setup Guide

## Quick Start

Run the automated setup script:
```bash
./setup-env.sh
```

Or follow the manual setup below:

## Manual Setup

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Generate Session Secret
```bash
# Generate a secure session secret
openssl rand -base64 32
```
Copy the output and paste it as your `SESSION_SECRET` in the `.env` file.

### 3. Configure Required Variables

#### Database (Required)
Set up a PostgreSQL database and add the connection string:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

**Local Development Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/csrd_buddy
```

**Production Examples:**
- **Heroku Postgres:** Already provided as `DATABASE_URL`
- **AWS RDS:** `postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/csrd_buddy`
- **Google Cloud SQL:** `postgresql://username:password@your-cloud-sql-ip:5432/csrd_buddy`

#### OpenAI API Key (Required)
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

#### Session Secret (Required)
```env
SESSION_SECRET=your-generated-secure-random-string
```

### 4. Configure Optional Variables

#### Climatiq API (Optional but recommended)
For enhanced emission factors:
1. Sign up at https://climatiq.io/
2. Get your API key
3. Add it to `.env`:
```env
CLIMATIQ_API_KEY=your-climatiq-api-key
```

#### Server Configuration
```env
PORT=5000                # Port for the server
NODE_ENV=development     # Environment (development/production)
```

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/csrd_buddy_dev
```

### Production
```env
NODE_ENV=production
PORT=443
DATABASE_URL=postgresql://user:pass@prod-db.com:5432/csrd_buddy_prod
SESSION_SECRET=super-secure-production-secret
```

## Database Setup

After configuring your environment variables:

### 1. Push Database Schema
```bash
npm run db:push
```

### 2. Add Password Column (if migrating from Replit)
```bash
psql $DATABASE_URL -f add-password-column.sql
```

### 3. Verify Connection
```bash
npm run dev
```

## Security Best Practices

### Session Secret
- ✅ **DO:** Use a cryptographically secure random string (32+ characters)
- ✅ **DO:** Generate a new secret for each environment
- ❌ **DON'T:** Use predictable strings like "secret" or "password"
- ❌ **DON'T:** Reuse secrets across environments

### API Keys
- ✅ **DO:** Use environment variables for all secrets
- ✅ **DO:** Rotate API keys regularly
- ❌ **DON'T:** Commit API keys to version control
- ❌ **DON'T:** Share API keys in plain text

### Database
- ✅ **DO:** Use strong database passwords
- ✅ **DO:** Enable SSL connections in production
- ❌ **DON'T:** Use default database credentials
- ❌ **DON'T:** Expose database directly to the internet

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL format
- Verify database server is running
- Check network connectivity

**"OpenAI API error"**
- Verify OPENAI_API_KEY is correct
- Check API key has sufficient credits
- Ensure key has required permissions

**"Session errors"**
- Generate a new SESSION_SECRET
- Check session store configuration
- Verify database sessions table exists

### Testing Your Setup

1. **Database Connection:**
   ```bash
   npm run db:push
   ```

2. **Server Start:**
   ```bash
   npm run dev
   ```

3. **API Test:**
   Visit `http://localhost:5000` and try registering a new account.

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=443
DATABASE_URL=your-production-database-url
SESSION_SECRET=your-super-secure-production-secret
OPENAI_API_KEY=your-production-openai-key
CLIMATIQ_API_KEY=your-production-climatiq-key
```

### Hosting Provider Specific

#### Heroku
Set variables using Heroku CLI:
```bash
heroku config:set SESSION_SECRET="your-secret"
heroku config:set OPENAI_API_KEY="your-key"
```

#### Vercel
Add variables in the Vercel dashboard or use CLI:
```bash
vercel env add SESSION_SECRET
```

#### AWS/Docker
Use environment variables in your container configuration or AWS Systems Manager Parameter Store.

Need help with a specific hosting provider? Check the README.md for more deployment guides!
