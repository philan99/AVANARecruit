import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, AlertCircle, MapPin } from "lucide-react";

export interface TownValue {
  town: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
}

export interface TownResolved {
  town: string;
  region: string;
  county: string;
  lat: number;
  lng: number;
  country: string;
}

interface TownInputProps {
  value: TownValue;
  onChange: (v: TownValue) => void;
  onResolved?: (info: TownResolved) => void;
  required?: boolean;
  placeholder?: string;
  inputId?: string;
  className?: string;
}

interface PlaceResult {
  code: string;
  name_1: string;
  county_unitary?: string | null;
  region?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
}

const PLACES_URL = "https://api.postcodes.io/places";

function placeLabel(p: PlaceResult): string {
  const parts: string[] = [p.name_1];
  if (p.county_unitary && p.county_unitary !== p.name_1) parts.push(p.county_unitary);
  else if (p.region && p.region !== p.name_1) parts.push(p.region);
  return parts.join(", ");
}

export function TownInput({
  value,
  onChange,
  onResolved,
  required,
  placeholder = "Start typing a town or city, e.g. Manchester",
  inputId,
  className,
}: TownInputProps) {
  const [query, setQuery] = useState(value.town || "");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error" | "no-results">(
    value.town && value.lat != null ? "ok" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  // Seed lastFetched with the initial value so a pre-filled town (e.g. on page load
  // or form hydration) doesn't trigger an autocomplete fetch and dropdown.
  const lastFetched = useRef<string>(value.town || "");
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local query in sync if parent updates value externally (e.g. form reset).
  useEffect(() => {
    if (value.town !== query) {
      setQuery(value.town || "");
      lastFetched.current = value.town || "";
      if (value.town && value.lat != null) setStatus("ok");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.town, value.lat]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setStatus((s) => (s === "loading" ? "idle" : s));
      return;
    }
    if (trimmed === lastFetched.current) return;
    lastFetched.current = trimmed;
    setStatus("loading");
    setErrorMsg("");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${PLACES_URL}?q=${encodeURIComponent(trimmed)}&limit=10`);
        if (!res.ok) {
          setStatus("error");
          setErrorMsg("Lookup failed. Please try again.");
          setResults([]);
          return;
        }
        const data = await res.json();
        const list: PlaceResult[] = Array.isArray(data?.result) ? data.result : [];
        setResults(list);
        if (list.length === 0) {
          setStatus("no-results");
        } else {
          setStatus("idle");
          setOpen(true);
          setHighlight(0);
        }
      } catch {
        setStatus("error");
        setErrorMsg("Lookup failed. Please try again.");
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function selectPlace(p: PlaceResult) {
    const town = p.name_1;
    const region = p.region || "";
    const county = p.county_unitary || "";
    const country = "United Kingdom";
    lastFetched.current = town;
    setQuery(town);
    setResults([]);
    setOpen(false);
    setStatus("ok");
    onChange({ town, country, lat: p.latitude, lng: p.longitude });
    onResolved?.({
      town,
      region,
      county,
      lat: p.latitude,
      lng: p.longitude,
      country,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && results.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[highlight]) {
        e.preventDefault();
        selectPlace(results[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  }
  function handleFocus() {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
    if (results.length > 0) setOpen(true);
  }

  return (
    <div ref={containerRef} className={className}>
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id={inputId}
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            // While the user is typing, the previously-selected place no longer matches the text.
            // Clear the geocoded coords so the parent can't accidentally save a stale lat/lng.
            if (status === "ok") setStatus("idle");
            if (next.trim() === "") {
              onChange({ town: "", country: value.country || "United Kingdom", lat: null, lng: null });
            } else {
              onChange({ town: next, country: value.country || "United Kingdom", lat: null, lng: null });
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="pl-8"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {status === "ok" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
      </div>
      {open && results.length > 0 && (
        <ul className="mt-1 max-h-64 overflow-auto rounded-md border border-border bg-popover shadow-md text-sm z-30 relative">
          {results.map((p, idx) => (
            <li
              key={`${p.code}-${idx}`}
              role="option"
              aria-selected={idx === highlight}
              onMouseDown={(e) => {
                e.preventDefault();
                selectPlace(p);
              }}
              onMouseEnter={() => setHighlight(idx)}
              className={
                "px-3 py-2 cursor-pointer flex items-start gap-2 " +
                (idx === highlight ? "bg-accent text-accent-foreground" : "")
              }
            >
              <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{p.name_1}</div>
                <div className="text-xs text-muted-foreground truncate">{placeLabel(p).replace(`${p.name_1}, `, "")}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {status === "no-results" && query.trim().length >= 2 && (
        <p className="mt-1 text-xs text-muted-foreground">No matching UK town or city found.</p>
      )}
      {status === "error" && (
        <p className="mt-1 text-xs text-red-600" role="alert">{errorMsg}</p>
      )}
      {status === "ok" && (
        <p className="mt-1 text-xs text-muted-foreground">UK only.</p>
      )}
    </div>
  );
}
