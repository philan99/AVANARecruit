import { useEffect, useRef, useCallback, useState } from "react";
import { useRole } from "@/contexts/role-context";
import { useLocation } from "wouter";

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

export function useInactivityTimeout() {
  const { role, clearRole } = useRole();
  const [, setLocation] = useLocation();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timeoutRef.current = null;
    warningRef.current = null;
    countdownRef.current = null;
  }, []);

  const doLogout = useCallback(() => {
    clearAllTimers();
    setShowWarning(false);
    clearRole();
    setLocation("/");
  }, [clearAllTimers, clearRole, setLocation]);

  const resetTimer = useCallback(() => {
    if (!role) return;

    clearAllTimers();
    setShowWarning(false);
    setSecondsLeft(60);

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
  }, [role, clearAllTimers, doLogout]);

  const stayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!role) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    resetTimer();

    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearAllTimers();
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [role, showWarning, resetTimer, clearAllTimers]);

  return { showWarning, secondsLeft, stayLoggedIn, doLogout };
}
