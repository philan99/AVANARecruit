import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Verification {
  id: number;
  candidateName: string;
  roleTitle: string;
  company: string;
  verifierName: string;
  status: string;
  verifierResponse: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export default function CompanyCandidateVerifications({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const [verifRes, candRes] = await Promise.all([
        fetch(`${apiBase}/candidates/${candidateId}/verifications`),
        fetch(`${apiBase}/candidates/${candidateId}`),
      ]);
      if (verifRes.ok) setVerifications(await verifRes.json());
      if (candRes.ok) {
        const cand = await candRes.json();
        setCandidateName(cand.name || "");
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [candidateId, apiBase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function statusIcon(status: string) {
    if (status === "verified") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === "declined") return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  }

  function statusBadge(status: string) {
    return (
      <Badge
        variant={status === "verified" ? "default" : status === "declined" ? "destructive" : "secondary"}
        className="text-xs"
      >
        {status === "verified" ? "Verified" : status === "declined" ? "Declined" : "Pending"}
      </Badge>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <button onClick={() => window.history.back()} className="hover:text-primary flex items-center cursor-pointer bg-transparent border-none p-0">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>

      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employment Verifications</h1>
          {candidateName && (
            <p className="text-muted-foreground mt-1">Verification records for <span className="font-medium text-foreground">{candidateName}</span></p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading verifications...</div>
      ) : verifications.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Verifications</h3>
            <p className="text-sm text-muted-foreground">This candidate has no employment verification records.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map(v => (
            <Card key={v.id} className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0">
                    {statusIcon(v.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground">{v.roleTitle}</h3>
                      {statusBadge(v.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Company:</span>{" "}
                        <span className="font-medium">{v.company}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Verifier:</span>{" "}
                        <span className="font-medium">{v.verifierName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested:</span>{" "}
                        <span className="font-medium">{format(new Date(v.createdAt), "dd MMM yyyy")}</span>
                      </div>
                      {v.verifiedAt && (
                        <div>
                          <span className="text-muted-foreground">Responded:</span>{" "}
                          <span className="font-medium">{format(new Date(v.verifiedAt), "dd MMM yyyy")}</span>
                        </div>
                      )}
                    </div>
                    {v.verifierResponse && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Verifier Response</p>
                        <p className="text-sm text-foreground">{v.verifierResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
