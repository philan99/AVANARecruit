import { useEffect, useRef, useCallback, useState } from "react";
import { useRole } from "@/contexts/role-context";
import { useLocation } from "wouter";

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 60 * 1000;
const HEARTBEAT_MS = 60 * 1000;
const ACTIVITY_PERSIST_MS = 5 * 1000;
const LAST_ACTIVITY_KEY = "avanatalent_last_activity";
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

function readPersistedActivity(): number | null {
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function writePersistedActivity(ts: number) {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(ts));
}

export function useInactivityTimeout() {
  const { role, clearRole, sessionToken, setSessionToken } = useRole();
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPersistRef = useRef<number>(0);
  const tokenRef = useRef<string | null>(sessionToken);

  useEffect(() => {
    tokenRef.current = sessionToken;
  }, [sessionToken]);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    timeoutRef.current = null;
    warningRef.current = null;
    countdownRef.current = null;
    heartbeatRef.current = null;
  }, []);

  const apiBase = "/api";

  const revokeServerSession = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;
    try {
      await fetch(`${apiBase}/sessions/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        keepalive: true,
      });
    } catch {
      // best effort
    }
  }, [apiBase]);

  const doLogout = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    void revokeServerSession();
    setSessionToken(null);
    clearRole();
    setLocation("/");
  }, [clearAllTimers, clearRole, setLocation, revokeServerSession, setSessionToken]);

  const recordActivity = useCallback((force = false) => {
    const now = Date.now();
    if (force || now - lastPersistRef.current >= ACTIVITY_PERSIST_MS) {
      lastPersistRef.current = now;
      writePersistedActivity(now);
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!role) return;

    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(60);
    recordActivity(true);

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(60);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_MS - WARNING_MS);

    timeoutRef.current = setTimeout(() => {
      doLogout();
    }, TIMEOUT_MS);

    heartbeatRef.current = setInterval(() => {
      const token = tokenRef.current;
      if (!token) return;
      fetch(`${apiBase}/sessions/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((res) => {
          if (res.status === 401) {
            doLogout();
          }
        })
        .catch(() => {
          // network blip — don't log out on transient failure
        });
    }, HEARTBEAT_MS);
  }, [role, clearAllTimers, doLogout, recordActivity, apiBase]);

  const stayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!role) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    const persisted = readPersistedActivity();
    if (persisted !== null && Date.now() - persisted > TIMEOUT_MS) {
      doLogout();
      return;
    }

    resetTimer();

    const handleActivity = () => {
      recordActivity();
      if (!showWarning) {
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const persistedNow = readPersistedActivity();
      if (persistedNow !== null && Date.now() - persistedNow > TIMEOUT_MS) {
        doLogout();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [role, showWarning, resetTimer, clearAllTimers, doLogout, recordActivity]);

  return { showWarning, secondsLeft, stayLoggedIn, doLogout };
}
