import { useState, useCallback, useEffect } from 'react'
import { useMutation, useQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

interface AnalysisResult {
  species: string
  confidence: number
  qflyLikelihood: 'ALERT' | 'UNLIKELY' | 'UNCERTAIN'
  matchingFeatures: string[]
  excludingFeatures: string[]
  reasoning: string
  commonName?: string
  scientificName?: string
  reportingAdvice?: string
  referenceImages?: Array<{
    url: string
    description: string
    source?: string
  }>
}

interface UseImageAnalysisReturn {
  isLoading: boolean
  error: string | null
  result: AnalysisResult | null
  uploadedImageUrl: string | null
  analyzeImage: (file: File, consent: { privacy: boolean; location: boolean }) => Promise<void>
  reset: () => void
}

export function useImageAnalysis(): UseImageAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [detectionId, setDetectionId] = useState<Id<"detections"> | null>(null)

  const generateUploadUrl = useMutation(api.detections.generateUploadUrl)
  const analyzeInsectImageAction = useAction(api.actions.analyzeImage.analyzeInsectImage)

  // Subscribe to detection updates for reference images
  const detection = useQuery(
    api.detections.getDetectionWithImage,
    detectionId ? { id: detectionId } : "skip"
  )

  // Update result when detection changes (e.g., reference images added)
  useEffect(() => {
    if (detection && detection.aiResponse) {
      try {
        const aiResponse = JSON.parse(detection.aiResponse)
        const newResult: AnalysisResult = {
          species: detection.species || 'Unknown',
          confidence: detection.confidence,
          qflyLikelihood: aiResponse.qflyLikelihood || 'UNCERTAIN',
          matchingFeatures: aiResponse.matchingFeatures || [],
          excludingFeatures: aiResponse.excludingFeatures || [],
          reasoning: aiResponse.reasoning || '',
          commonName: aiResponse.commonName,
          scientificName: aiResponse.scientificName,
          reportingAdvice: aiResponse.reportingAdvice,
          referenceImages: detection.referenceImages,
        }
        setResult(newResult)
        if (detection.uploadedImageUrl) {
          setUploadedImageUrl(detection.uploadedImageUrl)
        }
        setIsLoading(false)
      } catch {
        setError('Failed to parse analysis results')
        setIsLoading(false)
      }
    }
  }, [detection])

  const analyzeImage = useCallback(async (
    file: File,
    consent: { privacy: boolean; location: boolean }
  ) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setDetectionId(null)

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setUploadedImageUrl(previewUrl)

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl()

      // Upload the image
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { storageId } = await uploadResponse.json()

      // Get location if consented
      let latitude: number | undefined
      let longitude: number | undefined

      if (consent.location && 'geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000,
            })
          })
          latitude = position.coords.latitude
          longitude = position.coords.longitude
        } catch {
          // Location unavailable, continue without it
        }
      }

      // Call the action to analyze the image
      const resultId = await analyzeInsectImageAction({
        storageId,
        latitude,
        longitude,
        mode: 'biosecurity',
        privacyConsentGiven: consent.privacy,
        locationSharingConsent: consent.location,
      })

      // Set the detection ID to trigger the query subscription
      setDetectionId(resultId as Id<"detections">)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setIsLoading(false)
    }
  }, [generateUploadUrl, analyzeInsectImageAction])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setResult(null)
    setUploadedImageUrl(null)
    setDetectionId(null)
  }, [])

  return {
    isLoading,
    error,
    result,
    uploadedImageUrl,
    analyzeImage,
    reset,
  }
}
