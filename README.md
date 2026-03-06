# AI Meeting Co-pilot SaaS

This is the boilerplate for the AI Meeting Co-pilot SaaS app, containing project structure, database schema, authentication, and basic workspace CRUD.

## Monorepo Structure
- `client/` - React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Clerk, Wouter
- `server/` - Node.js, Express, TypeScript, Clerk Express, Drizzle ORM
- `shared/` - Shared types, Zod schemas, and API definitions

## Setup Instructions for Local Development (Mac M1/M2/M3)

### 1. Prerequisites
- **Node.js**: Version 20 or higher recommended.
- **Docker Desktop**: To run the PostgreSQL database.
- **Clerk Account**: For authentication.

### 2. Environment Variables

Create a `.env` file in the **root** directory (or individual `.env` files in `client/` and `server/` as needed):

**Server (`server/.env`)**
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/meetingcopilot
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**Client (`client/.env`)**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

### 3. Spin up the Database
Use Docker Compose to start the PostgreSQL instance:
```bash
docker-compose up -d
```

### 4. Install Dependencies
From the root directory:
```bash
npm install
```

### 5. Database Schema Sync
Push the Drizzle schema to your local database:
```bash
npm run db:push
```

### 6. Run the Application
Start both the frontend and backend concurrently:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Working with VS Code
- Open the root folder in VS Code.
- Recommended Extensions: **ESLint**, **Prettier**, **Tailwind CSS IntelliSense**, **Drizzle Sidekick**.
- Use the built-in terminal to run the commands above.
