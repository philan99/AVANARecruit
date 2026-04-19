import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { CITY_SUGGESTIONS } from "@/lib/cities";

interface CityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function CityCombobox({ value, onChange, placeholder = "Start typing a city, e.g. London", className, id }: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const query = value.trim().toLowerCase();
  const filtered = (query
    ? CITY_SUGGESTIONS.filter(c => c.toLowerCase().includes(query))
    : CITY_SUGGESTIONS
  ).slice(0, 50);

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
    setHighlight(0);
  }, [value]);

  function selectCity(city: string) {
    onChange(city);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && filtered[highlight]) {
      e.preventDefault();
      selectCity(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <Input
        id={id}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {filtered.map((city, idx) => (
            <li
              key={city}
              role="option"
              aria-selected={idx === highlight}
              onMouseDown={(e) => { e.preventDefault(); selectCity(city); }}
              onMouseEnter={() => setHighlight(idx)}
              className={`px-3 py-2 text-sm cursor-pointer ${idx === highlight ? "bg-accent text-accent-foreground" : ""}`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
