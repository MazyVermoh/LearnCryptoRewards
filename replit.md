# Educational Platform

## Overview

This is a full-stack educational platform built with React, Express.js, and PostgreSQL. The application provides a comprehensive learning management system with courses, books, rewards, and user engagement features. It includes multilingual support and integrates with Neon Database for scalable PostgreSQL hosting.

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
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```