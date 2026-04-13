import { useState, useEffect, useCallback } from "react";
import { useRole } from "@/contexts/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, CheckCircle2, Clock, XCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Verification {
  id: number;
  candidateName: string;
  roleTitle: string;
  company: string;
  verifierName: string;
  verifierEmail: string;
  message: string | null;
  status: string;
  verifierResponse: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export default function CandidateVerifications() {
  const { candidateProfileId } = useRole();
  const { toast } = useToast();
  const apiBase = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = useCallback(async () => {
    if (!candidateProfileId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/candidates/${candidateProfileId}/verifications`);
      if (res.ok) {
        setVerifications(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [candidateProfileId, apiBase]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  async function handleCancel(verificationId: number) {
    try {
      const res = await fetch(`${apiBase}/verifications/${verificationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidateProfileId }),
      });
      if (res.ok) {
        setVerifications(prev => prev.filter(v => v.id !== verificationId));
        toast({ title: "Verification Cancelled", description: "The pending verification request has been cancelled." });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to cancel verification.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to cancel verification.", variant: "destructive" });
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Employment Verifications</h1>
      </div>
      <p className="text-muted-foreground">All employment verification requests and their current status.</p>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground font-mono">Loading verifications...</div>
      ) : verifications.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-12 text-center">
            <ShieldCheck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Verifications</h3>
            <p className="text-sm text-muted-foreground">You haven't requested any employment verifications yet.</p>
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
                    {v.message && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Your Message</p>
                        <p className="text-sm text-foreground">{v.message}</p>
                      </div>
                    )}
                    {v.verifierResponse && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Verifier Response</p>
                        <p className="text-sm text-foreground">{v.verifierResponse}</p>
                      </div>
                    )}
                    {v.status === "pending" && (
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleCancel(v.id)}
                        >
                          <X className="w-3 h-3 mr-1" /> Cancel Request
                        </Button>
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
