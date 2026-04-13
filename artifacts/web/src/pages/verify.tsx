import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ShieldCheck, Briefcase, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const basePath = `${import.meta.env.BASE_URL}api`.replace(/\/\//g, "/");

  useEffect(() => {
    async function fetchVerification() {
      try {
        const res = await fetch(`${basePath}/verifications/token/${token}`);
        if (res.ok) {
          setVerification(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch verification", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVerification();
  }, [basePath, token]);

  const handleSubmit = async (status: "verified" | "declined") => {
    setSubmitting(true);
    try {
      const res = await fetch(`${basePath}/verifications/token/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, response: response.trim() || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setVerification(updated);
        setSubmitted(true);
        toast({
          title: status === "verified" ? "Verification Confirmed" : "Verification Declined",
          description: status === "verified"
            ? "Thank you for verifying this employment."
            : "Your response has been recorded.",
        });
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to submit response.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to submit response.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-mono">Loading verification...</p>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verification Not Found</h2>
            <p className="text-sm text-muted-foreground">This verification link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verification.status !== "pending" || submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            {verification.status === "verified" ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Employment Verified</h2>
                <p className="text-sm text-muted-foreground">
                  Thank you for confirming <strong>{verification.candidateName}</strong>'s role as{" "}
                  <strong>{verification.roleTitle}</strong> at <strong>{verification.company}</strong>.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Response Recorded</h2>
                <p className="text-sm text-muted-foreground">
                  Your response regarding <strong>{verification.candidateName}</strong>'s verification has been recorded.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center border-b border-border pb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Employment Verification</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            You have been asked to verify the following employment.
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Candidate</p>
                <p className="font-semibold text-foreground">{verification.candidateName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Role</p>
                <p className="font-semibold text-foreground">{verification.roleTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Building className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Company</p>
                <p className="font-semibold text-foreground">{verification.company}</p>
              </div>
            </div>
          </div>

          {verification.message && (
            <div className="bg-muted/30 rounded-lg p-4 border-l-3 border-primary">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Message from {verification.candidateName}:</p>
              <p className="text-sm text-foreground leading-relaxed">{verification.message}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your response (optional)</label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Add any comments or notes about this verification..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => handleSubmit("verified")}
              disabled={submitting}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Verify Employment
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit("declined")}
              disabled={submitting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            By responding, you confirm that the information you provide is accurate to the best of your knowledge.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
