# TenderFind SA

## Overview

TenderFind SA is a full-stack web application designed to help South African businesses find and track government tender opportunities that match their business profiles. The system provides intelligent matching based on business capabilities, industry categories, CIDB grading, B-BBEE levels, and geographic preferences. The application features a React-based frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and Replit authentication integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS
- **Styling**: Tailwind CSS with custom South African themed colors
- **Build Tool**: Vite for development and production builds
- **Internationalization**: React i18next supporting 5 South African languages (English, Afrikaans, Zulu, Xhosa, Sepedi)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage
- **Error Handling**: Centralized error middleware with status code mapping

### Mobile-First Design
- Progressive Web App (PWA) capabilities
- Touch-optimized interface with bottom navigation
- Responsive design optimized for mobile devices
- Safe area support for modern mobile browsers

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure flags in production

### Business Profile Management
- Comprehensive business profile creation and editing
- Support for CIDB grading levels (Grade 1-9)
- B-BBEE level tracking (Level 1-8)
- Industry category selection and preferences
- Geographic preference settings (provincial and national)
- Value range preferences for tender matching

### Tender Matching Engine
- **Intelligent Scoring**: Percentage-based matching algorithm
- **Criteria Matching**: Industry categories, CIDB requirements, B-BBEE levels, geography, and value ranges
- **Real-time Notifications**: Email and SMS alerts for high-scoring matches
- **Match Reasons**: Detailed explanations of why tenders match business profiles

### Notification System
- **Email Notifications**: SMTP-based email delivery using Nodemailer
- **SMS Notifications**: Integration ready for SMS providers
- **User Preferences**: Granular control over notification types and frequency
- **Delivery Tracking**: Notification history and delivery status

## Data Flow

### User Registration Flow
1. User authenticates via Replit Auth
2. System creates user record in database
3. User completes business profile setup
4. Matching engine activates for new profile

### Tender Matching Flow
1. External tender data is synced from eTenders Portal API
2. Matching service evaluates each tender against business profiles
3. High-scoring matches trigger notifications
4. Users receive email/SMS alerts for relevant opportunities
5. Users can view, save, and track tender opportunities

### Data Synchronization
- Automated tender data sync from South African eTenders Portal
- Real-time matching when new tenders are added
- Background processing for large-scale matching operations

## External Dependencies

### Database
- **Primary Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema management
- **Connection Pooling**: Built-in connection pooling for scalability

### Authentication
- **Replit Auth**: OpenID Connect integration
- **Passport.js**: Authentication middleware
- **Session Management**: PostgreSQL session store

### External APIs
- **eTenders Portal**: South African government tender data source
- **Email Service**: SMTP integration for notifications
- **SMS Service**: Ready for integration with SMS providers

### UI Components
- **Radix UI**: Comprehensive accessibility-focused component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL database
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, SMTP configuration

### Production Build
- **Frontend**: Vite production build with code splitting
- **Backend**: ESBuild for Node.js bundling
- **Assets**: Static file serving with Express
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Environment Configuration
- Development and production environment detection
- Secure cookie settings for production
- CORS configuration for cross-origin requests
- Error handling with appropriate logging levels

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Removed Replit authentication dependencies, implemented standalone email/password authentication
- July 04, 2025. Connected to external Render PostgreSQL database
- July 04, 2025. Added dark mode with starry background and metallic blue theme
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```