import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useRole } from "@/contexts/role-context";
import { useGetCandidate } from "@workspace/api-client-react";
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { MapPin, X } from "lucide-react";
import { useState } from "react";

export function PostcodeMissingBanner() {
  const { role, candidateProfileId } = useRole();
  const [dismissed, setDismissed] = useState(false);

  const { data: candidate } = useGetCandidate(candidateProfileId ?? 0, {
    query: { enabled: role === "candidate" && !!candidateProfileId },
  });
  const { data: company } = useCompanyProfile({ enabled: role === "company" });

  if (dismissed) return null;
  if (role !== "candidate" && role !== "company") return null;

  let needsPostcode = false;
  let editLink = "";
  if (role === "candidate" && candidate) {
    needsPostcode = !((candidate as any).postcode);
    editLink = "/profile";
  } else if (role === "company" && company) {
    needsPostcode = !((company as any).postcode);
    editLink = "/company-profile";
  }

  if (!needsPostcode) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-amber-900 min-w-0">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">
            Add a UK postcode to your profile so we can match you on location.{" "}
            <Link href={editLink} className="font-semibold underline">
              Update profile
            </Link>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
