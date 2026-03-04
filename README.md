# Rutik Yadav — Portfolio

A production-ready full-stack portfolio website built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## 📦 NPM Packages to Install

```bash
npm install next@14.2.5 react react-dom \
  @supabase/supabase-js \
  framer-motion \
  react-intersection-observer \
  react-type-animation \
  lucide-react \
  clsx \
  tailwind-merge

npm install -D typescript @types/node @types/react @types/react-dom \
  tailwindcss postcss autoprefixer \
  eslint eslint-config-next
```

Or just run:
```bash
npm install
```

---

## 🔐 Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard → Project → Settings → API**

---

## 🗄️ Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, fill in details

### 2. Create the `contact_messages` Table

In the **SQL Editor**, run:

```sql
-- Create table
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for contact form)
CREATE POLICY "Allow anonymous inserts"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users can read messages (protect submissions)
CREATE POLICY "Allow authenticated reads"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);
```

### 3. Get API Keys
Go to **Settings → API** and copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🚀 Getting Started Locally

```bash
# 1. Clone the repo
git clone https://github.com/Rutikyadav71/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Add your resume PDF
# Place your resume at: public/resume.pdf

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploying to Vercel


