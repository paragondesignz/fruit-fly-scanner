// Species type definitions (mirrors Convex schema)

export interface SpeciesCharacteristics {
  sizeRange: string;
  primaryColor: string;
  keyFeatures: string[];
  distinguishingMarks: string;
}

export interface SpeciesDetection {
  alertThreshold: number;
  matchingCriteria: string[];
  exclusionCriteria: string[];
}

export interface SpeciesBiosecurity {
  threatLevel: "critical" | "high" | "moderate";
  isReportable: boolean;
  recentDetections?: string;
  primaryHosts: string[];
}

export interface SpeciesMpiInfo {
  infoUrl: string;
  reportingPhone: string;
}

export interface SpeciesDisplay {
  iconColor: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Species {
  _id: string;
  _creationTime: number;
  commonName: string;
  scientificName: string;
  abbreviation?: string;
  characteristics: SpeciesCharacteristics;
  detection: SpeciesDetection;
  biosecurity: SpeciesBiosecurity;
  mpiInfo: SpeciesMpiInfo;
  display: SpeciesDisplay;
}

export type SpeciesInput = Omit<Species, "_id" | "_creationTime">;
