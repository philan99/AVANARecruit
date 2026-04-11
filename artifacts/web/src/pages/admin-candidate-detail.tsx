import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Clock,
  GraduationCap,
  Briefcase,
  Users,
  FileText,
} from "lucide-react";

interface ExperienceEntry {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface CandidateDetail {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  currentTitle: string;
  summary: string;
  skills: string[];
  experienceYears: number;
  education: string;
  educationDetails: string | null;
  location: string;
  profileImage: string | null;
  cvFile: string | null;
  cvFileName: string | null;
  experience: ExperienceEntry[] | null;
  status: string;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  passive: "bg-orange-100 text-orange-800",
  not_looking: "bg-gray-100 text-gray-600",
};

export default function AdminCandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const res = await fetch(`${basePath}/candidates/${id}`);
        if (res.ok) setCandidate(await res.json());
      } catch (err) {
        console.error("Failed to fetch candidate", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [basePath, id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-mono">Loading candidate...</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center text-muted-foreground">Candidate not found.</div>;
  }

  const statusLabel = candidate.status === "not_looking" ? "Not Looking" : candidate.status;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground hover:text-foreground"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Candidates
      </Button>

      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            {candidate.profileImage ? (
              <img
                src={candidate.profileImage}
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${statusStyles[candidate.status] || "bg-gray-100 text-gray-600"}`}>
                  {statusLabel}
                </span>
              </div>
              {candidate.currentTitle && (
                <p className="text-sm text-muted-foreground mt-1">{candidate.currentTitle}</p>
              )}
              {candidate.summary && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{candidate.summary}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium truncate">{candidate.email}</p>
            </div>
          </CardContent>
        </Card>

        {candidate.phone && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</p>
                <p className="text-sm font-medium">{candidate.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {candidate.location && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium">{candidate.location}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Experience</p>
              <p className="text-sm font-medium">{candidate.experienceYears} years</p>
            </div>
          </CardContent>
        </Card>

        {candidate.education && (
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Education</p>
                <p className="text-sm font-medium truncate">{candidate.education}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Matches</p>
              <p className="text-sm font-medium">{candidate.matchCount} job matches</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {candidate.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills listed.</p>
          )}
        </CardContent>
      </Card>

      {candidate.experience && candidate.experience.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Experience History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidate.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-primary/30 pl-4">
                  <p className="text-sm font-medium text-foreground">{exp.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {candidate.cvFileName && (
        <Card className="bg-card">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CV / Resume</p>
              <p className="text-sm font-medium">{candidate.cvFileName}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-[10px] text-muted-foreground text-right">
        Registered: {new Date(candidate.createdAt).toLocaleDateString()} · Last updated: {new Date(candidate.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
