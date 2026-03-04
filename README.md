# Rutik Yadav — Portfolio

A production-ready full-stack portfolio website built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## 📁 Folder Structure

```
portfolio/
├── app/
│   ├── layout.tsx              # Root layout with SEO metadata & fonts
│   ├── page.tsx                # Main page — assembles all sections
│   ├── globals.css             # Global styles, custom fonts, utilities
│   └── api/
│       └── contact/
│           └── route.ts        # API route — handles contact form (Supabase insert)
│
├── components/
│   ├── Navbar.tsx              # Sticky animated navbar with mobile drawer
│   ├── Hero.tsx                # Hero section with TypeAnimation & floating orbs
│   ├── About.tsx               # About section with animated CGPA progress bar
│   ├── Skills.tsx              # Skills section with glassmorphism category cards
│   ├── Projects.tsx            # Projects section with hover glow effect
│   ├── Experience.tsx          # Experience timeline with company details
│   ├── Education.tsx           # Education with animated progress bars
│   ├── Contact.tsx             # Contact form connected to Supabase
│   ├── Footer.tsx              # Footer with nav and socials
│   └── ui/
│       ├── Button.tsx          # Reusable button with variants & loading state
│       ├── Card.tsx            # Glassmorphism card component
│       └── Container.tsx       # Layout container with max-width variants
│
├── lib/
│   └── supabaseClient.ts       # Supabase client initialization
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── public/
│   ├── resume.pdf              # ← ADD YOUR RESUME HERE
│   └── favicon.ico             # ← ADD YOUR FAVICON HERE
│
├── .env.local.example          # Environment variables template
├── tailwind.config.ts          # Tailwind config with custom theme
├── postcss.config.js
├── next.config.js
├── tsconfig.json
└── package.json
```

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


