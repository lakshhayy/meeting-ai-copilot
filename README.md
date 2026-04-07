# 🎙️ AI Meeting Co-pilot

An enterprise-grade, multi-tenant SaaS platform that automatically transcribes audio meetings and extracts structured business intelligence (TL;DRs, Action Items, Key Decisions) using chained AI background workers.

## ✨ Features

- **Asynchronous AI Pipeline:** Offloads heavy audio processing and LLM generation to Redis/BullMQ background workers, completely protecting the Node.js main thread.
- **Multi-Tenant Architecture:** Secure Workspaces with Role-Based Access Control (RBAC) enforced at the database layer (Admin vs. Member).
- **Chained AI Agents:** - *Worker 1:* Transcribes raw audio using the high-speed **Groq Whisper API**.
  - *Worker 2:* Parses the transcript using **Google Gemini 2.5 Flash** with native `responseSchema` for deterministic JSON extraction.
- **Real-Time UI Updates:** Uses WebSockets (`Socket.io`) to instantly push state changes (Uploading -> Transcribing -> Analysing -> Ready) to the React client.
- **RAG Meeting Chat:** Vector embeddings allow users to interactively "chat" with their meeting transcripts to find specific insights.
- **Browser Extension:** Included custom Chrome Extension to natively capture and stream Google Meet audio directly to the processing pipeline.

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS & Shadcn UI
- TanStack Query (React Query)
- Socket.io-client

**Backend:**
- Node.js & Express
- TypeScript
- Redis & BullMQ (Message Queues)
- Multer & Cloudinary (File Handling)

**Database & Auth:**
- PostgreSQL
- Drizzle ORM
- Clerk (Authentication & JWT Verification)

**AI & APIs:**
- Groq API (Whisper Transcription)
- Google Gemini 2.5 Flash (Structured Outputs)
- OpenAI (Vector Embeddings for RAG)

## 🏗️ Architecture & Data Flow

1. **Ingestion:** User uploads a `.mp3/.wav` file (or records via Chrome Extension).
2. **Storage:** Express intercepts via Multer and uploads the binary to Cloudinary.
3. **Queue:** Express creates a DB record with status `uploading`, pushes a job ticket to Redis, and instantly returns a `200 OK` to the client.
4. **Transcription Worker:** Background job downloads the audio, pings Groq API, saves the text, and triggers the next worker.
5. **AI Worker:** Gemini 2.5 Flash receives the text and generates a strictly typed JSON payload containing Action Items and Summaries.
6. **Real-time Delivery:** Server fires a WebSocket event to the client, triggering TanStack Query to refetch and display the finalized UI.

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL running locally or via a provider like Neon/Supabase
- Redis server running locally or via a provider like Upstash

### 2. Clone the Repository
```bash
git clone [https://github.com/yourusername/meeting-ai-copilot.git](https://github.com/yourusername/meeting-ai-copilot.git)
cd meeting-ai-copilot
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and add the following keys:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/meeting_copilot

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Queues (Redis)
REDIS_URL=redis://127.0.0.1:6379

# AI Providers
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-... # For Embeddings/RAG
```

### 5. Database Setup
Push the Drizzle schema to your PostgreSQL database:
```bash
npm run db:push
```

### 6. Run the Application
Start the development server (runs both the React frontend and Express backend concurrently):
```bash
npm run dev
```
The app will be available at `http://localhost:5000`.

## 📁 Project Structure

```text
├── client/                 # React Frontend
│   ├── src/components/     # Reusable UI & Layouts
│   ├── src/pages/          # Main Views (Dashboard, MeetingDetail)
│   └── src/hooks/          # Custom Hooks (WebSockets, API)
├── server/                 # Express Backend
│   ├── routes/             # API Endpoints
│   ├── queues/             # BullMQ Workers (AI & Transcription)
│   ├── services/           # External API Logic (Gemini, Groq, Cloudinary)
│   └── socket.ts           # WebSocket setup
├── shared/                 # Monorepo Shared Types
│   └── schema.ts           # Drizzle ORM DB Schema & TS Types
└── extension/              # Chrome Extension Source Code
```

## 🔒 Security Notes
- JWT Verification is strictly enforced on all `/api/*` routes.
- Database queries use contextual `workspace_id` filtering to ensure strict multi-tenant data isolation.

---
*Built as a highly scalable, decoupled architecture demonstration.*
```
