# CSRD Buddy - Carbon Emissions Tracking Application

## Overview

CSRD Buddy is a production-ready micro-SaaS platform for European SMEs to generate CSRD-compliant ESG reports. The application enables businesses to upload financial transaction data via CSV files, automatically classify transactions using AI, calculate carbon emissions, and generate compliance reports. It follows GHG Protocol standards for Scope 1, 2, and 3 emissions tracking.

## Current Status (January 2025)

**PRODUCTION READY**: The application has been transformed from prototype to a functioning business platform with real user authentication, database persistence, and enterprise features. Key production capabilities include:
- Replit OpenID authentication with user sessions
- PostgreSQL database with proper user data isolation
- AI-powered transaction classification with OpenAI integration
- PDF and XBRL report generation with DEFRA 2024 factors
- Multi-language support for 6 European markets
- Enterprise landing page with pricing and feature showcase
- Protected API routes with proper authorization
- Advanced analytics and carbon accounting features

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 29, 2025)

**Production Transformation Complete**: 
- Implemented Replit OpenID authentication system
- Updated database schema for authenticated users
- Protected all API routes with authentication middleware
- Created professional landing page with pricing tiers
- Added authentication routing (landing page for anonymous users, dashboard for authenticated)
- Removed all mock user data - now uses real authenticated user sessions
- Language switching system fully functional across the application
- System ready for real business use with user registration and data isolation

## System Architecture

### Full-Stack TypeScript Architecture
The application uses a monorepo structure with a clear separation between client, server, and shared code:
- **Frontend**: React with TypeScript, Vite for build tooling
- **Backend**: Node.js with Express and TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Shared**: Common TypeScript schemas and types

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared schemas and types
├── migrations/      # Database migration files
└── uploads/         # File upload storage
```

## Key Components

### Frontend Architecture
- **React Framework**: Uses React 18 with functional components and hooks
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for CSRD-specific theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Express Server**: RESTful API with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL (Neon serverless)
- **File Processing**: Multer for CSV and PDF file uploads with validation
- **AI Integration**: OpenAI GPT-4 for transaction classification with fallback system
- **Report Generation**: PDFKit for PDF reports and custom XBRL generator for structured compliance reports
- **CSV Processing**: Custom parser with validation and error handling
- **PDF Processing**: Advanced PDF expense extraction with AI classification
- **Emission Factors**: Climatiq API integration with enhanced emission factor database
- **Advanced Analytics**: Carbon intensity analysis, benchmarking, and reduction opportunities

### Database Schema
The application uses six main entities with proper authentication:
- **Users**: OpenID-authenticated user accounts with profile data
- **Sessions**: Secure session storage for authentication state
- **Uploads**: CSV file upload tracking with processing status (user-specific)
- **Transactions**: Individual financial transactions with emissions data (user-specific)
- **Reports**: Generated compliance reports with metadata (user-specific)
- **EmissionFactors**: DEFRA 2024-based emission calculation factors

## Data Flow

### CSV Upload and Processing
1. User uploads CSV file through drag-and-drop interface
2. Server validates file format and structure
3. CSV parser extracts transaction data with error handling
4. AI service classifies transactions into GHG Protocol categories
5. Emissions calculator applies DEFRA factors based on classification
6. Processed transactions stored in database with verification status

### AI Classification Pipeline
1. OpenAI GPT-4 analyzes transaction descriptions and amounts
2. Returns category, subcategory, scope (1/2/3), and confidence score
3. System applies appropriate emission factors based on classification
4. Results can be manually verified and adjusted by users

### Report Generation
1. User selects reporting period and generates report
2. System aggregates emissions data by scope and category
3. PDF generator creates compliance-ready reports
4. Reports include methodology, data sources, and verification status

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **OpenAI API**: GPT-4 for transaction classification
- **Replit**: Development and hosting platform

### Key Libraries
- **Database**: Drizzle ORM with PostgreSQL adapter
- **UI**: Radix UI primitives with Shadcn/ui components
- **Charts**: Chart.js for emissions visualization
- **File Processing**: Multer, CSV-parse for file handling
- **PDF**: PDFKit for report generation
- **Validation**: Zod for schema validation throughout the stack

### Development Tools
- **TypeScript**: End-to-end type safety
- **Vite**: Frontend build tooling with HMR
- **ESBuild**: Server-side bundling for production
- **Tailwind CSS**: Utility-first styling framework

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- TSX for server-side TypeScript execution
- Automatic database provisioning through Replit integration
- File watching and auto-restart for backend changes

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- ESBuild creates server bundle with external dependencies
- Static file serving from Express for production deployment
- Database migrations handled through Drizzle Kit

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- OpenAI API key configuration for AI services
- Automatic SSL and domain handling through Replit platform
- File upload storage in local `uploads` directory

### Architectural Decisions

**Database Choice**: PostgreSQL with Drizzle ORM chosen for:
- Strong ACID compliance for financial data
- Complex relationship handling between entities
- Type-safe database operations with TypeScript
- Automatic migration generation and management

**AI Integration**: OpenAI GPT-4 selected for:
- Superior understanding of business transaction context
- Reliable classification into GHG Protocol categories
- High accuracy with confidence scoring
- Structured JSON response format

**Component Architecture**: Shadcn/ui + Radix UI provides:
- Accessible, production-ready components
- Consistent design system with customization
- TypeScript support throughout
- Minimal bundle size with tree-shaking