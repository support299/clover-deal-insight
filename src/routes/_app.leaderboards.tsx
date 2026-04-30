import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { type SaleRow, formatCurrency } from "@/lib/sales";
import { rangeFromKey, type DateRangeKey } from "@/lib/metrics";
import { fetchExpensesInRange, type ExpenseRow } from "@/lib/expenses";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/DateField";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/leaderboards")({
  component: LeaderboardsPage,
});

const TIMEFRAMES: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

interface AgentStat {
  agent_id: string;
  agent_name: string;
  team_id: string | null;
  team_name: string;
  revenue: number;
  count: number;
  avgDeal: number;
  lifeCount: number;
  healthCount: number;
  addonCount: number;
  cpa: number;
}

interface TeamStat {
  team_id: string | null;
  team_name: string;
  revenue: number;
  count: number;
  avgDeal: number;
  cpa: number;
}

function lineItemsOf(s: SaleRow) {
  const li = (s as any).line_items;
  return Array.isArray(li) ? (li as { kind?: string }[]) : [];
}
function countByKind(s: SaleRow, kind: "life" | "health" | "addon"): number {
  return lineItemsOf(s).filter((li) => li.kind === kind).length;
}

function LeaderboardsPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<DateRangeKey>("week");
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  const range = useMemo(
    () => rangeFromKey(timeframe, { from: customFrom, to: customTo }),
    [timeframe, customFrom, customTo],
  );

  const load = () => {
    setLoading(true);
    supabase
      .from("sales")
      .select("*")
      .gte("sale_date", range.from.toISOString())
      .lte("sale_date", range.to.toISOString())
      .then(({ data }) => {
        setSales((data ?? []) as SaleRow[]);
        setRefreshedAt(new Date());
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [range.from.getTime(), range.to.getTime()]);

  const [agentSearch, setAgentSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>("all");
  const [addonFilter, setAddonFilter] = useState<string>("all");

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (carrierFilter !== "all" && s.carrier !== carrierFilter) return false;
      if (productFilter !== "all" && s.product !== productFilter) return false;
      if (leadSourceFilter !== "all" && (s.lead_source ?? "") !== leadSourceFilter) return false;
      if (addonFilter !== "all") {
        if (addonFilter === "__none") {
          if ((s.add_ons?.length ?? 0) > 0) return false;
        } else if (!s.add_ons?.includes(addonFilter)) return false;
      }
      return true;
    });
  }, [sales, carrierFilter, productFilter, leadSourceFilter, addonFilter]);

  const agents = useMemo<AgentStat[]>(() => {
    const map = new Map<string, AgentStat>();
    filteredSales.forEach((s) => {
      const cur = map.get(s.agent_id) ?? {
        agent_id: s.agent_id, agent_name: s.agent_name,
        team_id: s.team_id, team_name: s.team_name ?? "Unassigned",
        revenue: 0, count: 0, avgDeal: 0, attachRate: 0, cpa: 0,
      };
      cur.revenue += Number(s.deal_size);
      cur.count += 1;
      cur.cpa += Number(s.cost_per_lead ?? 0);
      if ((s.add_ons?.length ?? 0) > 0) (cur as any)._withAddon = ((cur as any)._withAddon ?? 0) + 1;
      map.set(s.agent_id, cur);
    });
    return [...map.values()].map((a) => ({
      ...a,
      avgDeal: a.count ? a.revenue / a.count : 0,
      attachRate: a.count ? (((a as any)._withAddon ?? 0) / a.count) * 100 : 0,
      cpa: a.count ? a.cpa / a.count : 0,
    })).sort((a, b) => b.revenue - a.revenue || b.count - a.count);
  }, [filteredSales]);

  const teamOptions = useMemo(() => {
    const m = new Map<string, string>();
    sales.forEach((s) => {
      const id = s.team_id ?? "none";
      m.set(id, s.team_name ?? "Unassigned");
    });
    return [...m.entries()].map(([id, name]) => ({ id, name }));
  }, [sales]);

  const carrierOptions = useMemo(
    () => Array.from(new Set(sales.map((s) => s.carrier))).sort(),
    [sales],
  );
  const productOptions = useMemo(
    () => Array.from(new Set(sales.map((s) => s.product))).sort(),
    [sales],
  );
  const leadSourceOptions = useMemo(
    () => Array.from(new Set(sales.map((s) => s.lead_source).filter((x): x is string => !!x))).sort(),
    [sales],
  );
  const addonOptions = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => s.add_ons?.forEach((a) => set.add(a)));
    return [...set].sort();
  }, [sales]);

  const filteredAgents = useMemo(() => {
    const q = agentSearch.trim().toLowerCase();
    return agents.filter((a) => {
      if (q && !a.agent_name.toLowerCase().includes(q)) return false;
      if (teamFilter !== "all") {
        const id = a.team_id ?? "none";
        if (id !== teamFilter) return false;
      }
      return true;
    });
  }, [agents, agentSearch, teamFilter]);

  const hasExtraFilters = carrierFilter !== "all" || productFilter !== "all" || leadSourceFilter !== "all" || addonFilter !== "all";

  const teams = useMemo<TeamStat[]>(() => {
    const map = new Map<string, TeamStat>();
    filteredSales.forEach((s) => {
      const key = s.team_id ?? "none";
      const cur = map.get(key) ?? {
        team_id: s.team_id, team_name: s.team_name ?? "Unassigned",
        revenue: 0, count: 0, avgDeal: 0, cpa: 0,
      };
      cur.revenue += Number(s.deal_size);
      cur.count += 1;
      cur.cpa += Number(s.cost_per_lead ?? 0);
      map.set(key, cur);
    });
    return [...map.values()].map((t) => ({
      ...t,
      avgDeal: t.count ? t.revenue / t.count : 0,
      cpa: t.count ? t.cpa / t.count : 0,
    })).sort((a, b) => b.revenue - a.revenue || b.count - a.count);
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Leaderboards</h1>
          <p className="mt-1 text-sm text-muted-foreground">Top performers, ranked by revenue. Auto-refreshes every minute.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden text-xs text-muted-foreground sm:block">
            Updated {refreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>Refresh</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIMEFRAMES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTimeframe(t.key)}
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
              (timeframe === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {timeframe === "custom" && (
        <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <DateField label="From" value={customFrom} onChange={setCustomFrom} max={customTo} />
          <DateField label="To" value={customTo} onChange={setCustomTo} min={customFrom} />
        </div>
      )}

      <div className="surface-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Carrier</label>
          <Select value={carrierFilter} onValueChange={setCarrierFilter}>
            <SelectTrigger><SelectValue placeholder="All carriers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All carriers</SelectItem>
              {carrierOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Product</label>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger><SelectValue placeholder="All products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {productOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Add-on</label>
          <Select value={addonFilter} onValueChange={setAddonFilter}>
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any add-on</SelectItem>
              <SelectItem value="__none">No add-ons</SelectItem>
              {addonOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Lead source</label>
          <Select value={leadSourceFilter} onValueChange={setLeadSourceFilter}>
            <SelectTrigger><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {leadSourceOptions.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {hasExtraFilters && (
          <div className="sm:col-span-2 lg:col-span-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCarrierFilter("all");
                setProductFilter("all");
                setLeadSourceFilter("all");
                setAddonFilter("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Top Agents</TabsTrigger>
          <TabsTrigger value="teams">Top Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search agent…"
              value={agentSearch}
              onChange={(e) => setAgentSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All teams</SelectItem>
                {teamOptions.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(agentSearch || teamFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setAgentSearch(""); setTeamFilter("all"); }}>
                Clear
              </Button>
            )}
          </div>
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Agent</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Sales</th>
                    <th className="px-4 py-3 text-right">Avg Deal</th>
                    <th className="px-4 py-3 text-right">Attach %</th>
                    <th className="px-4 py-3 text-right">CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((a, i) => (
                    <Row key={a.agent_id} rank={i + 1} highlight={a.agent_id === user?.id}>
                      <td className="px-4 py-3 font-medium">{a.agent_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.team_name}</td>
                      <td className="num px-4 py-3 text-right font-semibold">{formatCurrency(a.revenue)}</td>
                      <td className="num px-4 py-3 text-right">{a.count}</td>
                      <td className="num px-4 py-3 text-right">{formatCurrency(a.avgDeal)}</td>
                      <td className="num px-4 py-3 text-right">{formatPct(a.attachRate)}</td>
                      <td className="num px-4 py-3 text-right">{formatCurrency(a.cpa)}</td>
                    </Row>
                  ))}
                  {!loading && filteredAgents.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No agents match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Sales</th>
                    <th className="px-4 py-3 text-right">Avg Deal</th>
                    <th className="px-4 py-3 text-right">Avg CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => (
                    <Row key={(t.team_id ?? "none") + i} rank={i + 1}>
                      <td className="px-4 py-3 font-medium">{t.team_name}</td>
                      <td className="num px-4 py-3 text-right font-semibold">{formatCurrency(t.revenue)}</td>
                      <td className="num px-4 py-3 text-right">{t.count}</td>
                      <td className="num px-4 py-3 text-right">{formatCurrency(t.avgDeal)}</td>
                      <td className="num px-4 py-3 text-right">{formatCurrency(t.cpa)}</td>
                    </Row>
                  ))}
                  {!loading && teams.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">No team sales yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ rank, highlight, children }: { rank: number; highlight?: boolean; children: React.ReactNode }) {
  const medal =
    rank === 1 ? <Crown className="h-4 w-4" style={{ color: "var(--gold)" }} /> :
    rank === 2 ? <Medal className="h-4 w-4" style={{ color: "var(--silver)" }} /> :
    rank === 3 ? <Trophy className="h-4 w-4" style={{ color: "var(--bronze)" }} /> :
    null;
  return (
    <tr className={"border-t border-border/50 " + (highlight ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : "hover:bg-secondary/30")}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="num w-5 font-semibold text-muted-foreground">#{rank}</span>
          {medal}
        </div>
      </td>
      {children}
    </tr>
  );
}
