import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Microscope } from "lucide-react";
import { MatchDiagnosticPanel, type Diagnostic } from "@/components/match-diagnostic-panel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetchUrl: string | null;
  subtitle?: string;
}

export function MatchDiagnosticDialog({ open, onOpenChange, fetchUrl, subtitle }: Props) {
  const [data, setData] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !fetchUrl) return;
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    (async () => {
      try {
        const res = await fetch(fetchUrl, { signal: controller.signal });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Request failed (${res.status})`);
        }
        const payload: Diagnostic = await res.json();
        if (!cancelled) setData(payload);
      } catch (err: any) {
        if (cancelled || err?.name === "AbortError") return;
        setError(err.message || "Failed to load diagnostic.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open, fetchUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" /> Match Insights
          </DialogTitle>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analysing this match…</p>
          </div>
        )}
        {error && !loading && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {data && !loading && <MatchDiagnosticPanel data={data} />}
      </DialogContent>
    </Dialog>
  );
}
