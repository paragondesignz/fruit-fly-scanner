import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../context/AuthContext";
import {
  Save,
  ArrowLeft,
  Plus,
  X,
  AlertTriangle,
  Code,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface FormData {
  commonName: string;
  scientificName: string;
  abbreviation: string;
  characteristics: {
    sizeRange: string;
    primaryColor: string;
    keyFeatures: string[];
    distinguishingMarks: string;
  };
  detection: {
    alertThreshold: number;
    matchingCriteria: string[];
    exclusionCriteria: string[];
  };
  biosecurity: {
    threatLevel: "critical" | "high" | "moderate";
    isReportable: boolean;
    recentDetections: string;
    primaryHosts: string[];
  };
  mpiInfo: {
    infoUrl: string;
    reportingPhone: string;
  };
  display: {
    iconColor: string;
    sortOrder: number;
    isActive: boolean;
  };
}

const defaultFormData: FormData = {
  commonName: "",
  scientificName: "",
  abbreviation: "",
  characteristics: {
    sizeRange: "",
    primaryColor: "",
    keyFeatures: [],
    distinguishingMarks: "",
  },
  detection: {
    alertThreshold: 2,
    matchingCriteria: [],
    exclusionCriteria: [],
  },
  biosecurity: {
    threatLevel: "high",
    isReportable: true,
    recentDetections: "",
    primaryHosts: [],
  },
  mpiInfo: {
    infoUrl: "",
    reportingPhone: "0800 80 99 66",
  },
  display: {
    iconColor: "orange-500",
    sortOrder: 1,
    isActive: true,
  },
};

export function SpeciesFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessionToken } = useAuth();

  const isEditMode = !!id;
  const existingSpecies = useQuery(
    api.species.get,
    isEditMode ? { id: id as Id<"species"> } : "skip"
  );

  const createMutation = useMutation(api.species.create);
  const updateMutation = useMutation(api.species.update);

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Populate form with existing data
  useEffect(() => {
    if (existingSpecies) {
      setFormData({
        commonName: existingSpecies.commonName,
        scientificName: existingSpecies.scientificName,
        abbreviation: existingSpecies.abbreviation || "",
        characteristics: existingSpecies.characteristics,
        detection: existingSpecies.detection,
        biosecurity: {
          ...existingSpecies.biosecurity,
          recentDetections: existingSpecies.biosecurity.recentDetections || "",
        },
        mpiInfo: existingSpecies.mpiInfo,
        display: existingSpecies.display,
      });
    }
  }, [existingSpecies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToken) return;

    setError(null);
    setIsSaving(true);

    try {
      const speciesData = {
        ...formData,
        abbreviation: formData.abbreviation || undefined,
        biosecurity: {
          ...formData.biosecurity,
          recentDetections: formData.biosecurity.recentDetections || undefined,
        },
      };

      if (isEditMode) {
        await updateMutation({
          sessionToken,
          id: id as Id<"species">,
          species: speciesData,
        });
      } else {
        await createMutation({
          sessionToken,
          species: speciesData,
        });
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (
    field: "keyFeatures" | "matchingCriteria" | "exclusionCriteria" | "primaryHosts"
  ) => {
    const value = prompt(`Enter new ${field.replace(/([A-Z])/g, " $1").toLowerCase()}:`);
    if (!value) return;

    if (field === "keyFeatures") {
      setFormData((prev) => ({
        ...prev,
        characteristics: {
          ...prev.characteristics,
          keyFeatures: [...prev.characteristics.keyFeatures, value],
        },
      }));
    } else if (field === "matchingCriteria" || field === "exclusionCriteria") {
      setFormData((prev) => ({
        ...prev,
        detection: {
          ...prev.detection,
          [field]: [...prev.detection[field], value],
        },
      }));
    } else if (field === "primaryHosts") {
      setFormData((prev) => ({
        ...prev,
        biosecurity: {
          ...prev.biosecurity,
          primaryHosts: [...prev.biosecurity.primaryHosts, value],
        },
      }));
    }
  };

  const removeArrayItem = (
    field: "keyFeatures" | "matchingCriteria" | "exclusionCriteria" | "primaryHosts",
    index: number
  ) => {
    if (field === "keyFeatures") {
      setFormData((prev) => ({
        ...prev,
        characteristics: {
          ...prev.characteristics,
          keyFeatures: prev.characteristics.keyFeatures.filter((_, i) => i !== index),
        },
      }));
    } else if (field === "matchingCriteria" || field === "exclusionCriteria") {
      setFormData((prev) => ({
        ...prev,
        detection: {
          ...prev.detection,
          [field]: prev.detection[field].filter((_, i) => i !== index),
        },
      }));
    } else if (field === "primaryHosts") {
      setFormData((prev) => ({
        ...prev,
        biosecurity: {
          ...prev.biosecurity,
          primaryHosts: prev.biosecurity.primaryHosts.filter((_, i) => i !== index),
        },
      }));
    }
  };

  if (isEditMode && existingSpecies === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="btn-ghost p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">
            {isEditMode ? "Edit Species" : "Add New Species"}
          </h1>
          <p className="text-slate-400 mt-1">
            Configure detection criteria and biosecurity information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#fb923c]" />
            Basic Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Common Name *
              </label>
              <input
                type="text"
                value={formData.commonName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, commonName: e.target.value }))
                }
                className="input w-full"
                required
                placeholder="e.g., Queensland Fruit Fly"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Scientific Name *
              </label>
              <input
                type="text"
                value={formData.scientificName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scientificName: e.target.value,
                  }))
                }
                className="input w-full"
                required
                placeholder="e.g., Bactrocera tryoni"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Abbreviation
              </label>
              <input
                type="text"
                value={formData.abbreviation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, abbreviation: e.target.value }))
                }
                className="input w-full"
                placeholder="e.g., QFly"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Threat Level *
              </label>
              <select
                value={formData.biosecurity.threatLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    biosecurity: {
                      ...prev.biosecurity,
                      threatLevel: e.target.value as "critical" | "high" | "moderate",
                    },
                  }))
                }
                className="input w-full"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
              </select>
            </div>
          </div>
        </section>

        {/* Characteristics */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-100">
            Physical Characteristics
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Size Range *
              </label>
              <input
                type="text"
                value={formData.characteristics.sizeRange}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    characteristics: {
                      ...prev.characteristics,
                      sizeRange: e.target.value,
                    },
                  }))
                }
                className="input w-full"
                required
                placeholder="e.g., ~7mm or 6-8mm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Primary Color *
              </label>
              <input
                type="text"
                value={formData.characteristics.primaryColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    characteristics: {
                      ...prev.characteristics,
                      primaryColor: e.target.value,
                    },
                  }))
                }
                className="input w-full"
                required
                placeholder="e.g., reddish-brown"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Distinguishing Marks
            </label>
            <input
              type="text"
              value={formData.characteristics.distinguishingMarks}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  characteristics: {
                    ...prev.characteristics,
                    distinguishingMarks: e.target.value,
                  },
                }))
              }
              className="input w-full"
              placeholder="e.g., Yellow scutellum - KEY FEATURE"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Key Features
              </label>
              <button
                type="button"
                onClick={() => addArrayItem("keyFeatures")}
                className="btn-ghost text-xs"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.characteristics.keyFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
                    {feature}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("keyFeatures", index)}
                    className="btn-ghost p-1 text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.characteristics.keyFeatures.length === 0 && (
                <p className="text-sm text-slate-500 italic">
                  No key features added yet
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Detection Criteria */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-100">
            Detection Criteria
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Alert Threshold
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Number of matching criteria required to trigger an ALERT
            </p>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.detection.alertThreshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  detection: {
                    ...prev.detection,
                    alertThreshold: parseInt(e.target.value) || 2,
                  },
                }))
              }
              className="input w-24"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Matching Criteria (used in AI prompt)
              </label>
              <button
                type="button"
                onClick={() => addArrayItem("matchingCriteria")}
                className="btn-ghost text-xs"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.detection.matchingCriteria.map((criteria, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
                    {criteria}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("matchingCriteria", index)}
                    className="btn-ghost p-1 text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.detection.matchingCriteria.length === 0 && (
                <p className="text-sm text-slate-500 italic">
                  No matching criteria added yet
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Exclusion Criteria
              </label>
              <button
                type="button"
                onClick={() => addArrayItem("exclusionCriteria")}
                className="btn-ghost text-xs"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.detection.exclusionCriteria.map((criteria, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2">
                    {criteria}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem("exclusionCriteria", index)}
                    className="btn-ghost p-1 text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.detection.exclusionCriteria.length === 0 && (
                <p className="text-sm text-slate-500 italic">
                  No exclusion criteria added yet
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Biosecurity Info */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-100">
            Biosecurity Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Recent Detections
              </label>
              <input
                type="text"
                value={formData.biosecurity.recentDetections}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    biosecurity: {
                      ...prev.biosecurity,
                      recentDetections: e.target.value,
                    },
                  }))
                }
                className="input w-full"
                placeholder="e.g., Mt Roskill, Auckland"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isReportable"
                checked={formData.biosecurity.isReportable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    biosecurity: {
                      ...prev.biosecurity,
                      isReportable: e.target.checked,
                    },
                  }))
                }
                className="w-4 h-4"
              />
              <label htmlFor="isReportable" className="text-sm text-slate-300">
                Reportable to MPI
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Primary Hosts
              </label>
              <button
                type="button"
                onClick={() => addArrayItem("primaryHosts")}
                className="btn-ghost text-xs"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.biosecurity.primaryHosts.map((host, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-sm bg-slate-800 rounded-full px-3 py-1"
                >
                  {host}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("primaryHosts", index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.biosecurity.primaryHosts.length === 0 && (
                <p className="text-sm text-slate-500 italic">
                  No hosts added yet
                </p>
              )}
            </div>
          </div>
        </section>

        {/* MPI Info */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-100">
            MPI Information
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                MPI Info URL
              </label>
              <input
                type="url"
                value={formData.mpiInfo.infoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mpiInfo: { ...prev.mpiInfo, infoUrl: e.target.value },
                  }))
                }
                className="input w-full"
                placeholder="https://www.mpi.govt.nz/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Reporting Phone
              </label>
              <input
                type="tel"
                value={formData.mpiInfo.reportingPhone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mpiInfo: { ...prev.mpiInfo, reportingPhone: e.target.value },
                  }))
                }
                className="input w-full"
                placeholder="0800 80 99 66"
              />
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-slate-100">
            Display Settings
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.display.sortOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display: {
                      ...prev.display,
                      sortOrder: parseInt(e.target.value) || 1,
                    },
                  }))
                }
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Icon Color
              </label>
              <select
                value={formData.display.iconColor}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display: { ...prev.display, iconColor: e.target.value },
                  }))
                }
                className="input w-full"
              >
                <option value="red-500">Red</option>
                <option value="orange-500">Orange</option>
                <option value="amber-500">Amber</option>
                <option value="yellow-500">Yellow</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.display.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display: { ...prev.display, isActive: e.target.checked },
                  }))
                }
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                Active in Scanner
              </label>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPromptPreview(!showPromptPreview)}
            className="btn-ghost"
          >
            <Code className="w-4 h-4" />
            {showPromptPreview ? "Hide" : "Show"} Prompt Preview
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-primary">
              {isSaving ? (
                <>
                  <div className="spinner-small" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Save Changes" : "Create Species"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Preview */}
        {showPromptPreview && (
          <section className="card p-6">
            <h3 className="font-display font-semibold text-slate-100 mb-4">
              Generated Prompt Section
            </h3>
            <pre className="text-xs text-slate-400 bg-slate-900 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">
              {`=== SPECIES: ${formData.commonName.toUpperCase()} (${formData.scientificName}) ===
KEY FEATURES (any ${formData.detection.alertThreshold}+ = ALERT):
${formData.detection.matchingCriteria.map((c) => `- ${c}`).join("\n")}
${formData.biosecurity.recentDetections ? `RECENT DETECTION: ${formData.biosecurity.recentDetections}` : ""}`}
            </pre>
          </section>
        )}
      </form>
    </div>
  );
}
