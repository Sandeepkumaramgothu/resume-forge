# 🚀 ResumeForge AI

**AI-Powered Resume & Cover Letter Generator** — Built with Next.js, GPT-4o, and LaTeX

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)

## What it does

Paste a job description → Get a **tailored LaTeX resume**, **cover letter**, and **email draft** — optimized for ATS, compiled to PDF, ready to download.

### Features

- 🤖 **GPT-4o Powered** — Generates ATS-optimized LaTeX documents from job descriptions
- 📄 **PDF Compilation** — Compiles LaTeX to PDF via LaTeX.Online API
- 🔗 **Overleaf Integration** — Open any document directly in Overleaf
- 📧 **Email Draft** — Ready-to-send application follow-up email
- 🔍 **Job Analysis** — Extracts company, location, keywords, work modality
- 🌙 **Dark/Light Mode** — Premium UI with smooth theme switching
- 📱 **Responsive** — Works on mobile (375px+) to desktop
- 🔒 **Secure** — API keys never exposed to client; rate limited

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | OpenAI GPT-4o |
| LaTeX → PDF | LaTeX.Online API |
| UI Components | Radix UI Primitives |
| Icons | Lucide React |
| Syntax Highlight | highlight.js |
| Notifications | Sonner |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Sandeepkumaramgothu/resume-forge.git
cd resume-forge

# Install dependencies
npm install

# Set your OpenAI API key
cp .env.local.example .env.local
# Edit .env.local and add your key

# Run the dev server
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

Create a `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-key-here
LATEX_COMPILE_URL=https://latex.ytotech.com/builds/sync
```

You can also enter your API key via the in-app settings modal (stored in sessionStorage only).

## Project Structure

```
resume-forge/
├── app/
│   ├── layout.tsx              # Root layout with fonts, SEO, Toaster
│   ├── page.tsx                # Main UI with full state machine
│   ├── globals.css             # Design system & theme tokens
│   └── api/
│       ├── generate/route.ts   # POST: OpenAI GPT-4o call
│       ├── compile/route.ts    # POST: LaTeX → PDF compilation
│       ├── check-key/route.ts  # GET: Check if API key exists
│       └── fetch-url/route.ts  # POST: Fetch JD from URL
├── components/
│   ├── Header.tsx              # Logo, branding, settings
│   ├── ThemeToggle.tsx         # Dark/light mode switch
│   ├── ApiKeyModal.tsx         # API key input modal
│   ├── JobInputForm.tsx        # Job description input
│   ├── StatusBadge.tsx         # 4-step progress indicator
│   ├── OutputPanel.tsx         # Tabbed output with syntax highlighting
│   └── DownloadButton.tsx      # PDF download & Overleaf links
├── lib/
│   ├── systemPrompt.ts         # Complete AI system prompt
│   ├── masterResume.ts         # TypeScript types & constants
│   ├── latexCompile.ts         # LaTeX.Online API helper
│   └── utils.ts                # Utilities, rate limiter, validation
└── .env.local                  # Environment variables (not committed)
```

## How It Works

1. **User pastes a job description** into the input textarea
2. **Frontend sends** the JD to `/api/generate` (server-side)
3. **GPT-4o generates** a tailored LaTeX resume, cover letter, and email draft
4. **Results displayed** in a tabbed panel with syntax highlighting
5. **User downloads PDF** — compiled via LaTeX.Online API, or opens in Overleaf

## Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sandeepkumaramgothu/resume-forge)

Set `OPENAI_API_KEY` in Vercel Environment Variables.

## Author

**Sandeep Kumar Amgothu**
- [LinkedIn](https://www.linkedin.com/in/sandeepkumaramgothu/)
- [GitHub](https://github.com/Sandeepkumaramgothu)
- [Portfolio](https://sandeepkumaramgothu.github.io/Portfolio/#)

## License

MIT
