# Q-fly Scanner - New Zealand Biosecurity

> **Status**: Development | AI-powered Queensland fruit fly detection

A Progressive Web App for detecting Queensland fruit fly (Bactrocera tryoni) in New Zealand, powered by AI image analysis.

## Background

Queensland fruit fly (Q-fly) is one of the world's most destructive horticultural pests. A male Q-fly was recently detected in Mt Roskill, Auckland, triggering a biosecurity emergency. Q-fly could devastate New Zealand's $6 billion horticulture industry if established.

## Features

- **AI-Powered Detection** - Gemini 2.5 Flash analyzes images for Q-fly characteristics
- **Instant Results** - Get identification results in seconds
- **Reference Images** - Compare your photo with verified Q-fly images from iNaturalist
- **Privacy Focused** - Optional location sharing, GDPR-compliant consent
- **Mobile-Friendly** - PWA with camera access, works offline
- **MPI Integration** - Direct links to report sightings to MPI

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Convex (serverless)
- **AI**: Google Gemini 2.5 Flash
- **Hosting**: Vercel

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# In separate terminal, start Convex
npx convex dev

# Build for production
npm run build
```

## Environment Variables

### Convex Dashboard
- `GEMINI_API_KEY` - Google Gemini API key

### Local Development
Create `.env.local`:
```
VITE_CONVEX_URL=your_convex_deployment_url
```

## Q-fly Identification

### Key Features
- ~7mm body (smaller than housefly)
- Reddish-brown with yellow markings
- Clear wings with brown costal band
- Yellow scutellum (shield on thorax)
- Wasp-like narrow waist

### What to Report
- Any fly matching Q-fly description
- Fruit with puncture marks or soft spots
- Larvae in fruit
- Unusual fruit drop

### Report Sightings
**MPI Hotline: 0800 80 99 66**

Do not kill suspected Q-fly - capture it if possible for identification.

## Links

- [MPI Q-fly Information](https://www.mpi.govt.nz/biosecurity/exotic-pests-and-diseases-in-new-zealand/queensland-fruit-fly/)
- [Q-fly Response](https://www.biosecurity.govt.nz/protection-and-response/responding/alerts/queensland-fruit-fly/)

## License

MIT

---

Built for New Zealand biosecurity protection
