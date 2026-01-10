import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";

export function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid token");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base grid-pattern flex items-center justify-center">
        <div className="card-elevated p-8 text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-elevated p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[rgba(251,146,60,0.12)] flex items-center justify-center border border-[rgba(251,146,60,0.2)]">
              <Shield className="w-8 h-8 text-[#fb923c]" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 mb-2">
              Admin Access
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your admin token to access the control panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Admin Token
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 64-character token"
                className="input w-full"
                disabled={isSubmitting}
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner-small" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Scanner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
