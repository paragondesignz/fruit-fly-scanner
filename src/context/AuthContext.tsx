import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "admin_session_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  // Verify session on mount
  const sessionVerification = useQuery(
    api.auth.verifySession,
    sessionToken ? { sessionToken } : "skip"
  );

  useEffect(() => {
    if (sessionToken && sessionVerification !== undefined) {
      if (!sessionVerification.valid) {
        // Session expired or invalid
        localStorage.removeItem(SESSION_KEY);
        setSessionToken(null);
      }
      setIsLoading(false);
    } else if (!sessionToken) {
      setIsLoading(false);
    }
  }, [sessionToken, sessionVerification]);

  const login = useCallback(
    async (token: string) => {
      try {
        const result = await loginMutation({ token });
        localStorage.setItem(SESSION_KEY, result.sessionToken);
        setSessionToken(result.sessionToken);
      } catch (error) {
        throw error;
      }
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await logoutMutation({ sessionToken });
      } catch {
        // Ignore errors during logout
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSessionToken(null);
  }, [sessionToken, logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!sessionToken && !isLoading,
        isLoading,
        sessionToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
