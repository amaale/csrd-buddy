# CSRD Buddy - Carbon Emissions Tracking Application

## Overview

CSRD Buddy is a comprehensive carbon emissions tracking application built for the Corporate Sustainability Reporting Directive (CSRD). The application enables businesses to upload financial transaction data via CSV files, automatically classify transactions using AI, calculate carbon emissions, and generate compliance reports. It follows GHG Protocol standards for Scope 1, 2, and 3 emissions tracking.

## Current Status (January 2025)

The application is fully functional with complete frontend dashboard, AI-powered transaction classification, emissions calculations using DEFRA 2024 factors, and PDF report generation. The system is now ready for testing and deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **File Processing**: Multer for CSV file uploads with validation
- **AI Integration**: OpenAI GPT-4 for transaction classification
- **PDF Generation**: PDFKit for compliance report generation
- **CSV Processing**: Custom parser with validation and error handling

### Database Schema
The application uses five main entities:
- **Users**: Company user accounts with authentication
- **Uploads**: CSV file upload tracking with processing status
- **Transactions**: Individual financial transactions with emissions data
- **Reports**: Generated compliance reports with metadata
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