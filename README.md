# AI Meeting Co-pilot SaaS

This is the boilerplate for the AI Meeting Co-pilot SaaS app, containing project structure, database schema, authentication, and basic workspace CRUD.

## Monorepo Structure
- `client/` - React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Clerk, Wouter
- `server/` - Node.js, Express, TypeScript, Clerk Express, Drizzle ORM
- `shared/` - Shared types, Zod schemas, and API definitions

## Setup Instructions

### Environment Variables

You need to provide Clerk API keys for authentication to work correctly.

**Server (`.env`)**
Add the following to your environment secrets or `.env`:
- `CLERK_SECRET_KEY`

**Client (`client/.env` or Replit Secrets)**
- `VITE_CLERK_PUBLISHABLE_KEY` (The app uses a dummy key if not provided, but Clerk will fail to load)

### Running Locally (Without Replit)
If you are running this outside of Replit, you can use the provided `docker-compose.yml` to spin up a PostgreSQL instance:

```bash
docker-compose up -d
```

Ensure your `DATABASE_URL` is set to `postgresql://postgres:password@localhost:5432/meetingcopilot`

### Database Migrations

This project uses Drizzle ORM. To push your schema changes to the database, run:

```bash
npm run db:push
```

### Running the App

Start both the frontend and backend concurrently:

```bash
npm run dev
```

The frontend will run on the Vite dev server and proxy API requests to the Express backend.
