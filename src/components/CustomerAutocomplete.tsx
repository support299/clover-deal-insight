import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (c: Contact) => void;
  placeholder?: string;
}

export function CustomerAutocomplete({ value, onChange, onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipNextSearch = useRef(false);

  const query = value.trim();

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (query.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("ghl_contacts")
        .select("id, name, email, phone")
        .ilike("name", `%${query}%`)
        .order("name")
        .limit(8);
      if (!cancelled) {
        setResults(data ?? []);
        setHighlight(0);
        setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showList = open && query.length >= 2 && (loading || results.length > 0);

  const pick = (c: Contact) => {
    skipNextSearch.current = true;
    onChange(c.name ?? "");
    onSelect?.(c);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && results[highlight]) {
            e.preventDefault();
            pick(results[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        autoComplete="off"
      />
      {showList && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {loading && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Searching…</div>
          )}
          {!loading && results.map((c, i) => (
            <button
              type="button"
              key={c.id}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => pick(c)}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm hover:bg-accent",
                i === highlight && "bg-accent",
              )}
            >
              <div className="font-medium">{c.name || "(unnamed)"}</div>
              {(c.email || c.phone) && (
                <div className="text-xs text-muted-foreground">
                  {[c.email, c.phone].filter(Boolean).join(" · ")}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
