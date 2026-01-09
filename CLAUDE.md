# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A biosecurity PWA for detecting Queensland fruit fly (Bactrocera tryoni) using AI image analysis. Focused on New Zealand biosecurity with Mt Roskill, Auckland as the current hotspot.

**Target Species**: Queensland fruit fly (Q-fly) - Bactrocera tryoni
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

### Frontend (`/src`)

- **`main.tsx`** - React entry point with Convex provider
- **`App.tsx`** - Main app component with state management
- **`components/`** - UI components:
  - `Hero.tsx` - Header with branding and hotspot info
  - `UploadArea.tsx` - Drag-drop image upload
  - `ResultCard.tsx` - Detection results display
  - `ThreatBadge.tsx` - ALERT/UNLIKELY/UNCERTAIN indicator
  - `ReferenceImages.tsx` - iNaturalist/Wikimedia comparison images
  - `PrivacyConsent.tsx` - GDPR-style consent banner
- **`hooks/useImageAnalysis.ts`** - Orchestrates upload → Convex action → result display
- **`lib/utils.ts`** - Tailwind class merging utility

### Backend (`/convex`)

- **`actions/analyzeImage.ts`** - Core AI analysis action using Gemini 2.5 Flash with Q-fly specific prompts and structured output schema
- **`detections.ts`** - Mutations and queries for storing/retrieving detection results
- **`schema.ts`** - Database schema for the `detections` table
- **`lib/security.ts`** - Input sanitization, URL validation, magic byte checking
- **`lib/imageSearch.ts`** - Fetches reference images from iNaturalist and Wikimedia Commons

### Key Data Flow

1. User uploads image → Convex storage via `generateUploadUrl` mutation
2. `analyzeInsectImage` action validates image, sends to Gemini with Q-fly biosecurity prompt
3. AI returns JSON matching `BIOSECURITY_SCHEMA` with `qflyLikelihood` field
4. Result stored in `detections` table, frontend subscribes via `getDetectionWithImage` query
5. Reference images fetched async from iNaturalist/Wikimedia (fire-and-forget pattern)

## Environment Variables

### Convex Dashboard
- `GEMINI_API_KEY` - Google Gemini API key

### Local Development (`.env.local`)
- `VITE_CONVEX_URL` - Convex deployment URL

## Q-fly Detection Features

The AI prompt in `convex/actions/analyzeImage.ts` looks for:

**Positive indicators (any 2+ = ALERT):**
- Body ~7mm (smaller than housefly)
- Reddish-brown with yellow markings
- Clear wings with brown costal band
- Yellow scutellum (shield on thorax)
- Wasp-like narrow waist

**Fruit damage indicators:**
- Puncture marks on fruit skin
- Soft spots around punctures
- Larvae in fruit

## Deployment

- **Frontend**: Vercel (`vercel.json` configured)
- **Backend**: Convex (`npx convex deploy`)
