import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const LOGIN_TIME_KEY = "finmo_login_time";
const GUARD_EPOCH = "2026-04-10T00:00:00Z";

interface AuthContextType {
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ logout: async () => {} });
export const useAuth = () => useContext(AuthContext);

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  const logout = useCallback(async () => {
    localStorage.removeItem(LOGIN_TIME_KEY);
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus("denied");
        return;
      }

      const email = session.user.email ?? "";
      if (!email.endsWith("@finmo.net")) {
        await supabase.auth.signOut();
        setStatus("denied");
        return;
      }

      // Invalidate sessions created before guard epoch
      const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
      if (!loginTime || new Date(loginTime) < new Date(GUARD_EPOCH)) {
        await logout();
        return;
      }

      // Check timeout
      if (Date.now() - new Date(loginTime).getTime() > SESSION_TIMEOUT_MS) {
        await logout();
        return;
      }

      setStatus("ok");
    };

    check();

    const interval = setInterval(() => {
      const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
      if (loginTime && Date.now() - new Date(loginTime).getTime() > SESSION_TIMEOUT_MS) {
        logout();
      }
    }, 60_000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setStatus("denied");
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [logout]);

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen text-lg">Loading…</div>;
  }

  if (status === "denied") {
    window.location.href = "/login";
    return null;
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}
