import { useCook } from "@/state/store";
import { syncAcquisition, useAcquisition } from "../acquisition";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { Session } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { supabase } from "./client";
const AuthContext = createContext<{ session: Session | null; ready: boolean }>({
  session: null,
  ready: false,
});
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setSession(data.session);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setReady(true);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase?.auth.startAutoRefresh();
      else supabase?.auth.stopAutoRefresh();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    useCook.getState().finishOnboarding();
    const sync = () => {
      void syncAcquisition(session.user.id).catch(() => {});
    };
    sync();
    const unsubscribe = useAcquisition.subscribe(sync);
    const foreground = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    const retry = setInterval(sync, 60_000);
    return () => {
      unsubscribe();
      foreground.remove();
      clearInterval(retry);
    };
  }, [session]);
  return (
    <AuthContext.Provider value={{ session, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
