import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Bug,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

export function DashboardPage() {
  const { sessionToken } = useAuth();
  const species = useQuery(api.species.listAll);
  const auditLog = useQuery(api.species.getAuditLog, { limit: 10 });
  const removeMutation = useMutation(api.species.remove);

  const [deleteConfirm, setDeleteConfirm] = useState<Id<"species"> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: Id<"species">) => {
    if (!sessionToken) return;

    setIsDeleting(true);
    try {
      await removeMutation({ sessionToken, id });
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getThreatBadgeClass = (level: string) => {
    switch (level) {
      case "critical":
        return "badge-danger";
      case "high":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  if (species === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">
            Species Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage biosecurity threat species for detection
          </p>
        </div>
        <Link to="/admin/species/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Species
        </Link>
      </div>

      {/* Species List */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-slate-100">
          Target Species ({species.length})
        </h2>

        {species.length === 0 ? (
          <div className="card p-8 text-center">
            <Bug className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 mb-4">No species configured yet</p>
            <Link to="/admin/species/new" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              Add First Species
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {species.map((s) => (
              <div
                key={s._id}
                className="card p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                        s.display.isActive
                          ? "bg-[rgba(251,146,60,0.12)] border-[rgba(251,146,60,0.2)]"
                          : "bg-slate-800 border-slate-700"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-6 h-6 ${
                          s.display.isActive
                            ? "text-[#fb923c]"
                            : "text-slate-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-100">
                          {s.commonName}
                        </h3>
                        <span
                          className={`badge ${getThreatBadgeClass(s.biosecurity.threatLevel)}`}
                        >
                          {s.biosecurity.threatLevel}
                        </span>
                        {!s.display.isActive && (
                          <span className="badge bg-slate-700 text-slate-400">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 italic">
                        {s.scientificName}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {s.characteristics.sizeRange} |{" "}
                        {s.characteristics.primaryColor} |{" "}
                        {s.detection.matchingCriteria.length} detection criteria
                      </p>
                      {s.biosecurity.recentDetections && (
                        <p className="text-xs text-amber-400 mt-1">
                          Recent: {s.biosecurity.recentDetections}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/species/${s._id}`}
                      className="btn-ghost p-2"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(s._id)}
                      className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === s._id && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-300 mb-3">
                      Are you sure you want to delete "{s.commonName}"? This
                      action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(s._id)}
                        disabled={isDeleting}
                        className="btn-danger text-sm"
                      >
                        {isDeleting ? "Deleting..." : "Yes, Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn-ghost text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="space-y-4">
        <h2 className="font-display font-semibold text-slate-100">
          Recent Activity
        </h2>

        {auditLog === undefined ? (
          <div className="card p-4">
            <div className="spinner-small mx-auto" />
          </div>
        ) : auditLog.length === 0 ? (
          <div className="card p-6 text-center text-slate-500">
            No activity recorded yet
          </div>
        ) : (
          <div className="card divide-y divide-slate-800">
            {auditLog.map((log) => (
              <div key={log._id} className="p-4 flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    log.action === "create"
                      ? "bg-green-500/10 text-green-400"
                      : log.action === "update"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {log.action === "create" ? (
                    <Plus className="w-4 h-4" />
                  ) : log.action === "update" ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">
                    <span className="capitalize">{log.action}</span>:{" "}
                    {log.speciesName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
