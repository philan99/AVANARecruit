import { useQuery } from "@tanstack/react-query";

export type IndustryOption = { value: string; label: string };

export function useIndustries() {
  return useQuery<IndustryOption[]>({
    queryKey: ["/api/industries"],
    queryFn: async () => {
      const res = await fetch("/api/industries");
      if (!res.ok) throw new Error("Failed to load industries");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
