export interface AnalysisResult {
  species: string
  confidence: number
  qflyLikelihood: 'ALERT' | 'UNLIKELY' | 'UNCERTAIN'
  matchingFeatures: string[]
  excludingFeatures: string[]
  reasoning: string
  commonName?: string
  scientificName?: string
  reportingAdvice?: string
}

export async function analyzeImage(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      mimeType,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Analysis failed' }))
    throw new Error(error.error || 'Analysis failed')
  }

  return response.json()
}
