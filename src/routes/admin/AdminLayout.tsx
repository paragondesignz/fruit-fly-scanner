import { useEffect, type ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Bug, Home } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base grid-pattern">
      {/* Admin Header */}
      <header className="bg-[#0f1629] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/qfly-scanner.svg"
                  alt=""
                  className="w-8 h-8"
                  aria-hidden="true"
                />
                <span className="font-display text-lg font-bold text-slate-100">
                  Admin Panel
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/admin/dashboard"
                  className="btn-ghost text-sm"
                >
                  <Bug className="w-4 h-4" />
                  Species
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/" className="btn-ghost text-sm">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Scanner</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">{children}</main>
    </div>
  );
}
