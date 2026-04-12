import { useQuery } from "@tanstack/react-query";
import { getGetCompanyProfileQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/contexts/role-context";

const apiBasePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

export function useCompanyProfile(options?: { enabled?: boolean }) {
  const { companyProfileId } = useRole();

  return useQuery({
    queryKey: [...getGetCompanyProfileQueryKey(), companyProfileId],
    queryFn: async () => {
      const url = companyProfileId
        ? `${apiBasePath}/company-profile?companyId=${companyProfileId}`
        : `${apiBasePath}/company-profile`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch company profile");
      return res.json();
    },
    retry: false,
    enabled: options?.enabled !== false,
  });
}
