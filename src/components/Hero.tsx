import { Bug, AlertTriangle } from 'lucide-react'

export function Hero() {
  return (
    <header className="bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 text-white py-12 px-4 mb-8">
      <div className="container mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
          <Bug className="w-10 h-10" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Fruit Fly Scanner
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto">
          AI-powered detection of biosecurity threat species for New Zealand
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Q-fly</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Oriental Fruit Fly</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Spotted-wing Drosophila</span>
          </div>
        </div>
      </div>
    </header>
  )
}
