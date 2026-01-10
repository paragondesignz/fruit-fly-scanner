import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface AnalysisResult {
  species: string;
  confidence: number;
  qflyLikelihood: "ALERT" | "UNLIKELY" | "UNCERTAIN";
  matchingFeatures: string[];
  excludingFeatures: string[];
  reasoning: string;
  commonName?: string;
  scientificName?: string;
  reportingAdvice?: string;
}

interface UseImageAnalysisReturn {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  analyzeFile: (file: File) => Promise<void>;
  reset: () => void;
}

export function useImageAnalysis(): UseImageAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeImageAction = useAction(api.analyze.analyzeImage);

  const analyzeFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          throw new Error("Please upload a JPEG, PNG, or WebP image");
        }

        // Validate file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          throw new Error("Image too large. Maximum size is 20MB");
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix to get just the base64
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Analyze with Convex action
        const analysisResult = await analyzeImageAction({
          image: base64,
          mimeType: file.type,
        });

        setResult(analysisResult);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [analyzeImageAction]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    analyzeFile,
    reset,
  };
}
