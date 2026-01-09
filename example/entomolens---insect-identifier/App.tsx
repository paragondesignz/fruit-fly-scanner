import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { UploadArea } from './components/UploadArea';
import { ResultCard } from './components/ResultCard';
import { identifyInsect } from './services/geminiService';
import { InsectData, AnalysisState } from './types';
import { Loader2, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const handleImageSelect = async (file: File) => {
    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setAnalysis({ isLoading: true, error: null, data: null });

    try {
      // Convert file to base64 for the API
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const result = await identifyInsect(base64String);
          setAnalysis({ isLoading: false, error: null, data: result });
        } catch (err: any) {
          setAnalysis({ 
            isLoading: false, 
            error: err.message || "Something went wrong during analysis.", 
            data: null 
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAnalysis({ isLoading: false, error: "Failed to process image.", data: null });
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setAnalysis({ isLoading: false, error: null, data: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <Hero />

      <main className="flex-grow container mx-auto px-4">
        
        <div className="flex flex-col items-center gap-8">
          {/* Upload Section */}
          <div className="w-full max-w-2xl">
             <UploadArea 
               onImageSelected={handleImageSelect} 
               selectedImage={selectedImage}
               onClear={handleClear}
             />
          </div>

          {/* Loading State */}
          {analysis.isLoading && (
            <div className="flex flex-col items-center justify-center p-8 mt-4 animate-pulse">
              <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700">Examining Insect...</h3>
              <p className="text-slate-500 text-sm mt-2">Consulting the virtual entomologist</p>
            </div>
          )}

          {/* Error State */}
          {analysis.error && (
            <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center text-center mt-4">
              <h3 className="text-red-800 font-semibold mb-2">Identification Failed</h3>
              <p className="text-red-600 text-sm mb-4">{analysis.error}</p>
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
          {!analysis.isLoading && analysis.data && (
            <ResultCard data={analysis.data} />
          )}
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} EntomoLens. AI results may vary.</p>
      </footer>
    </div>
  );
};

export default App;