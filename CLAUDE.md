# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A biosecurity PWA for detecting Queensland fruit fly (Bactrocera tryoni) using AI image analysis. This is a new standalone application being built using an existing hornet scanner codebase as reference.

**Target Species**: Queensland fruit fly (Q-fly) - a major agricultural pest in Australia
**Tech Stack**: React 18 + TypeScript + Vite (frontend), Convex (serverless backend), Gemini 2.5 Flash (AI analysis), TailwindCSS (styling)

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (port 5173)
npx convex dev       # Start Convex backend (run in separate terminal)

# Build & Preview
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally

# Lint
npm run lint         # ESLint with TypeScript rules
```

## Architecture

### Backend (Convex)

All backend logic lives in `/convex/`:

- **`actions/analyzeImage.ts`** - Core AI analysis action using Gemini 2.5 Flash with structured output schemas. Contains the biosecurity detection prompts and species identification logic. This is the main file to modify when changing target species.
- **`detections.ts`** - Mutations and queries for storing/retrieving detection results
- **`schema.ts`** - Database schema for the `detections` table
- **`lib/security.ts`** - Input sanitization, URL validation, magic byte checking for images
- **`lib/imageSearch.ts`** - Fetches reference images from iNaturalist and Wikimedia Commons APIs

### Frontend

The frontend React app entry point is `/src/main.tsx` (referenced in `index.html`). Uses:
- TailwindCSS for styling (config in `tailwind.config.js`)
- Lucide React for icons
- Convex React hooks for real-time data

### Key Data Flow

1. User uploads image → Convex storage
2. `analyzeInsectImage` action fetches image, validates magic bytes, sends to Gemini with structured schema
3. AI returns JSON matching `BIOSECURITY_SCHEMA` or `ENTOMOLOGY_SCHEMA`
4. Result stored in `detections` table via `storeDetectionInternal`
5. Reference images fetched async from iNaturalist/Wikimedia (fire-and-forget pattern)

## Environment Variables

Required in Convex dashboard:
- `GEMINI_API_KEY` - Google Gemini API key

## Building the Q-fly Scanner

The existing codebase contains a hornet scanner as reference. Key files to adapt:

1. **`convex/actions/analyzeImage.ts`** - Replace `BIOSECURITY_SCHEMA` and `BIOSECURITY_PROMPT` with Q-fly identification:
   - Key features: 7mm body, reddish-brown with yellow markings, distinctive wing patterns
   - Common lookalikes: native fruit flies, vinegar flies, other Bactrocera species

2. **`src/`** - Frontend needs to be created (referenced in `index.html` but directory doesn't exist)

3. **Assets** - Replace `hornet-scanner.svg`, update `index.html` title/meta, create new PWA icons

4. **Reference images** - `lib/imageSearch.ts` dynamically fetches from iNaturalist/Wikimedia by species name

## Deployment

Configured for Vercel (`vercel.json`) and Netlify (`netlify.toml` mentioned in README). Security headers are set in `vite.config.ts` for preview mode.
