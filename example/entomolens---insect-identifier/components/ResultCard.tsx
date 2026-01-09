import React from 'react';
import { InsectData, DangerLevel } from '../types';
import { ShieldCheck, ShieldAlert, Skull, AlertTriangle, MapPin, Sparkles, BookOpen } from 'lucide-react';

interface ResultCardProps {
  data: InsectData;
}

const DangerBadge: React.FC<{ level: DangerLevel }> = ({ level }) => {
  const getColors = () => {
    switch (level) {
      case DangerLevel.SAFE:
        return 'bg-green-100 text-green-700 border-green-200';
      case DangerLevel.CAUTION:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case DangerLevel.DANGEROUS:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case DangerLevel.VENOMOUS:
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getIcon = () => {
    switch (level) {
      case DangerLevel.SAFE:
        return <ShieldCheck className="w-4 h-4 mr-1" />;
      case DangerLevel.CAUTION:
        return <AlertTriangle className="w-4 h-4 mr-1" />;
      case DangerLevel.DANGEROUS:
        return <Skull className="w-4 h-4 mr-1" />;
      case DangerLevel.VENOMOUS:
        return <ShieldAlert className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColors()}`}>
      {getIcon()}
      {level}
    </span>
  );
};

export const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in-up">
      <div className="bg-emerald-600 px-6 py-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{data.commonName}</h2>
            <p className="text-emerald-100 italic font-medium">{data.scientificName}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg">
             <DangerBadge level={data.dangerLevel} />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        
        <div className="space-y-3">
          <div className="flex items-center text-slate-900 font-semibold text-lg">
            <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
            Description
          </div>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {data.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center text-slate-900 font-semibold text-lg">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Habitat
            </div>
            <p className="text-slate-600 text-sm">
              {data.habitat}
            </p>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center text-slate-900 font-semibold text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
              Fun Facts
            </div>
            <ul className="space-y-2">
              {data.funFacts.map((fact, index) => (
                <li key={index} className="flex items-start text-sm text-slate-600">
                  <span className="mr-2 text-emerald-400">•</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};