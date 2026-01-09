# Fruit Fly Scanner - New Zealand Biosecurity

> AI-powered detection of biosecurity threat fruit fly species

A Progressive Web App for detecting biosecurity threat fruit flies in New Zealand, powered by Google Gemini AI.

## Target Species

MPI requires reporting of these three species:

1. **Queensland Fruit Fly (Q-fly)** - Bactrocera tryoni
   - Recent detection: Mt Roskill, Auckland
   - ~7mm, reddish-brown, yellow scutellum, wing bands

2. **Oriental Fruit Fly** - Bactrocera dorsalis
   - Major global pest
   - ~8mm, dark thorax, yellow markings, "T" marking on abdomen

3. **Spotted-wing Drosophila (SWD)** - Drosophila suzukii
   - Attacks fresh soft berries
   - ~2-3mm, males have distinctive dark wing spots

## Features

- **AI-Powered Detection** - Gemini 2.5 Flash analyzes images
- **Instant Results** - Get identification in seconds
- **Mobile-Friendly** - Responsive design with camera access
- **MPI Integration** - Direct links to report sightings

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **AI**: Google Gemini 2.5 Flash (direct API)
- **Hosting**: Vercel

## Development

```bash
# Install dependencies
npm install

# Create .env.local with your Gemini API key
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env.local`:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

For Vercel deployment, set `VITE_GEMINI_API_KEY` in project settings.

## Report Sightings

**MPI Hotline: 0800 80 99 66**

Do not kill suspected flies - capture if possible for identification.

## Links

- [MPI Fruit Fly Information](https://www.mpi.govt.nz/biosecurity/exotic-pests-and-diseases-in-new-zealand/queensland-fruit-fly/)
- [Biosecurity NZ](https://www.biosecurity.govt.nz/)

## License

MIT

---

Built for New Zealand biosecurity protection
