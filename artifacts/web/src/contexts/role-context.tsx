import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type UserRole = "company" | "candidate" | "admin";

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  candidateProfileId: number | null;
  setCandidateProfileId: (id: number | null) => void;
  companyProfileId: number | null;
  setCompanyProfileId: (id: number | null) => void;
  companyUserId: number | null;
  setCompanyUserId: (id: number | null) => void;
  companyUserRole: string | null;
  setCompanyUserRole: (role: string | null) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  isImpersonating: boolean;
  impersonateCandidate: (candidateId: number, candidateEmail: string) => void;
  impersonateCompany: (companyId: number, companyEmail: string) => void;
  exitImpersonation: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_KEY = "avanatalent_role";
const CANDIDATE_ID_KEY = "avanatalent_candidate_id";
const COMPANY_ID_KEY = "avanatalent_company_id";
const COMPANY_USER_ID_KEY = "avanatalent_company_user_id";
const COMPANY_USER_ROLE_KEY = "avanatalent_company_user_role";
const EMAIL_KEY = "avanatalent_email";
const IMPERSONATION_KEY = "avanatalent_impersonation";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem(ROLE_KEY);
    return stored === "company" || stored === "candidate" || stored === "admin" ? stored : null;
  });

  const [candidateProfileId, setCandidateProfileIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(CANDIDATE_ID_KEY);
    return stored ? parseInt(stored, 10) : null;
  });

  const [companyProfileId, setCompanyProfileIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(COMPANY_ID_KEY);
    return stored ? parseInt(stored, 10) : null;
  });

  const [companyUserId, setCompanyUserIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(COMPANY_USER_ID_KEY);
    return stored ? parseInt(stored, 10) : null;
  });

  const [companyUserRole, setCompanyUserRoleState] = useState<string | null>(() => {
    return localStorage.getItem(COMPANY_USER_ROLE_KEY);
  });

  const [userEmail, setUserEmailState] = useState<string | null>(() => {
    return localStorage.getItem(EMAIL_KEY);
  });

  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    return localStorage.getItem(IMPERSONATION_KEY) !== null;
  });

  const setRole = useCallback((newRole: UserRole) => {
    localStorage.setItem(ROLE_KEY, newRole);
    setRoleState(newRole);
  }, []);

  const clearRole = useCallback(() => {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(CANDIDATE_ID_KEY);
    localStorage.removeItem(COMPANY_ID_KEY);
    localStorage.removeItem(COMPANY_USER_ID_KEY);
    localStorage.removeItem(COMPANY_USER_ROLE_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setRoleState(null);
    setCandidateProfileIdState(null);
    setCompanyProfileIdState(null);
    setCompanyUserIdState(null);
    setCompanyUserRoleState(null);
    setUserEmailState(null);
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
    window.history.replaceState(null, "", baseUrl);
  }, []);

  const setCandidateProfileId = useCallback((id: number | null) => {
    if (id !== null) {
      localStorage.setItem(CANDIDATE_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(CANDIDATE_ID_KEY);
    }
    setCandidateProfileIdState(id);
  }, []);

  const setCompanyProfileId = useCallback((id: number | null) => {
    if (id !== null) {
      localStorage.setItem(COMPANY_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(COMPANY_ID_KEY);
    }
    setCompanyProfileIdState(id);
  }, []);

  const setCompanyUserId = useCallback((id: number | null) => {
    if (id !== null) {
      localStorage.setItem(COMPANY_USER_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(COMPANY_USER_ID_KEY);
    }
    setCompanyUserIdState(id);
  }, []);

  const setCompanyUserRole = useCallback((role: string | null) => {
    if (role) {
      localStorage.setItem(COMPANY_USER_ROLE_KEY, role);
    } else {
      localStorage.removeItem(COMPANY_USER_ROLE_KEY);
    }
    setCompanyUserRoleState(role);
  }, []);

  const setUserEmail = useCallback((email: string | null) => {
    if (email) {
      localStorage.setItem(EMAIL_KEY, email);
    } else {
      localStorage.removeItem(EMAIL_KEY);
    }
    setUserEmailState(email);
  }, []);

  const impersonateCandidate = useCallback((candidateId: number, candidateEmail: string) => {
    const adminState = {
      role: localStorage.getItem(ROLE_KEY),
      email: localStorage.getItem(EMAIL_KEY),
      candidateId: localStorage.getItem(CANDIDATE_ID_KEY),
      companyId: localStorage.getItem(COMPANY_ID_KEY),
      companyUserId: localStorage.getItem(COMPANY_USER_ID_KEY),
      companyUserRole: localStorage.getItem(COMPANY_USER_ROLE_KEY),
    };
    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(adminState));

    localStorage.setItem(ROLE_KEY, "candidate");
    localStorage.setItem(CANDIDATE_ID_KEY, candidateId.toString());
    localStorage.setItem(EMAIL_KEY, candidateEmail);
    localStorage.removeItem(COMPANY_ID_KEY);
    localStorage.removeItem(COMPANY_USER_ID_KEY);
    localStorage.removeItem(COMPANY_USER_ROLE_KEY);

    setRoleState("candidate");
    setCandidateProfileIdState(candidateId);
    setUserEmailState(candidateEmail);
    setCompanyProfileIdState(null);
    setCompanyUserIdState(null);
    setCompanyUserRoleState(null);
    setIsImpersonating(true);
  }, []);

  const impersonateCompany = useCallback((companyId: number, companyEmail: string) => {
    const adminState = {
      role: localStorage.getItem(ROLE_KEY),
      email: localStorage.getItem(EMAIL_KEY),
      candidateId: localStorage.getItem(CANDIDATE_ID_KEY),
      companyId: localStorage.getItem(COMPANY_ID_KEY),
      companyUserId: localStorage.getItem(COMPANY_USER_ID_KEY),
      companyUserRole: localStorage.getItem(COMPANY_USER_ROLE_KEY),
    };
    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(adminState));

    localStorage.setItem(ROLE_KEY, "company");
    localStorage.setItem(COMPANY_ID_KEY, companyId.toString());
    localStorage.setItem(EMAIL_KEY, companyEmail);
    localStorage.removeItem(CANDIDATE_ID_KEY);
    localStorage.removeItem(COMPANY_USER_ID_KEY);
    localStorage.removeItem(COMPANY_USER_ROLE_KEY);

    setRoleState("company");
    setCompanyProfileIdState(companyId);
    setUserEmailState(companyEmail);
    setCandidateProfileIdState(null);
    setCompanyUserIdState(null);
    setCompanyUserRoleState(null);
    setIsImpersonating(true);
  }, []);

  const exitImpersonation = useCallback(() => {
    const stored = localStorage.getItem(IMPERSONATION_KEY);
    if (!stored) return;
    const adminState = JSON.parse(stored);

    if (adminState.role) localStorage.setItem(ROLE_KEY, adminState.role);
    if (adminState.email) localStorage.setItem(EMAIL_KEY, adminState.email);
    if (adminState.candidateId) localStorage.setItem(CANDIDATE_ID_KEY, adminState.candidateId);
    else localStorage.removeItem(CANDIDATE_ID_KEY);
    if (adminState.companyId) localStorage.setItem(COMPANY_ID_KEY, adminState.companyId);
    else localStorage.removeItem(COMPANY_ID_KEY);
    if (adminState.companyUserId) localStorage.setItem(COMPANY_USER_ID_KEY, adminState.companyUserId);
    else localStorage.removeItem(COMPANY_USER_ID_KEY);
    if (adminState.companyUserRole) localStorage.setItem(COMPANY_USER_ROLE_KEY, adminState.companyUserRole);
    else localStorage.removeItem(COMPANY_USER_ROLE_KEY);

    localStorage.removeItem(IMPERSONATION_KEY);

    setRoleState(adminState.role as UserRole);
    setUserEmailState(adminState.email);
    setCandidateProfileIdState(adminState.candidateId ? parseInt(adminState.candidateId, 10) : null);
    setCompanyProfileIdState(adminState.companyId ? parseInt(adminState.companyId, 10) : null);
    setCompanyUserIdState(adminState.companyUserId ? parseInt(adminState.companyUserId, 10) : null);
    setCompanyUserRoleState(adminState.companyUserRole || null);
    setIsImpersonating(false);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, candidateProfileId, setCandidateProfileId, companyProfileId, setCompanyProfileId, companyUserId, setCompanyUserId, companyUserRole, setCompanyUserRole, userEmail, setUserEmail, isImpersonating, impersonateCandidate, impersonateCompany, exitImpersonation }}>
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
