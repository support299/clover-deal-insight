import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, DollarSign, Hash, LineChart as LineChartIcon, Percent, TrendingUp, Wallet, Users, PlusCircle } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { type SaleRow, formatCurrency, formatPct } from "@/lib/sales";
import { buildTrend, computeMetrics, pctChange, previousRange, rangeFromKey, type DateRangeKey } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DateField } from "@/components/DateField";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "ytd", label: "YTD" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom range…" },
];

function DashboardPage() {
  const { profile } = useAuth();
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("month");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [carrier, setCarrier] = useState<string>("all");
  const [team, setTeam] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [prevSales, setPrevSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const range = useMemo(
    () => rangeFromKey(rangeKey, { from: customFrom, to: customTo }),
    [rangeKey, customFrom, customTo],
  );
  const prevRange = useMemo(() => previousRange(range), [range]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      supabase
        .from("sales")
        .select("*")
        .gte("sale_date", range.from.toISOString())
        .lte("sale_date", range.to.toISOString())
        .order("sale_date", { ascending: false }),
      supabase
        .from("sales")
        .select("*")
        .gte("sale_date", prevRange.from.toISOString())
        .lt("sale_date", prevRange.to.toISOString()),
    ]).then(([cur, prev]) => {
      if (!active) return;
      setSales((cur.data ?? []) as SaleRow[]);
      setPrevSales((prev.data ?? []) as SaleRow[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, [range.from.getTime(), range.to.getTime()]);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (carrier !== "all" && s.carrier !== carrier) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.sale_id.toLowerCase().includes(q) && !s.agent_name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sales, carrier, search]);

  const m = useMemo(() => computeMetrics(filtered), [filtered]);
  const mPrev = useMemo(() => computeMetrics(prevSales), [prevSales]);
  const trend = useMemo(() => buildTrend(filtered, range.from, range.to), [filtered, range.from.getTime(), range.to.getTime()]);

  const carriers = useMemo(() => Array.from(new Set(sales.map((s) => s.carrier))).sort(), [sales]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back{profile ? `, ${profile.display_name}` : ""}. Here&apos;s how sales are performing.
          </p>
        </div>
        <Button asChild>
          <Link to="/sales/new"><PlusCircle className="mr-2 h-4 w-4" /> New sale</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Date range</label>
          <Select value={rangeKey} onValueChange={(v) => setRangeKey(v as DateRangeKey)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {rangeKey === "custom" && (
          <>
            <DateField label="From" value={customFrom} onChange={setCustomFrom} max={customTo} />
            <DateField label="To" value={customTo} onChange={setCustomTo} min={customFrom} />
          </>
        )}
        <div className="flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Carrier</label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All carriers</SelectItem>
              {carriers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Search</label>
          <Input placeholder="Sale ID or agent…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Revenue" icon={DollarSign} value={formatCurrency(m.totalRevenue)}
          delta={pctChange(m.totalRevenue, mPrev.totalRevenue)} sub="vs previous period" />
        <MetricCard title="Number of Sales" icon={Hash} value={m.numSales.toLocaleString()}
          delta={pctChange(m.numSales, mPrev.numSales)}
          sub={`${m.uniqueAgents} active agent${m.uniqueAgents === 1 ? "" : "s"}`} />
        <MetricCard title="Average Deal Size" icon={Wallet} value={formatCurrency(m.avgDealSize)}
          delta={pctChange(m.avgDealSize, mPrev.avgDealSize)}
          sub={`Median: ${formatCurrency(m.medianDealSize)}`} />
        <MetricCard title="Add-on Attach Rate" icon={Percent} value={formatPct(m.attachRate)}
          delta={pctChange(m.attachRate, mPrev.attachRate)} sub="Target: 65%" />
        <MetricCard title="Cross-sell — Life" icon={TrendingUp} value={formatPct(m.lifeCrossSell)}
          delta={pctChange(m.lifeCrossSell, mPrev.lifeCrossSell)} sub="Target: 25%" />
        <MetricCard title="Cost per Acquisition" icon={Users} value={formatCurrency(m.cpa)}
          delta={pctChange(m.cpa, mPrev.cpa)} invertDelta sub="Lower is better" />
      </div>

      {/* Trend chart */}
      <div className="surface-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Revenue trend</h2>
            <p className="text-xs text-muted-foreground">{format(range.from, "MMM d, yyyy")} → {format(range.to, "MMM d, yyyy")}</p>
          </div>
          <LineChartIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full w-full animate-pulse rounded-md bg-muted/40" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 250)" />
                    <stop offset="100%" stopColor="oklch(0.78 0.14 195)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.025 260)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.68 0.03 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.68 0.03 255)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.025 260)", border: "1px solid oklch(0.30 0.025 260)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "oklch(0.97 0.01 250)" }}
                  formatter={(v: any) => [formatCurrency(Number(v)), "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="url(#grad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sales table */}
      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-base font-semibold">Recent sales</h2>
          <div className="text-xs text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Sale ID</th>
                <th className="px-4 py-3 text-left">Agent</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Deal</th>
                <th className="px-4 py-3 text-left">Carrier</th>
                <th className="px-4 py-3 text-left">Add-ons</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr key={s.id} className="border-t border-border/50 hover:bg-secondary/30">
                  <td className="num px-4 py-3 text-xs">{s.sale_id}</td>
                  <td className="px-4 py-3">{s.agent_name}</td>
                  <td className="px-4 py-3">{s.customer_name ?? "—"}</td>
                  <td className="num px-4 py-3 text-xs text-muted-foreground">{format(new Date(s.sale_date), "MMM d, h:mm a")}</td>
                  <td className="num px-4 py-3 text-right font-medium">{formatCurrency(Number(s.deal_size))}</td>
                  <td className="px-4 py-3">{s.carrier}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.add_ons.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                      {s.add_ons.map((a) => <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.lead_source ?? "—"}</td>
                </tr>
              ))}
              {!loading && pageRows.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No sales in this range. <Link to="/sales/new" className="text-primary hover:underline">Submit one →</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-3 text-sm">
            <div className="text-xs text-muted-foreground">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title, icon: Icon, value, delta, sub, invertDelta,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  delta: number | null;
  sub: string;
  invertDelta?: boolean;
}) {
  const showDelta = delta !== null;
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="num mt-3 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {showDelta && (
          <span className={"flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium " + (good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta!).toFixed(1)}%
          </span>
        )}
        <span className="text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
