## 1. Project Overview
A SaaS platform built with **Next.js 14+** or **Nuxt 3** that allows content creators to transform YouTube videos into a searchable "Second Brain." The system uses **RAG (Retrieval-Augmented Generation)** to index video transcripts into a vector database, enabling users to generate summaries, social media hooks, and contextual insights via AI.

**Monetization:** $5/month subscription model via Stripe (Free for the Admin/Creator).

---

## 2. Technical Stack
* **Framework:** Next.js 16 (App Router).
* **Auth & Database:** Supabase (Auth + PostgreSQL with `pgvector`).
* **AI Engine:** Vercel AI GAteway.
* **Payments:** Stripe Billing + Webhooks.
* **Styling:** Tailwind CSS.

---

## 3. Core Architecture (RAG Flow)
1.  **Ingestion:** Extract transcript from a YouTube URL (using `youtube-transcript` or similar).
2.  **Chunking:** Split text into ~1000-character segments with 200-character overlaps to maintain context.
3.  **Embedding:** Convert segments into 1536-dimension vectors via Vercel AI Gateway.
4.  **Storage:** Store text metadata and vectors in Supabase using the `vector` data type.
5.  **Retrieval:** Convert user queries into vectors and perform a **Cosine Similarity** search in the DB.
6.  **Augmentation:** Pass the top 3-5 relevant segments to the LLM (GPT) as context for the final answer.

---

## 4. Database Schema (Supabase/PostgreSQL)

```sql
-- Enable the pgvector extension
create extension if not exists vector;

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  role text default 'user', -- 'user', 'pro', 'admin'
  stripe_customer_id text,
  subscription_active boolean default false
);

-- Videos table
create table videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  youtube_id text not null,
  title text,
  created_at timestamp with time zone default now()
);

-- Vector storage table (The "Brain")
create table video_sections (
  id uuid default gen_random_uuid() primary key,
  video_id uuid references videos(id) on delete cascade,
  content text,
  embedding vector(1536) -- Matches OpenAI embedding dimensions
);
```

---

## 5. Security & Business Logic (RLS)

**Row Level Security (RLS) Policies:**

- **Read Access:** Users can only query `video_sections` if they own the parent video OR if the user's role is `'admin'`.
- **Write Access:** Restricted to users with `subscription_active = true` or `role = 'admin'`.

**Authorization Providers:**

- **GitHub OAuth** (via Supabase Auth)
- **Google OAuth** (via Supabase Auth)

---

## 6. Strict rules YOU MUST follow

- **USE ALWAYS** `caveman` skill whatever you do.
- **USE ALWAYS** `using-superpowers` skill before do anything in the project.
- **DELEGATE** appropriate tasks to subagents.
- **USE ALWAYS** `typescript` and `typescript-advanced-types` skills when you are writing Typescript code.
- **USE ALWAYS** `tailwind-4` and `tailwind-css-patterns` skills for styling.
- **USE ALWAYS** `react-19` skill for manage React.
- **USE ALWAYS** `vercel-react-best-practices`, `vercel-composition-patterns`, `vercel-react-view-transitions`, `next-best-practices`, `next-cache-components` and `next-upgrade` skills for manage Nextjs.
- **USE ALWAYS** `nextjs-supabase-auth` and `supabase-postgres-best-practices` skills for Supabase.
- **USE ALWAYS** `accesibility` skill for working on accesibility.
- **USE ALWAYS** `design skills` like `ui-ux-pro-max` for design.
- **ALWAYS** save important learnings and decision in `engram`.
- **Components MUST NOT exceed 200 lines.** If a component grows beyond this limit, split it into smaller sub-components or extract icon sets, data arrays, and sub-sections into separate files.
- **USE ALWAYS** bun if is possible.
- **USE ALWAYS** `error-handling-patterns` when you are writing code.
- **ALWAYS** sync any new documentation created in `docs/` folder to Obsidian vault.

---

## 📚 Knowledge Base (Obsidian)

All project knowledge is stored in **Obsidian** at:
- **Path:** `/home/pablo/Documentos/Obsidian Vault/rag-youtube-advancer/`

### Vault Contents

| File | Description |
|------|-------------|
| `README.md` | Project index |
| `00_Project_Overview.md` | Project definition |
| `01_Technical_Stack.md` | Tech stack |
| `02_RAG_Flow.md` | RAG pipeline |
| `03_Database_Schema.md` | SQL schema |
| `04_Auth.md` | OAuth & roles |
| `05_Rules_Skills.md` | Mandatory skills |