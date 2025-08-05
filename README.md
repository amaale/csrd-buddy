# CSRD Buddy - Independent Version

A comprehensive platform for European SMEs to generate CSRD-compliant ESG reports with AI-powered carbon emissions calculation and advanced multi-language support.

## Features

- **AI-Powered Classification**: Automatically classify transactions using OpenAI GPT-4 for accurate Scope 1, 2, and 3 emissions tracking per GHG Protocol standards
- **XBRL Report Generation**: Generate compliant PDF and XBRL reports with DEFRA 2024 emission factors and Climatiq integration
- **Multi-Language Support**: Full support for 6 European languages (English, German, French, Spanish, Italian, Dutch)
- **Advanced Analytics**: Carbon intensity analysis, benchmarking, and reduction opportunities
- **PDF Processing**: Advanced PDF expense document processing with AI classification
- **Simple Authentication**: Built-in user registration and login system

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **AI**: OpenAI GPT-4 for transaction classification
- **Reports**: PDF generation with PDFKit, XBRL generation

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- (Optional) Climatiq API key for enhanced emission factors

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd csrd-buddy
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/csrd_buddy

# Session Secret (change this to a random string)
SESSION_SECRET=your-very-secure-session-secret-change-this

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Optional: Climatiq API for enhanced emission factors
CLIMATIQ_API_KEY=your-climatiq-api-key

# Server
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

Create your PostgreSQL database and run the migrations:

```bash
# Push database schema
npm run db:push

# Add password column for authentication (if upgrading from Replit version)
psql $DATABASE_URL -f add-password-column.sql
```

### 4. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### 5. Production Build

Build and start the production server:

```bash
npm run build
npm start
```

## Authentication

The application now uses a simple session-based authentication system instead of Replit OpenID. Users can:

- Register new accounts with email/password
- Login with existing credentials
- Logout securely

### Demo Account

For testing, you can create a demo account:
- Email: admin@demo.com
- Password: password123

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### Data Management
- `POST /api/uploads` - Upload CSV files
- `GET /api/uploads` - Get user uploads
- `GET /api/transactions` - Get user transactions

### Reports & Analytics
- `GET /api/emissions/summary` - Get emissions summary
- `GET /api/emissions/trend` - Get emissions trend data
- `POST /api/reports` - Generate reports
- `GET /api/reports` - Get user reports
- `GET /api/reports/:id/download` - Download report PDF

## File Structure

```
csrd-buddy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── services/          # Business logic
│   ├── routes.ts          # API routes
│   ├── simpleAuth.ts      # Authentication
│   ├── storage.ts         # Database layer
│   └── index.ts           # Server entry
├── shared/                # Shared types/schemas
└── uploads/               # File uploads directory
```

## Changes from Replit Version

This version has been modified to be completely independent from Replit:

1. **Removed Replit dependencies**:
   - `@replit/vite-plugin-cartographer`
   - `@replit/vite-plugin-runtime-error-modal`
   - Replit banner script from HTML

2. **Replaced Replit OpenID with simple auth**:
   - Session-based authentication
   - bcrypt password hashing
   - User registration/login pages

3. **Updated configuration**:
   - Removed Replit-specific environment variables
   - Updated Vite config for standard Node.js
   - Removed Replit domain references

4. **Added new features**:
   - User registration system
   - Login/logout functionality
   - Secure session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on the repository.
