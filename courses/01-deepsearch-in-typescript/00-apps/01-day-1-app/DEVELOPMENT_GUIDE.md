# AI Chat Application - Development Guide

## High-Level Repository Overview

This is an **AI-powered chat application** built with Next.js that's part of a course series called "Deep Search in TypeScript" (Day 1 App).

### **Core Purpose**

An AI chatbot application with search capabilities that can conduct conversations with users while having access to real-time web search through the Serper API.

### **Technology Stack**

- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **AI Integration**: Vercel AI SDK (`ai` package) for backend, `@ai-sdk/react` for frontend
- **Authentication**: NextAuth.js v5 (beta) with Discord OAuth
- **Database**: PostgreSQL with Drizzle ORM and pgvector extension
- **Caching**: Redis for search results and session caching
- **Search**: Serper API integration for web search capabilities
- **UI**: Lucide React icons, custom components with accessibility features

### **Architecture**

```
Frontend (Next.js App Router)
├── Chat Interface (/chat.tsx)
├── Authentication System
├── API Routes (/api/chat/route.ts)
└── Components (auth-button, chat-message, etc.)

Backend Services
├── AI/LLM Integration (Vercel AI SDK)
├── Web Search (Serper API)
├── Database Layer (Drizzle + PostgreSQL)
└── Caching Layer (Redis)
```

### **Database Schema**

- **Users** - User accounts with admin flags
- **Accounts** - OAuth provider accounts (NextAuth)
- **Sessions** - User sessions (NextAuth)
- **Chats** - Chat conversations
- **Messages** - Individual chat messages with JSON content
- **Requests** - API request tracking with token usage

---

## Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **Docker Desktop** for database and Redis
- **Discord Developer Application** (for OAuth)
- **Serper API Key** (for web search functionality)

---

## Environment Setup

### **Required Environment Variables (.env)**

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai-app-template"

# Redis Configuration
REDIS_URL="redis://:redis-pw@localhost:6379/0"

# NextAuth Configuration
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth (Required for authentication)
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Serper API Key (Required for web search)
SERPER_API_KEY="your-serper-api-key"

# Environment
NODE_ENV="development"
```

---

## Development Commands

### **Package Management**

```bash
# Install dependencies
pnpm install

# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

### **Development Server**

```bash
# Start development server with Turbo
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Preview production build
pnpm run preview
```

### **Code Quality**

```bash
# Run linter
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Run TypeScript check
pnpm run typecheck

# Format code
pnpm run format:write

# Check code formatting
pnpm run format:check

# Run all checks
pnpm run check
```

---

## Database Management

### **Docker Database Setup**

```bash
# Start PostgreSQL with pgvector extension
./start-database.sh

# Start Redis server
./start-redis.sh

# Check running containers
docker ps

# View container logs
docker logs ai-app-template-postgres
docker logs ai-app-template-redis
```

### **Database Destruction**

```bash
# Stop and remove database container
docker stop ai-app-template-postgres
docker rm ai-app-template-postgres

# Remove volumes
docker volume rm ai-app-template-postgres-data

# Nuclear option - complete reset
docker stop ai-app-template-postgres ai-app-template-redis
docker rm ai-app-template-postgres ai-app-template-redis
docker volume prune -f
docker system prune -f
```

### **Local PostgreSQL Management**

```bash
# Check what's running locally
brew services list | grep postgresql

# Stop local PostgreSQL (macOS)
brew services stop postgresql@15
brew services stop postgresql@16

# Stop PostgreSQL (Linux)
sudo systemctl stop postgresql

# Force kill all PostgreSQL processes
sudo pkill -f postgres

# Check what's using port 5432
lsof -i :5432

# Kill process on port 5432
sudo kill -9 $(lsof -ti :5432)
```

---

## Drizzle ORM Commands

### **Database Schema Management**

```bash
# Push schema directly to database (development)
pnpm run db:push

# Generate migration files from schema changes
pnpm run db:generate

# Run pending migrations
pnpm run db:migrate

# Open Drizzle Studio (database GUI)
pnpm run db:studio
```

### **Manual Drizzle Commands**

```bash
# If pnpm scripts don't work, use npx directly
npx drizzle-kit push --config=drizzle.config.ts
npx drizzle-kit generate --config=drizzle.config.ts
npx drizzle-kit migrate --config=drizzle.config.ts
npx drizzle-kit studio --config=drizzle.config.ts

# Check drizzle-kit version
npx drizzle-kit --version
```

### **Database Workflow**

```bash
# Development workflow (quick changes)
# 1. Modify src/server/db/schema.ts
# 2. Push changes
pnpm run db:push

# Production workflow (proper migrations)
# 1. Modify src/server/db/schema.ts
# 2. Generate migration
pnpm run db:generate
# 3. Run migration
pnpm run db:migrate

# Fresh database setup
pnpm run db:migrate
```

---

## Docker Container Management

### **Container Status**

```bash
# List all containers
docker ps

# List all containers (including stopped)
docker ps -a

# Check specific containers
docker ps | grep ai-app-template
```

### **Container Operations**

```bash
# Start containers
docker start ai-app-template-postgres
docker start ai-app-template-redis

# Stop containers
docker stop ai-app-template-postgres
docker stop ai-app-template-redis

# Remove containers
docker rm ai-app-template-postgres
docker rm ai-app-template-redis

# Execute commands in container
docker exec -it ai-app-template-postgres psql -U postgres -d ai-app-template

# View container logs
docker logs ai-app-template-postgres
docker logs ai-app-template-redis
```

### **Docker Cleanup**

```bash
# Remove all stopped containers
docker container prune

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Complete system cleanup
docker system prune -a
```

---

## OAuth Setup

### **Discord OAuth Setup**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to **OAuth2** section
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy **Client ID** and **Client Secret** to `.env` file

### **Serper API Setup**

1. Visit [Serper.dev](https://serper.dev/)
2. Sign up for an account
3. Get your API key
4. Add to `.env` file as `SERPER_API_KEY`

---

## Troubleshooting

### **Common Issues**

#### **Database Connection Issues**

```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker logs ai-app-template-postgres

# Test connection
docker exec ai-app-template-postgres psql -U postgres -d ai-app-template -c "SELECT version();"
```

#### **Port Conflicts**

```bash
# Check what's using port 5432
lsof -i :5432

# Kill process on port 5432
sudo kill -9 $(lsof -ti :5432)

# Stop local PostgreSQL
brew services stop postgresql@15
```

#### **Authentication Issues**

- Verify Discord OAuth redirect URL is exactly: `http://localhost:3000/api/auth/callback/discord`
- Check that `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET` are correct
- Ensure `AUTH_SECRET` is set

#### **Search Issues**

- Verify `SERPER_API_KEY` is valid and has credits
- Check API key is in `.env` file

### **Reset Everything**

```bash
# Complete application reset
docker stop ai-app-template-postgres ai-app-template-redis
docker rm ai-app-template-postgres ai-app-template-redis
docker volume prune -f
rm -rf node_modules
pnpm install
./start-database.sh
./start-redis.sh
pnpm run db:push
pnpm run dev
```

---

## Quick Start Checklist

1. ✅ **Install dependencies**: `pnpm install`
2. ✅ **Install Docker Desktop**
3. ✅ **Create `.env` file** with required variables
4. ✅ **Set up Discord OAuth** application
5. ✅ **Get Serper API key**
6. ✅ **Stop local PostgreSQL**: `brew services stop postgresql@15`
7. ✅ **Start database**: `./start-database.sh`
8. ✅ **Start Redis**: `./start-redis.sh`
9. ✅ **Setup database schema**: `pnpm run db:push`
10. ✅ **Start development server**: `pnpm run dev`
11. ✅ **Visit**: `http://localhost:3000`

---

## File Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth API routes
│   ├── chat.tsx                         # Chat interface
│   ├── page.tsx                         # Main page
│   └── layout.tsx                       # App layout
├── components/
│   ├── auth-button.tsx                  # Authentication button
│   ├── chat-message.tsx                 # Message display
│   ├── error-message.tsx                # Error handling
│   └── sign-in-modal.tsx                # Sign in modal
├── server/
│   ├── auth/                           # Authentication logic
│   ├── db/                             # Database schema & connection
│   └── redis/                          # Redis configuration
├── env.js                              # Environment validation
├── serper.ts                           # Search API integration
└── types.ts                            # Type definitions
```

---

## Available Components

- **`<AuthButton>`** - Discord OAuth authentication
- **`<ChatMessage>`** - Markdown message display with syntax highlighting
- **`<ErrorMessage>`** - Error state display
- **`<SignInModal>`** - Modal authentication prompt

---

This guide covers all the essential commands and setup steps for developing the AI chat application. Keep this handy for reference during development!
