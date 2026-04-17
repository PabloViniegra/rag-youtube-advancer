# Second Brain

A SaaS platform that transforms YouTube videos into a searchable "Second Brain" using Retrieval-Augmented Generation (RAG). Content creators can index video transcripts, generate AI-powered summaries, social media hooks, and contextual insights.

## Table of Contents

- [Features](#features)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [RAG Pipeline Architecture](#rag-pipeline-architecture)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [License](#license)

---

## Features

- **YouTube Transcript Extraction**: Automatically fetch and process captions from any YouTube video
- **Text Chunking**: Intelligent segmentation with context overlap for accurate retrieval
- **Vector Embeddings**: Generate 1536-dimension embeddings via Vercel AI Gateway
- **Semantic Search**: Cosine similarity search across indexed video content
- **AI Augmentation**: Generate summaries, social media hooks, and insights from video context
- **User Authentication**: GitHub and Google OAuth via Supabase
- **Subscription Management**: Stripe billing integration for monetization
- **Dashboard**: Clean interface for managing videos, search, and AI features

---

## Technical Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL with pgvector (Supabase) |
| Authentication | Supabase Auth (GitHub, Google OAuth) |
| AI Engine | Vercel AI Gateway |
| Payments | Stripe |
| Error Tracking | Sentry |
| Testing | Vitest |
| Code Quality | Biome |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Bun (recommended) or npm/pnpm/yarn
- Supabase project with pgvector extension
- Vercel AI Gateway API key
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/anomalyco/rag-youtube-advancer.git
cd rag-youtube-advancer

# Install dependencies (uses Bun)
bun install

# Or with npm
npm install
```

### Environment Setup

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

Required environment variables:

| Variable | Description |
|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side) |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `SENTRY_AUTH_TOKEN` | Sentry auth token |
| `SENTRY_ORG` | Sentry organization |
| `SENTRY_PROJECT` | Sentry project |

### Development

```bash
# Run development server
bun dev

# Build for production
bun build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/           # Auth routes
│   ├── (dashboard)/      # Protected dashboard routes
│   ├── api/             # API routes
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── landing/         # Landing page components
│   └── ui/              # Shared UI components
└── lib/                # Core library code
    ├── ai/             # AI utilities (embedding, chunking)
    ├── augmentation/    # RAG augmentation
    ├── auth/           # Auth actions
    ├── pipeline/       # Ingestion pipeline
    ├── retrieval/      # RAG retrieval
    ├── seo/           # SEO generation
    ├── storage/       # Vector storage
    ├── stripe/       # Stripe integration
    ├── weekly-digest/ # Digest generation
    ├── youtube/      # YouTube utilities
    └── ...
```

### Key Directories

- `src/lib/pipeline/`: Video ingestion pipeline
- `src/lib/retrieval/`: Semantic search functionality
- `src/lib/augmentation/`: AI response generation
- `src/components/dashboard/`: Dashboard UI components

---

## RAG Pipeline Architecture

The system implements a complete RAG pipeline:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingestion     │───>│   Chunking       │───>│  Embedding      │
│ (YouTube URL)   │    │ (~1000 chars)   │    │ (1536-dim)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌─────────────────┐    ┌──────────┘
│   Augmentation  │<───│   Retrieval     │<───│  Storage  │
│ (LLM Context)   │    │ (Cosine Sim)   │    │ (pgvector│
└─────────────────┘    └─────────────────┘    └──────────┘
```

### Pipeline Phases

1. **Ingestion**: Extract transcript from YouTube URL using `youtube-transcript`
2. **Chunking**: Split text into ~1000-character segments with 200-character overlap
3. **Embedding**: Generate 1536-dimension vectors via Vercel AI Gateway
4. **Storage**: Store metadata and vectors in Supabase using `vector` type
5. **Retrieval**: Convert queries to vectors, perform cosine similarity search
6. **Augmentation**: Pass top segments to LLM as context for responses

---

## Database Schema

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- User profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  role text default 'user',
  stripe_customer_id text,
  subscription_active boolean default false
);

-- Videos
create table videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  youtube_id text not null,
  title text,
  created_at timestamp with time zone default now()
);

-- Vector storage (the "Brain")
create table video_sections (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references videos(id) on delete cascade,
  content text,
  embedding vector(1536)
);
```

### Row Level Security

- **Read Access**: Users can only query `video_sections` for owned videos or if admin
- **Write Access**: Restricted to users with active subscription or admin role

---

## Environment Variables

Configure these in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Gateway
AI_GATEWAY_API_KEY=your_gateway_api_key
OPENAI_API_KEY=your_openai_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Sentry
SENTRY_AUTH_TOKEN=your_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

---

## Testing

```bash
# Run all tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test --watch
```

### Test Coverage

The project includes unit tests for:

- YouTube transcript extraction
- Text chunking
- Vector embedding
- Semantic retrieval
- Storage operations
- Auth actions
- SEO generation

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contributing

Contributions are welcome. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.