import { CandidateAlertsSettings } from "@/components/candidate-alerts-settings";
import { Bell } from "lucide-react";

export default function CompanyCandidateAlerts() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(76, 175, 80, 0.1)" }}
        >
          <Bell className="w-5 h-5" style={{ color: "#4CAF50" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a2035" }}>
            Candidate Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Switch alerts on for the roles you want to track. When a new candidate registers
            and meets that role's minimum match score, you'll get an email.
          </p>
        </div>
      </div>

      <CandidateAlertsSettings />
    </div>
  );
}
