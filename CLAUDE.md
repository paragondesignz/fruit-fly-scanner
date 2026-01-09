# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A biosecurity PWA for detecting fruit fly threat species using AI image analysis. Focused on New Zealand biosecurity.

**Target Species** (all reportable to MPI):
1. Queensland Fruit Fly (Bactrocera tryoni)
2. Oriental Fruit Fly (Bactrocera dorsalis)
3. Spotted-wing Drosophila (Drosophila suzukii)

**Tech Stack**: React 18 + TypeScript + Vite + TailwindCSS + Google Gemini 2.5 Flash

## Commands

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
npm run lint     # ESLint with TypeScript rules
```

## Architecture

Simple client-side app with direct Gemini API calls:

```
src/
├── main.tsx              # React entry point
├── App.tsx               # Main app with state management
├── index.css             # Tailwind imports
├── components/
│   ├── Hero.tsx          # Header with species badges
│   ├── UploadArea.tsx    # Drag-drop image upload
│   ├── ResultCard.tsx    # Detection results display
│   └── ThreatBadge.tsx   # ALERT/UNLIKELY/UNCERTAIN indicator
├── hooks/
│   └── useImageAnalysis.ts   # Orchestrates file → Gemini → result
├── services/
│   └── geminiService.ts      # Direct Gemini API calls with biosecurity prompt
└── lib/
    └── utils.ts          # Tailwind class merging
```

## Key Files

- **`src/services/geminiService.ts`** - Contains the biosecurity detection prompt and Gemini API integration. Modify this to change detection criteria.
- **`src/components/ResultCard.tsx`** - Displays analysis results with MPI reporting links

## Environment Variables

For Vercel: Set `GEMINI_API_KEY` in project environment variables (server-side, no VITE_ prefix needed).

## Detection Logic

The AI prompt in `geminiService.ts` looks for:

**Queensland Fruit Fly**: ~7mm, reddish-brown, yellow scutellum, wing bands
**Oriental Fruit Fly**: ~8mm, dark thorax, yellow markings, "T" on abdomen
**SWD**: ~2-3mm, males have dark wing spots, attacks fresh berries

Returns `threatLikelihood` (internally `qflyLikelihood`): ALERT | UNLIKELY | UNCERTAIN

## Deployment

Deployed via Vercel. Push to main branch triggers automatic deployment.

```bash
vercel --prod    # Manual production deploy
```
