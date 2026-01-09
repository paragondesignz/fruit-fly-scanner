export enum DangerLevel {
  SAFE = "Safe",
  CAUTION = "Caution",
  DANGEROUS = "Dangerous",
  VENOMOUS = "Venomous"
}

export interface InsectData {
  commonName: string;
  scientificName: string;
  description: string;
  habitat: string;
  dangerLevel: DangerLevel;
  funFacts: string[];
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  data: InsectData | null;
}