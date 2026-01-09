import { AlertTriangle, CheckCircle, HelpCircle, Phone, ExternalLink, Info, Camera, Bug } from 'lucide-react'

interface AnalysisData {
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

interface ResultCardProps {
  data: AnalysisData
  imageUrl?: string | null
  onScanAnother: () => void
  onReportThreat: () => void
}

// MPI info links for specific species
const getMpiInfoLink = (speciesName: string): string | null => {
  const name = speciesName.toLowerCase()
  if (name.includes('queensland') || name.includes('bactrocera tryoni')) {
    return 'https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/queensland-fruit-fly'
  }
  if (name.includes('oriental') || name.includes('bactrocera dorsalis')) {
    return 'https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/oriental-fruit-fly'
  }
  if (name.includes('spotted') || name.includes('drosophila suzukii') || name.includes('swd')) {
    return 'https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/spotted-wing-drosophila'
  }
  return null
}

export function ResultCard({ data, imageUrl, onScanAnother, onReportThreat }: ResultCardProps) {
  const isAlert = data.qflyLikelihood === 'ALERT'
  const isUncertain = data.qflyLikelihood === 'UNCERTAIN'
  const shouldShowMpiWarning = isAlert || isUncertain
  const confidencePercentage = Math.round(data.confidence * 100)
  const displayName = data.commonName || data.species

  const getVerdictConfig = () => {
    switch (data.qflyLikelihood) {
      case 'ALERT':
        return {
          bgClass: 'bg-[#ef4444]',
          borderClass: 'border-[#ef4444]',
          iconBgClass: 'bg-white/20',
          textClass: 'text-white',
          badgeClass: 'badge-danger badge-danger-pulse',
          Icon: AlertTriangle,
          title: 'POSITIVE ID',
          subtitle: 'Possible Threat Species — Report Immediately'
        }
      case 'UNLIKELY':
        return {
          bgClass: 'bg-[rgba(34,197,94,0.05)]',
          borderClass: 'border-[rgba(34,197,94,0.2)]',
          iconBgClass: 'bg-[rgba(34,197,94,0.1)]',
          textClass: 'text-[#4ade80]',
          badgeClass: 'badge-safe',
          Icon: CheckCircle,
          title: 'NEGATIVE',
          subtitle: 'Not a biosecurity threat species'
        }
      case 'UNCERTAIN':
      default:
        return {
          bgClass: 'bg-[rgba(245,158,11,0.05)]',
          borderClass: 'border-[rgba(245,158,11,0.2)]',
          iconBgClass: 'bg-[rgba(245,158,11,0.1)]',
          textClass: 'text-[#fbbf24]',
          badgeClass: 'badge-warning',
          Icon: HelpCircle,
          title: 'UNCERTAIN',
          subtitle: 'Unable to confirm — exercise caution'
        }
    }
  }

  const getConfidenceConfig = () => {
    if (data.confidence >= 0.8) return { color: 'safe', label: 'High' }
    if (data.confidence >= 0.5) return { color: 'warning', label: 'Medium' }
    return { color: 'danger', label: 'Low' }
  }

  const config = getVerdictConfig()
  const confidenceConfig = getConfidenceConfig()
  const { Icon } = config
  const mpiInfoLink = getMpiInfoLink(displayName)

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in-up">
      {/* Main Result Card */}
      <div className={`card-elevated border ${config.borderClass} overflow-hidden`} role="region" aria-labelledby="result-title">
        {/* Header */}
        <div className={`relative ${config.bgClass} p-6 lg:p-8`}>
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`w-14 h-14 lg:w-16 lg:h-16 ${config.iconBgClass} rounded-xl flex items-center justify-center flex-shrink-0 border ${isAlert ? 'border-white/30' : 'border-slate-700'}`}>
              <Icon className={`w-7 h-7 lg:w-8 lg:h-8 ${config.textClass}`} aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={`inline-block ${config.badgeClass} mb-2`}>
                {config.title}
              </div>
              <h2 id="result-title" className={`font-display text-xl lg:text-2xl font-bold mb-1 truncate ${isAlert ? 'text-white' : 'text-slate-100'}`}>
                {displayName}
              </h2>
              {data.scientificName && (
                <p className={`text-sm italic mb-1 ${isAlert ? 'text-white/80' : 'text-slate-400'}`}>{data.scientificName}</p>
              )}
              <p className={`text-sm ${config.textClass}`}>{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="p-6 lg:p-8 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400 font-medium">Confidence Level</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${
                confidenceConfig.color === 'safe' ? 'bg-[rgba(34,197,94,0.1)] text-[#4ade80]' :
                confidenceConfig.color === 'warning' ? 'bg-[rgba(245,158,11,0.1)] text-[#fbbf24]' :
                'bg-[rgba(239,68,68,0.1)] text-[#f87171]'
              }`}>
                {confidenceConfig.label}
              </span>
              <span className={`font-display text-xl font-bold ${
                confidenceConfig.color === 'safe' ? 'text-[#4ade80]' :
                confidenceConfig.color === 'warning' ? 'text-[#fbbf24]' :
                'text-[#f87171]'
              }`}>
                {confidencePercentage}%
              </span>
            </div>
          </div>
          <div className="confidence-track">
            <div
              className={`confidence-fill ${
                confidenceConfig.color === 'safe' ? 'confidence-fill-safe' :
                confidenceConfig.color === 'danger' ? 'confidence-fill-danger' :
                'confidence-fill-warning'
              }`}
              style={{ width: `${confidencePercentage}%` }}
              role="progressbar"
              aria-valuenow={confidencePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Confidence: ${confidencePercentage}%`}
            />
          </div>
        </div>

        {/* Uploaded Photo */}
        {imageUrl && (
          <div className="p-6 lg:p-8 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 mb-4 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#fb923c]" aria-hidden="true" />
              Your Photo
            </h3>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Your uploaded photo for analysis"
                className="max-w-full max-h-56 object-contain rounded-lg border border-slate-700"
              />
            </div>
          </div>
        )}

        {/* Analysis */}
        <div className="p-6 lg:p-8 border-b border-slate-800">
          <h3 className="font-semibold text-slate-200 mb-3 text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-[#fb923c]" aria-hidden="true" />
            Analysis Details
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">{data.reasoning}</p>
        </div>

        {/* Feature Analysis */}
        {(data.matchingFeatures.length > 0 || data.excludingFeatures.length > 0) && (
          <div className="p-6 lg:p-8 border-b border-slate-800">
            <h3 className="font-semibold text-slate-200 mb-4 text-sm">
              Feature Analysis
            </h3>

            {data.matchingFeatures.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#f87171] font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" aria-hidden="true" />
                  Matching Threat Features
                </p>
                <div className="flex flex-wrap gap-2" role="list">
                  {data.matchingFeatures.map((feature, index) => (
                    <span key={index} className="feature-tag feature-tag-matching" role="listitem">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.excludingFeatures.length > 0 && (
              <div>
                <p className="text-xs text-[#4ade80] font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" aria-hidden="true" />
                  Features Ruling Out Threat
                </p>
                <div className="flex flex-wrap gap-2" role="list">
                  {data.excludingFeatures.map((feature, index) => (
                    <span key={index} className="feature-tag feature-tag-excluding" role="listitem">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reporting Section (for ALERT or UNCERTAIN) */}
      {shouldShowMpiWarning && (
        <div className={`card-elevated p-6 lg:p-8 border ${isAlert ? 'border-[rgba(239,68,68,0.3)]' : 'border-[rgba(245,158,11,0.2)]'}`} role="alert">
          <h3 className={`font-semibold mb-4 text-sm flex items-center gap-2 ${isAlert ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            {isAlert ? 'Report This Sighting' : 'When in Doubt, Report'}
          </h3>
          <p className={`text-sm mb-4 ${isAlert ? 'text-[#fca5a5]' : 'text-[#fcd34d]'}`}>
            {data.reportingAdvice || 'If you suspect you have found a biosecurity threat species, please report it to MPI immediately. Do not attempt to kill the insect — capture it if possible for identification.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={onReportThreat}
              className="btn-danger w-full"
            >
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              <span className="font-semibold">Report to MPI</span>
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </button>

            <a
              href="tel:0800809966"
              className="btn-secondary w-full"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call: 0800 80 99 66
            </a>

            {mpiInfoLink && (
              <a
                href={mpiInfoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full justify-center"
              >
                <Bug className="w-4 h-4" aria-hidden="true" />
                MPI Species Info
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Species Info Link for non-threats */}
      {!shouldShowMpiWarning && mpiInfoLink && (
        <div className="card-elevated p-5">
          <a
            href={mpiInfoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-slate-300 hover:text-[#fb923c] transition-colors"
          >
            <Bug className="w-5 h-5 text-[#fb923c]" aria-hidden="true" />
            <span className="text-sm font-medium">Learn more about this species on MPI</span>
            <ExternalLink className="w-4 h-4 ml-auto" aria-hidden="true" />
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onScanAnother}
          className={`w-full ${shouldShowMpiWarning ? 'btn-secondary' : 'btn-primary'}`}
        >
          <Camera className="w-5 h-5" aria-hidden="true" />
          <span className="font-semibold">Scan Another</span>
        </button>
      </div>

      {/* Timestamp */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-600">
          Analysis completed {new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}
