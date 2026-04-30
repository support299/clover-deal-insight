import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, DollarSign, Hash, Heart, LineChart as LineChartIcon, Package, Percent, ShieldPlus, TrendingUp, Wallet, Users, PlusCircle } from "lucide-react";
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
  const { profile, roles, user } = useAuth();
  const isAgentOnly = roles.length > 0 && !roles.includes("admin") && !roles.includes("manager");
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("month");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [carrier, setCarrier] = useState<string>("all");
  const [team, setTeam] = useState<string>("all");
  const [product, setProduct] = useState<string>("all");
  const [leadSource, setLeadSource] = useState<string>("all");
  const [addon, setAddon] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [prevSales, setPrevSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState<{
    life_revenue_target: number;
    health_revenue_target: number;
    addon_revenue_target: number;
    life_attach_ratio_target: number;
    health_attach_ratio_target: number;
    addon_attach_ratio_target: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const range = useMemo(
    () => rangeFromKey(rangeKey, { from: customFrom, to: customTo }),
    [rangeKey, customFrom, customTo],
  );
  const prevRange = useMemo(() => previousRange(range), [range]);

  useEffect(() => {
    let active = true;
    if (!user) return;
    setLoading(true);
    const curQ = supabase
      .from("sales")
      .select("*")
      .gte("sale_date", range.from.toISOString())
      .lte("sale_date", range.to.toISOString())
      .order("sale_date", { ascending: false });
    const prevQ = supabase
      .from("sales")
      .select("*")
      .gte("sale_date", prevRange.from.toISOString())
      .lt("sale_date", prevRange.to.toISOString());
    if (isAgentOnly) {
      curQ.eq("agent_id", user.id);
      prevQ.eq("agent_id", user.id);
    }
    Promise.all([curQ, prevQ]).then(([cur, prev]) => {
      if (!active) return;
      setSales((cur.data ?? []) as SaleRow[]);
      setPrevSales((prev.data ?? []) as SaleRow[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user?.id, isAgentOnly, range.from.getTime(), range.to.getTime()]);

  // Load targets: agent-specific if agent-only, else company-wide
  useEffect(() => {
    if (!user) return;
    let active = true;
    const q = supabase
      .from("targets")
      .select("life_revenue_target, health_revenue_target, addon_revenue_target, life_attach_ratio_target, health_attach_ratio_target, addon_attach_ratio_target, scope, agent_id");
    const run = async () => {
      const agentRes = isAgentOnly
        ? await q.eq("scope", "agent").eq("agent_id", user.id).maybeSingle()
        : { data: null, error: null };
      if (active && agentRes.data) {
        setTargets(agentRes.data as any);
        return;
      }
      const compRes = await supabase
        .from("targets")
        .select("life_revenue_target, health_revenue_target, addon_revenue_target, life_attach_ratio_target, health_attach_ratio_target, addon_attach_ratio_target")
        .eq("scope", "company")
        .maybeSingle();
      if (active) setTargets((compRes.data as any) ?? null);
    };
    run();
    return () => { active = false; };
  }, [user?.id, isAgentOnly]);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (carrier !== "all" && s.carrier !== carrier) return false;
      if (product !== "all" && s.product !== product) return false;
      if (leadSource !== "all" && (s.lead_source ?? "") !== leadSource) return false;
      if (addon !== "all") {
        if (addon === "__none") {
          if ((s.add_ons?.length ?? 0) > 0) return false;
        } else if (!s.add_ons?.includes(addon)) return false;
      }
      if (team !== "all") {
        const id = s.team_id ?? "none";
        if (id !== team) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.sale_id.toLowerCase().includes(q) &&
          !s.agent_name.toLowerCase().includes(q) &&
          !(s.customer_name?.toLowerCase().includes(q) ?? false)
        ) return false;
      }
      return true;
    });
  }, [sales, carrier, team, product, leadSource, addon, search]);

  const m = useMemo(() => computeMetrics(filtered), [filtered]);
  const mPrev = useMemo(() => computeMetrics(prevSales), [prevSales]);
  const trend = useMemo(() => buildTrend(filtered, range.from, range.to), [filtered, range.from.getTime(), range.to.getTime()]);

  const carriers = useMemo(() => Array.from(new Set(sales.map((s) => s.carrier))).sort(), [sales]);
  const products = useMemo(() => Array.from(new Set(sales.map((s) => s.product))).sort(), [sales]);
  const leadSources = useMemo(
    () => Array.from(new Set(sales.map((s) => s.lead_source).filter((x): x is string => !!x))).sort(),
    [sales],
  );
  const addons = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => s.add_ons?.forEach((a) => set.add(a)));
    return [...set].sort();
  }, [sales]);
  const teamOptions = useMemo(() => {
    const m = new Map<string, string>();
    sales.forEach((s) => m.set(s.team_id ?? "none", s.team_name ?? "Unassigned"));
    return [...m.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [sales]);

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
      <div className="surface-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div>
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
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Carrier</label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All carriers</SelectItem>
              {carriers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Product</label>
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger><SelectValue placeholder="All products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Add-on</label>
          <Select value={addon} onValueChange={setAddon}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any add-on</SelectItem>
              <SelectItem value="__none">No add-ons</SelectItem>
              {addons.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Lead source</label>
          <Select value={leadSource} onValueChange={setLeadSource}>
            <SelectTrigger><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {leadSources.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Team</label>
          <Select value={team} onValueChange={setTeam}>
            <SelectTrigger><SelectValue placeholder="All teams" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teamOptions.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Search</label>
          <Input placeholder="Sale ID, agent or customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total Revenue" icon={DollarSign} value={formatCurrency(m.totalRevenue)}
          delta={pctChange(m.totalRevenue, mPrev.totalRevenue)} sub="vs previous period"
          corner={<span>{m.numSales.toLocaleString()} sale{m.numSales === 1 ? "" : "s"}</span>} />
        <MetricCard title="Average Deal Size" icon={Wallet} value={formatCurrency(m.avgDealSize)}
          delta={pctChange(m.avgDealSize, mPrev.avgDealSize)}
          sub={`Median: ${formatCurrency(m.medianDealSize)}`} />
        <MetricCard title="Add-on Attach Rate" icon={Percent} value={formatPct(m.attachRate)}
          delta={pctChange(m.attachRate, mPrev.attachRate)}
          sub={targets ? `Target: ${formatPct(Number(targets.addon_attach_ratio_target))}` : "Across all sales"}
          targetValue={targets ? Number(targets.addon_attach_ratio_target) : null}
          currentValue={m.attachRate} />
        <MetricCard title="Life Insurance Revenue" icon={ShieldPlus} value={formatCurrency(m.lifeRevenue)}
          delta={pctChange(m.lifeRevenue, mPrev.lifeRevenue)}
          sub={targets ? `Target: ${formatCurrency(Number(targets.life_revenue_target))}` : "No target set"}
          targetValue={targets ? Number(targets.life_revenue_target) : null}
          currentValue={m.lifeRevenue} />
        <MetricCard title="Life Attach Ratio" icon={TrendingUp} value={formatPct(m.lifeAttachRatio)}
          delta={pctChange(m.lifeAttachRatio, mPrev.lifeAttachRatio)}
          sub={targets ? `Target: ${formatPct(Number(targets.life_attach_ratio_target))}` : "No target set"}
          targetValue={targets ? Number(targets.life_attach_ratio_target) : null}
          currentValue={m.lifeAttachRatio} />
        <MetricCard title="Health Insurance Revenue" icon={Heart} value={formatCurrency(m.healthRevenue)}
          delta={pctChange(m.healthRevenue, mPrev.healthRevenue)}
          sub={targets ? `Target: ${formatCurrency(Number(targets.health_revenue_target))}` : "No target set"}
          targetValue={targets ? Number(targets.health_revenue_target) : null}
          currentValue={m.healthRevenue} />
        <MetricCard title="Health Attach Ratio" icon={Percent} value={formatPct(m.healthAttachRatio)}
          delta={pctChange(m.healthAttachRatio, mPrev.healthAttachRatio)}
          sub={targets ? `Target: ${formatPct(Number(targets.health_attach_ratio_target))}` : "No target set"}
          targetValue={targets ? Number(targets.health_attach_ratio_target) : null}
          currentValue={m.healthAttachRatio} />
        <MetricCard title="Add-on Revenue" icon={Package} value={formatCurrency(m.addonRevenue)}
          delta={pctChange(m.addonRevenue, mPrev.addonRevenue)}
          sub={targets ? `Target: ${formatCurrency(Number(targets.addon_revenue_target))}` : "No target set"}
          targetValue={targets ? Number(targets.addon_revenue_target) : null}
          currentValue={m.addonRevenue} />
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
  title, icon: Icon, value, delta, sub, invertDelta, corner, targetValue, currentValue,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  delta: number | null;
  sub: string;
  invertDelta?: boolean;
  corner?: React.ReactNode;
  targetValue?: number | null;
  currentValue?: number | null;
}) {
  const showDelta = delta !== null;
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;
  const hasTarget = typeof targetValue === "number" && targetValue > 0 && typeof currentValue === "number";
  const targetMet = hasTarget && (currentValue as number) >= (targetValue as number);
  const subClass = hasTarget ? (targetMet ? "text-success font-medium" : "text-destructive font-medium") : "text-muted-foreground";
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="num text-3xl font-bold tracking-tight">{value}</div>
        {corner && <div className="text-xs text-muted-foreground">{corner}</div>}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {showDelta && (
          <span className={"flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium " + (good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(delta!).toFixed(1)}%
          </span>
        )}
        <span className={subClass}>{sub}</span>
      </div>
    </div>
  );
}
