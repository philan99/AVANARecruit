import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

export interface PostcodeValue {
  postcode: string;
  country: string;
}

interface PostcodeInputProps {
  value: PostcodeValue;
  onChange: (v: PostcodeValue) => void;
  onResolved?: (info: { town: string; region: string; lat: number; lng: number; postcode: string }) => void;
  required?: boolean;
  postcodeId?: string;
  className?: string;
}

const COUNTRIES = ["United Kingdom"];

export function PostcodeInput({
  value,
  onChange,
  onResolved,
  required,
  postcodeId,
  className,
}: PostcodeInputProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [town, setTown] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const lastLookup = useRef<string>("");

  const country = value.country || "United Kingdom";
  const postcode = value.postcode || "";

  useEffect(() => {
    if (!postcode || country !== "United Kingdom") {
      setStatus("idle");
      setTown("");
      return;
    }
    if (!UK_POSTCODE_RE.test(postcode.trim())) {
      setStatus("idle");
      setTown("");
      return;
    }
    const trimmed = postcode.trim().toUpperCase();
    if (trimmed === lastLookup.current) return;
    lastLookup.current = trimmed;
    setStatus("loading");
    setErrorMsg("");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`);
        if (!res.ok) {
          setStatus("error");
          setErrorMsg("Postcode not found");
          setTown("");
          return;
        }
        const data = await res.json();
        const r = data.result;
        if (!r) {
          setStatus("error");
          setErrorMsg("Postcode not found");
          return;
        }
        const t = r.post_town || r.admin_district || r.parish || "";
        const region = r.region || r.admin_county || "";
        setTown(t + (region && region !== t ? `, ${region}` : ""));
        setStatus("ok");
        onResolved?.({ town: t, region, lat: r.latitude, lng: r.longitude, postcode: r.postcode });
      } catch {
        setStatus("error");
        setErrorMsg("Could not validate postcode");
      }
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postcode, country]);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${className || ""}`}>
      <div className="sm:col-span-2">
        <Input
          id={postcodeId}
          value={postcode}
          required={required}
          onChange={(e) => onChange({ postcode: e.target.value.toUpperCase(), country })}
          placeholder="Postcode (e.g. SW1A 1AA)"
          autoComplete="postal-code"
        />
        <div className="mt-1 text-xs min-h-[16px] flex items-center gap-1.5">
          {status === "loading" && (<><Loader2 className="w-3 h-3 animate-spin text-slate-400" /> <span className="text-slate-500">Looking up postcode…</span></>)}
          {status === "ok" && (<><CheckCircle2 className="w-3 h-3 text-green-600" /> <span className="text-slate-600">{town}</span></>)}
          {status === "error" && (<><AlertCircle className="w-3 h-3 text-red-600" /> <span className="text-red-600">{errorMsg}</span></>)}
        </div>
      </div>
      <div>
        <Select value={country} onValueChange={(v) => onChange({ postcode, country: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
