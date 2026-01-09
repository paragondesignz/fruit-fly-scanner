import { useState, useCallback } from 'react'
import { Hero } from './components/Hero'
import { UploadArea } from './components/UploadArea'
import { ResultCard } from './components/ResultCard'
import { useImageAnalysis } from './hooks/useImageAnalysis'
import { Loader2, RefreshCw } from 'lucide-react'

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { isLoading, error, result, analyzeFile, reset } = useImageAnalysis()

  const handleImageSelect = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
    await analyzeFile(file)
  }, [analyzeFile])

  const handleClear = useCallback(() => {
    setSelectedImage(null)
    reset()
  }, [reset])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Hero />

      <main className="flex-grow container mx-auto px-4 pb-12">
        <div className="flex flex-col items-center gap-8">
          {/* Upload Section */}
          <div className="w-full max-w-2xl">
            <UploadArea
              onImageSelected={handleImageSelect}
              selectedImage={selectedImage}
              onClear={handleClear}
              isLoading={isLoading}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 animate-pulse">
              <div className="bg-orange-100 p-4 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700">Analyzing Image...</h3>
              <p className="text-slate-500 text-sm mt-2">Checking for biosecurity threat species</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center text-center">
              <h3 className="text-red-800 font-semibold mb-2">Analysis Failed</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={handleClear}
                className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another Photo
              </button>
            </div>
          )}

          {/* Result State */}
          {!isLoading && result && (
            <ResultCard data={result} />
          )}

          {/* Info Section */}
          {!selectedImage && !result && (
            <div className="w-full max-w-2xl mt-4 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  MPI Biosecurity Threat Species
                </h2>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-1">Queensland Fruit Fly (Q-fly)</h3>
                    <p className="text-red-700 text-xs mb-2">Recent detection: Mt Roskill, Auckland</p>
                    <p className="text-slate-600">~7mm, reddish-brown, yellow scutellum, wing bands</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-1">Oriental Fruit Fly</h3>
                    <p className="text-slate-600">~8mm, dark thorax, yellow markings, "T" marking on abdomen</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-1">Spotted-wing Drosophila (SWD)</h3>
                    <p className="text-slate-600">~2-3mm, males have dark wing spots, attacks fresh berries</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  What to Look For
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">On Flies:</h3>
                    <ul className="space-y-1 text-slate-600">
                      <li>• Wing bands or spots</li>
                      <li>• Yellow markings on body</li>
                      <li>• Size compared to housefly</li>
                      <li>• Hovering near ripe fruit</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">On Fruit:</h3>
                    <ul className="space-y-1 text-slate-600">
                      <li>• Small puncture marks</li>
                      <li>• Soft spots on skin</li>
                      <li>• Premature fruit drop</li>
                      <li>• Larvae (maggots) inside</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        <p>Fruit Fly Scanner - New Zealand Biosecurity</p>
        <p className="mt-1">
          Report sightings:{' '}
          <a href="tel:0800809966" className="text-orange-600 hover:underline">
            0800 80 99 66
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
