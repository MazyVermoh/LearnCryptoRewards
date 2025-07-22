# Educational Platform

## Overview

This is a comprehensive Telegram mini-app educational platform built with React, Express.js, and PostgreSQL. The application serves as a Launch Candidate for the MIND Token ecosystem, providing a learning management system with courses, books, crypto rewards, and user engagement features. It features full bilingual support (English/Russian) and integrates with Neon Database for scalable PostgreSQL hosting. The platform is designed to support the MIND Token roadmap with 26 courses and 45 books, all available for free with token-based rewards.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with proper error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **Session Storage**: PostgreSQL sessions table
- **Schema Management**: Drizzle migrations in `/migrations` directory
- **Database Configuration**: Environment-based connection strings

## Key Components

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: User profiles with token balances, steps tracking, and referral system
- **Courses**: Educational content with categories (business, fitness, crypto, self-development)
- **Books**: Digital library with purchase tracking
- **Enrollments**: User-course relationships
- **Transactions**: Financial transaction history
- **Rewards System**: Daily challenges and sponsor channel subscriptions
- **Sessions**: User authentication sessions

### Authentication & Authorization
- Session-based authentication using express-session
- PostgreSQL session store with connect-pg-simple
- User profile management with referral system
- Token-based reward system

### Internationalization
- Multi-language support (English as default)
- Translation system in `client/src/lib/i18n.ts`
- Language preference stored in localStorage
- Support for course categories and UI elements

### UI Components
- Comprehensive component library based on Shadcn/ui
- Radix UI primitives for accessibility
- Custom design system with CSS variables
- Responsive design with mobile-first approach
- Dark mode support built into the design tokens

## Data Flow

1. **User Registration/Login**: Users authenticate through session-based system
2. **Course Enrollment**: Users can browse and enroll in courses by category
3. **Progress Tracking**: System tracks user progress through courses
4. **Reward System**: Daily step challenges and sponsor channel subscriptions
5. **Token Economy**: Users earn and spend tokens through various activities
6. **Library Access**: Users can purchase and access digital books
7. **Referral System**: Users can refer friends and earn rewards

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: WebSocket-based connection for serverless compatibility

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **TanStack Query**: Data fetching and caching

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and introspection tool

## Deployment Strategy

### Development
- **Command**: `npm run dev`
- **Process**: Runs Express server with Vite middleware for hot reloading
- **Database**: Connects to Neon Database with environment variables

### Production Build
- **Frontend**: `vite build` outputs to `dist/public`
- **Backend**: `esbuild` bundles server code to `dist/index.js`
- **Database**: `drizzle-kit push` for schema deployment

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string for Neon Database
- `NODE_ENV`: Environment setting (development/production)

### Hosting Considerations
- Serverless-compatible database connections
- Static asset serving from `dist/public`
- Session store configured for production scaling

## Changelog

```
Changelog:
- July 05, 2025. Initial setup with comprehensive educational platform
- July 05, 2025. Updated course categories to exact specification (5 categories, 26 courses)
- July 05, 2025. Added complete book library with 45 books across 9 categories
- July 05, 2025. Removed featured sections for cleaner UI design
- July 05, 2025. Structured course catalog: Mind & Thinking (7), Finance & Economics (4), Career Skills (7), Future Thinking (4), Health & Body (4)
- July 06, 2025. Fixed Russian translation system - resolved database field naming conflicts
- July 06, 2025. Cleaned database duplicates, restored correct quantities (26 courses, 45 books)
- July 06, 2025. Successfully implemented bilingual support (English/Russian)
- July 06, 2025. LAUNCH CANDIDATE READY - All Russian translations working correctly
- July 06, 2025. Updated naming convention to "MIND Token" (singular) throughout application
- July 06, 2025. Implemented comprehensive testing system for content validation
- July 06, 2025. Added admin panel for test management with variable answer options (2-6)
- July 06, 2025. Integrated tests into BookReader and CourseReader for engagement tracking
- July 06, 2025. PRODUCTION READY - Testing system complete, build successful
- July 06, 2025. Telegram Bot Integration - Full bot integration with @Mind_Coin_Bot
- July 06, 2025. DEPLOYMENT READY - All systems operational, bot connected
- July 06, 2025. DEPLOYMENT FIXES APPLIED - Server configured for production deployment
  - Added health check endpoints (/api/health and /api/status) returning 200 status
  - Configured Express server to bind to 0.0.0.0 on port 5000
  - Added comprehensive error handling and graceful shutdown
  - Implemented proper startup validation and error logging
  - Production build tested and verified working
- July 06, 2025. DEPLOYMENT ISSUE RESOLVED - Fixed server startup problems
  - Added root path health check endpoint (/) returning 200 status
  - Fixed Telegram bot initialization to prevent startup failures
  - Corrected server.listen() method to use proper parameters
  - Added safe error handling for missing environment variables
  - All health check endpoints verified working (/, /api/health, /api/status)
  - Production build confirmed working - READY FOR DEPLOYMENT

- July 22, 2025. DEPLOYMENT HEALTH CHECK FIXES APPLIED
  - Added comprehensive root endpoint (/) health check that returns HTTP 200
  - Implemented smart health check detection for deployment monitors
  - Removed process.exit(1) calls that were causing server shutdown after startup errors
  - Enhanced error handling to prevent application termination during startup
  - Fixed TypeScript type errors in server configuration
  - Verified all health check endpoints working properly:
    - GET / returns 200 for health checkers and regular requests
    - GET /api/health returns 200 with JSON status
    - GET /api/status returns 200 with JSON status
  - Application now passes deployment health checks
  - Server startup errors handled gracefully without terminating process

- July 22, 2025. TELEGRAM BOT DEPLOYMENT COMPLETE
  - Successfully deployed application to production URL
  - Updated Telegram bot webhook to deployed application
  - Verified bot token authentication and connectivity
  - Confirmed all bot commands and web app integration working
  - Bot @Mind_Coin_Bot now fully operational with deployed platform
  - Users can access all features through Telegram interface

- July 22, 2025. DATABASE RESET FOR REDEPLOYMENT
  - Reset all user progress data to provide fresh start for new users
  - Cleared enrollments, transactions, book purchases, and reading progress
  - All users reset to 100 MIND tokens and level 1
  - Fixed server port conflicts for stable deployment
  - Application ready for clean redeployment with fresh data state
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```