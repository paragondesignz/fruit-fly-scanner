import { ThreatBadge } from './ThreatBadge'
import { Phone, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react'

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
}

export function ResultCard({ data }: ResultCardProps) {
  const isAlert = data.qflyLikelihood === 'ALERT'
  const isUncertain = data.qflyLikelihood === 'UNCERTAIN'

  return (
    <div className="w-full max-w-2xl animate-fade-in-up">
      {/* Alert Banner for potential threat species */}
      {isAlert && (
        <div className="bg-red-600 text-white rounded-t-2xl p-4 text-center">
          <p className="font-bold text-lg">POTENTIAL THREAT DETECTED</p>
          <p className="text-sm text-red-100">Please report this sighting to MPI immediately</p>
        </div>
      )}

      <div className={`bg-white rounded-b-2xl ${!isAlert ? 'rounded-t-2xl' : ''} shadow-xl border border-slate-200 overflow-hidden`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {data.commonName || data.species}
              </h3>
              {data.scientificName && (
                <p className="text-slate-500 italic">{data.scientificName}</p>
              )}
            </div>
            <ThreatBadge level={data.qflyLikelihood} />
          </div>

          {/* Confidence */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Confidence</span>
              <span>{Math.round(data.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${data.confidence * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="p-6 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Analysis
          </h4>
          <p className="text-slate-600">{data.reasoning}</p>
        </div>

        {/* Features */}
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Matching Features */}
            {data.matchingFeatures && data.matchingFeatures.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Matching Threat Features
                </h4>
                <ul className="space-y-1">
                  {data.matchingFeatures.map((feature, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Excluding Features */}
            {data.excludingFeatures && data.excludingFeatures.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Features Ruling Out Threat
                </h4>
                <ul className="space-y-1">
                  {data.excludingFeatures.map((feature, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reporting Section (for ALERT or UNCERTAIN) */}
        {(isAlert || isUncertain) && (
          <div className={`p-6 ${isAlert ? 'bg-red-50' : 'bg-amber-50'}`}>
            <h4 className="font-semibold text-slate-900 mb-3">
              {isAlert ? 'Report This Sighting' : 'When in Doubt, Report'}
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              {data.reportingAdvice || 'If you suspect you have found a Queensland fruit fly, please report it to MPI immediately. Do not attempt to kill the insect - capture it if possible for identification.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:0800809966"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call MPI: 0800 80 99 66
              </a>
              <a
                href="https://www.mpi.govt.nz/biosecurity/pest-and-disease-threats-to-new-zealand/horticultural-pest-and-disease-threats-to-new-zealand/queensland-fruit-fly"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                MPI Info
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
