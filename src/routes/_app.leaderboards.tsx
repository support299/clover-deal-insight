import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { type SaleRow, formatCurrency, formatPct } from "@/lib/sales";
import { rangeFromKey, type DateRangeKey } from "@/lib/metrics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/leaderboards")({
  component: LeaderboardsPage,
});

const TIMEFRAMES: { key: DateRangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

interface AgentStat {
  agent_id: string;
  agent_name: string;
  revenue: number;
  count: number;
  avgDeal: number;
  attachRate: number;
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

function LeaderboardsPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<DateRangeKey>("week");
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  const range = useMemo(() => rangeFromKey(timeframe), [timeframe]);

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

  const agents = useMemo<AgentStat[]>(() => {
    const map = new Map<string, AgentStat>();
    sales.forEach((s) => {
      const cur = map.get(s.agent_id) ?? {
        agent_id: s.agent_id, agent_name: s.agent_name,
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
  }, [sales]);

  const teams = useMemo<TeamStat[]>(() => {
    const map = new Map<string, TeamStat>();
    sales.forEach((s) => {
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
  }, [sales]);

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

      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">Top Agents</TabsTrigger>
          <TabsTrigger value="teams">Top Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-4">
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Agent</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-right">Sales</th>
                    <th className="px-4 py-3 text-right">Avg Deal</th>
                    <th className="px-4 py-3 text-right">Attach %</th>
                    <th className="px-4 py-3 text-right">CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a, i) => (
                    <Row key={a.agent_id} rank={i + 1} highlight={a.agent_id === user?.id}>
                      <td className="px-4 py-3 font-medium">{a.agent_name}</td>
                      <td className="num px-4 py-3 text-right font-semibold">{formatCurrency(a.revenue)}</td>
                      <td className="num px-4 py-3 text-right">{a.count}</td>
                      <td className="num px-4 py-3 text-right">{formatCurrency(a.avgDeal)}</td>
                      <td className="num px-4 py-3 text-right">{formatPct(a.attachRate)}</td>
                      <td className="num px-4 py-3 text-right">{formatCurrency(a.cpa)}</td>
                    </Row>
                  ))}
                  {!loading && agents.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No sales in this timeframe yet.</td></tr>
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
