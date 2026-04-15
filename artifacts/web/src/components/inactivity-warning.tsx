import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout";

export function InactivityWarning() {
  const { showWarning, secondsLeft, stayLoggedIn, doLogout } = useInactivityTimeout();

  return (
    <Dialog open={showWarning} onOpenChange={(open) => { if (!open) stayLoggedIn(); }}>
      <DialogContent className="sm:max-w-[400px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Session Timeout
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            You've been inactive for a while. For your security, you'll be automatically logged out in:
          </p>
          <p className="text-3xl font-bold text-center tabular-nums">
            {secondsLeft}s
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={doLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Log Out Now
          </Button>
          <Button onClick={stayLoggedIn}>
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
