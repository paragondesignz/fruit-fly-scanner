import { useState, useCallback } from 'react'
import { AlertTriangle, ExternalLink, Shield, Menu, X, Camera, Bug } from 'lucide-react'
import { UploadArea } from './components/UploadArea'
import { ResultCard } from './components/ResultCard'
import { useImageAnalysis } from './hooks/useImageAnalysis'

type AppState = 'home' | 'analyzing' | 'results' | 'error'

function App() {
  const [appState, setAppState] = useState<AppState>('home')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isLoading, error, result, analyzeFile, reset } = useImageAnalysis()

  const handleImageSelect = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    setAppState('analyzing')
    try {
      await analyzeFile(file)
      setAppState('results')
    } catch {
      setAppState('error')
    }
  }, [analyzeFile])

  const handleBackToHome = useCallback(() => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
      setSelectedImage(null)
    }
    setAppState('home')
    reset()
  }, [selectedImage, reset])

  const handleReportThreat = () => {
    window.open('https://report.mpi.govt.nz/pest/', '_blank')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleHomeClick = () => {
    handleBackToHome()
    scrollToTop()
  }

  // Logo with custom icon
  const Logo = () => (
    <div className="flex items-center gap-3">
      <img
        src="/qfly-scanner.svg"
        alt=""
        className="w-10 h-10"
        aria-hidden="true"
      />
      <h1 className="font-display text-lg font-bold text-slate-100 tracking-tight">
        Fruit Fly Scanner
      </h1>
    </div>
  )

  // Fruit Fly Examples Strip - using colored boxes as placeholders
  const FruitFlyStrip = () => (
    <div className="w-full overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-red-600" aria-label="Fruit fly threat species">
      <div className="flex items-center justify-center gap-4 py-3 px-4">
        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          <span>Queensland Fruit Fly</span>
        </div>
        <span className="text-white/40">|</span>
        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          <span>Oriental Fruit Fly</span>
        </div>
        <span className="text-white/40">|</span>
        <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          <span>Spotted-wing Drosophila</span>
        </div>
      </div>
    </div>
  )

  // Desktop Header
  const DesktopHeader = () => (
    <header className="hidden lg:block bg-[#0f1629] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={handleHomeClick} className="flex items-center" aria-label="Go to home">
            <Logo />
          </button>

          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <a
              href="https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/queensland-fruit-fly"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <Shield className="w-4 h-4" />
              MPI Info
            </a>
            <button
              onClick={() => setAppState('home')}
              className="btn-primary"
            >
              <Camera className="w-4 h-4" />
              Scan Now
            </button>
          </nav>
        </div>
      </div>
    </header>
  )

  // Mobile Header
  const MobileHeader = () => (
    <header className="lg:hidden bg-[#0f1629] border-b border-slate-800 z-50">
      <div className="px-4 h-14 flex items-center justify-between">
        <button onClick={handleHomeClick} aria-label="Go to home">
          <Logo />
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="absolute top-14 left-0 right-0 border-b border-slate-800 p-4 space-y-3 z-50"
          style={{ backgroundColor: '#0f1629' }}
        >
          <a
            href="https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/queensland-fruit-fly"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 text-slate-200 hover:bg-[#1a2540] rounded-lg"
          >
            <Shield className="w-5 h-5 text-[#fb923c]" />
            MPI Info
            <ExternalLink className="w-4 h-4 ml-auto text-slate-500" />
          </a>
          <button
            onClick={() => {
              setAppState('home')
              setMobileMenuOpen(false)
            }}
            className="btn-primary w-full"
          >
            <Camera className="w-4 h-4" />
            Scan Now
          </button>
        </div>
      )}
    </header>
  )

  // Analyzing State
  if (appState === 'analyzing' && isLoading) {
    return (
      <div className="min-h-screen bg-base grid-pattern pb-8">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <DesktopHeader />
        <MobileHeader />
        <FruitFlyStrip />
        <main id="main-content" className="relative z-10 max-w-2xl mx-auto px-4 lg:px-8 py-6">
          <div className="card-elevated p-6 lg:p-8 text-center" role="status" aria-live="polite">
            {/* Image Preview */}
            <div className="relative w-48 h-48 lg:w-56 lg:h-56 mx-auto mb-6">
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Image being analyzed"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a2540] flex items-center justify-center">
                    <Bug className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                {/* Scanner overlay with glowing scan line */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="scan-line-glow" />
                  <div className="scanner-corner scanner-corner-tl" />
                  <div className="scanner-corner scanner-corner-tr" />
                  <div className="scanner-corner scanner-corner-bl" />
                  <div className="scanner-corner scanner-corner-br" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <div className="badge badge-info">
                <span className="status-dot status-dot-processing" />
                Processing
              </div>
              <h2 className="font-display text-xl lg:text-2xl font-bold text-slate-100">
                Analyzing Image
              </h2>
              <p className="text-slate-200">
                Checking for biosecurity threat species...
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-6 w-full h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
              <div className="h-full w-full shimmer rounded-full" />
            </div>

            <p className="text-xs text-slate-500 mt-3">
              This typically takes 5-15 seconds
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Error State
  if (appState === 'error' || error) {
    return (
      <div className="min-h-screen bg-base grid-pattern pb-8">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <DesktopHeader />
        <MobileHeader />
        <FruitFlyStrip />
        <main id="main-content" className="relative z-10 max-w-md mx-auto px-4 lg:px-8 py-8">
          <div className="card-elevated p-8 lg:p-12 text-center" role="alert">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[rgba(239,68,68,0.12)] flex items-center justify-center border border-[rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
            </div>
            <h2 className="font-display text-xl lg:text-2xl font-bold text-slate-100 mb-3">
              Analysis Failed
            </h2>
            <p className="text-slate-200 mb-8">
              {error || 'An unexpected error occurred during analysis.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleBackToHome}
                className="btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToHome}
                className="btn-secondary"
              >
                Go Home
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Results State
  if (appState === 'results' && result) {
    return (
      <div className="min-h-screen bg-base grid-pattern pb-8">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <DesktopHeader />
        <MobileHeader />
        <FruitFlyStrip />
        <main id="main-content" className="relative z-10 max-w-2xl mx-auto px-4 lg:px-8 py-6">
          <ResultCard
            data={result}
            imageUrl={selectedImage}
            onScanAnother={handleBackToHome}
            onReportThreat={handleReportThreat}
          />
        </main>
      </div>
    )
  }

  // Home Screen
  return (
    <div className="min-h-screen bg-base grid-pattern pb-8">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <DesktopHeader />
      <MobileHeader />
      <FruitFlyStrip />

      <main id="main-content" className="relative z-10 px-4 lg:px-8 max-w-2xl mx-auto pt-4 pb-6 lg:pt-6 lg:pb-8">
        {/* Hero Section */}
        <section className="mb-6" aria-labelledby="hero-title">
          <h2 id="hero-title" className="font-display text-xl lg:text-2xl font-bold text-slate-100 mb-3">
            Protect NZ Biosecurity
          </h2>
          <p className="text-sm lg:text-base leading-relaxed" style={{ color: '#cbd5e1' }}>
            Help protect New Zealand's biosecurity. Scan any fly to check if it's a
            Queensland fruit fly, Oriental fruit fly, or Spotted-wing Drosophila —
            invasive species that threaten our horticulture industry.
          </p>
        </section>

        <div className="space-y-6">
          {/* Main Upload CTA */}
          <section>
            <UploadArea
              onImageSelected={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleBackToHome}
              isLoading={isLoading}
            />
          </section>

          {/* Species Info Cards */}
          <section className="space-y-4">
            <h3 className="font-display font-semibold text-slate-100 text-sm">
              MPI Biosecurity Threat Species
            </h3>

            <div className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[rgba(239,68,68,0.12)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(239,68,68,0.2)]">
                  <AlertTriangle className="w-5 h-5 text-[#f87171]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">Queensland Fruit Fly</h4>
                  <p className="text-xs text-[#f87171] mb-1">Recent detection: Mt Roskill, Auckland</p>
                  <p className="text-xs text-slate-400">~7mm, reddish-brown, yellow scutellum, wing bands</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[rgba(245,158,11,0.12)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(245,158,11,0.2)]">
                  <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">Oriental Fruit Fly</h4>
                  <p className="text-xs text-slate-400">~8mm, dark thorax, yellow markings, "T" marking on abdomen</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[rgba(251,146,60,0.15)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(251,146,60,0.3)]">
                  <AlertTriangle className="w-5 h-5 text-[#fdba74]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-100 text-sm mb-1">Spotted-wing Drosophila (SWD)</h4>
                  <p className="text-xs text-slate-400">~2-3mm, males have dark wing spots, attacks fresh berries</p>
                </div>
              </div>
            </div>
          </section>

          {/* Report Section */}
          <section className="card p-5" aria-labelledby="report-title">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[rgba(245,158,11,0.12)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[rgba(245,158,11,0.2)]">
                <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="report-title" className="font-display font-semibold text-slate-100 mb-1">
                  Report a Sighting
                </h3>
                <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                  Think you've found a fruit fly? Report immediately.
                </p>
                <a
                  href="tel:0800809966"
                  className="text-xl font-bold text-[#fb923c] hover:text-[#fdba74] transition-colors block mb-2"
                >
                  0800 80 99 66
                </a>
                <a
                  href="https://report.mpi.govt.nz/pest/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#fb923c] transition-colors"
                >
                  Or report online at report.mpi.govt.nz
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
