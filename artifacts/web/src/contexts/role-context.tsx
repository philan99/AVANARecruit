import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "company" | "candidate" | "admin";

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  candidateProfileId: number | null;
  setCandidateProfileId: (id: number | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_KEY = "avanatalent_role";
const CANDIDATE_ID_KEY = "avanatalent_candidate_id";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem(ROLE_KEY);
    return stored === "company" || stored === "candidate" || stored === "admin" ? stored : null;
  });

  const [candidateProfileId, setCandidateProfileIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(CANDIDATE_ID_KEY);
    return stored ? parseInt(stored, 10) : null;
  });

  const setRole = useCallback((newRole: UserRole) => {
    localStorage.setItem(ROLE_KEY, newRole);
    setRoleState(newRole);
  }, []);

  const clearRole = useCallback(() => {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(CANDIDATE_ID_KEY);
    setRoleState(null);
    setCandidateProfileIdState(null);
  }, []);

  const setCandidateProfileId = useCallback((id: number | null) => {
    if (id !== null) {
      localStorage.setItem(CANDIDATE_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(CANDIDATE_ID_KEY);
    }
    setCandidateProfileIdState(id);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, candidateProfileId, setCandidateProfileId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
