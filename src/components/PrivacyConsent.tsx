import { useState, useEffect } from 'react'
import { Shield, X } from 'lucide-react'

interface PrivacyConsentProps {
  onConsent: (consent: { privacy: boolean; location: boolean }) => void
}

export function PrivacyConsent({ onConsent }: PrivacyConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [locationConsent, setLocationConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('qfly-privacy-consent')
    if (!consent) {
      setIsVisible(true)
    } else {
      const parsed = JSON.parse(consent)
      onConsent(parsed)
    }
  }, [onConsent])

  const handleAccept = () => {
    const consent = { privacy: true, location: locationConsent }
    localStorage.setItem('qfly-privacy-consent', JSON.stringify(consent))
    onConsent(consent)
    setIsVisible(false)
  }

  const handleDecline = () => {
    const consent = { privacy: false, location: false }
    localStorage.setItem('qfly-privacy-consent', JSON.stringify(consent))
    onConsent(consent)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-50">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-100 rounded-full shrink-0">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">
              Privacy & Data Collection
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              This app sends images to AI for analysis. Images are stored temporarily to help improve Q-fly detection in New Zealand.
            </p>

            <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={locationConsent}
                onChange={(e) => setLocationConsent(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-slate-700">
                Share my location to help track Q-fly spread (optional, rounded to ~100m)
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Accept & Continue
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors"
              >
                Decline
              </button>
            </div>
          </div>

          <button
            onClick={handleDecline}
            className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
