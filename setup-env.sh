#!/bin/bash

# CSRD Buddy Environment Setup Script
# This script helps you set up your environment variables

echo "🚀 CSRD Buddy Environment Setup"
echo "================================"

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy template
cp .env.example .env
echo "✅ Created .env file from template"

# Generate session secret
if command -v openssl &> /dev/null; then
    SESSION_SECRET=$(openssl rand -base64 32)
    # Replace the placeholder in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/generate-a-random-secure-string-here/$SESSION_SECRET/" .env
    else
        # Linux
        sed -i "s/generate-a-random-secure-string-here/$SESSION_SECRET/" .env
    fi
    echo "✅ Generated secure session secret"
else
    echo "⚠️  OpenSSL not found. Please manually generate a session secret."
fi

echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and add your actual values for:"
echo "   - DATABASE_URL (your PostgreSQL connection string)"
echo "   - OPENAI_API_KEY (from https://platform.openai.com/api-keys)"
echo "   - CLIMATIQ_API_KEY (optional, from https://climatiq.io/)"
echo ""
echo "2. Set up your database:"
echo "   npm run db:push"
echo "   psql \$DATABASE_URL -f add-password-column.sql"
echo ""
echo "3. Start development:"
echo "   npm run dev"
echo ""
echo "🔒 Remember: Never commit your .env file to version control!"
echo "   Your secrets are safe - .env is already in .gitignore"
