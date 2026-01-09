import React from 'react';
import { Bug, Search } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white">
      <div className="flex justify-center items-center mb-4">
        <div className="bg-emerald-100 p-3 rounded-full">
          <Bug className="h-10 w-10 text-emerald-600" />
        </div>
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
        Entomo<span className="text-emerald-600">Lens</span>
      </h1>
      <p className="max-w-2xl mx-auto text-lg text-slate-600">
        Discover the tiny world around you. Upload a photo of any insect, bug, or spider, and our AI entomologist will identify it instantly.
      </p>
    </div>
  );
};