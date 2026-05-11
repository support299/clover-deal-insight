import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { u as useAuth, B as Button, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, I as Input, s as supabase } from "./router-CvBcNStb.js";
import { f as formatCurrency } from "./sales-Bp_442nI.js";
import { r as rangeFromKey, f as fetchExpensesInRange } from "./expenses-DJbzHgBI.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CAiLApz2.js";
import { D as DateField } from "./DateField-ClvYY_8u.js";
import "@tanstack/react-router";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "date-fns";
import "@radix-ui/react-tabs";
import "react-day-picker";
import "@radix-ui/react-popover";
const TIMEFRAMES = [{
  key: "today",
  label: "Today"
}, {
  key: "week",
  label: "This Week"
}, {
  key: "month",
  label: "This Month"
}, {
  key: "custom",
  label: "Custom"
}];
function lineItemsOf(s) {
  const li = s.line_items;
  return Array.isArray(li) ? li : [];
}
function countByKind(s, kind) {
  return lineItemsOf(s).filter((li) => li.kind === kind).length;
}
function revenueByKind(s, kind) {
  return lineItemsOf(s).filter((li) => li.kind === kind).reduce((sum, li) => sum + Number(li.amount ?? 0), 0);
}
function LeaderboardsPage() {
  const {
    user
  } = useAuth();
  const [timeframe, setTimeframe] = useState("week");
  const [customFrom, setCustomFrom] = useState(void 0);
  const [customTo, setCustomTo] = useState(void 0);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(/* @__PURE__ */ new Date());
  const range = useMemo(() => rangeFromKey(timeframe, {
    from: customFrom,
    to: customTo
  }), [timeframe, customFrom, customTo]);
  const load = () => {
    setLoading(true);
    Promise.all([supabase.from("sales").select("*").gte("sale_date", range.from.toISOString()).lte("sale_date", range.to.toISOString()).then(({
      data
    }) => data ?? []), fetchExpensesInRange(range.from, range.to)]).then(([s, e]) => {
      setSales(s);
      setExpenses(e);
      setRefreshedAt(/* @__PURE__ */ new Date());
      setLoading(false);
    });
  };
  useEffect(() => {
    load();
    const t = setInterval(load, 3e5);
    return () => clearInterval(t);
  }, [range.from.getTime(), range.to.getTime()]);
  const [agentSearch, setAgentSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const [addonFilter, setAddonFilter] = useState("all");
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
  const expenseByAgent = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    expenses.forEach((e) => m.set(e.agent_id, (m.get(e.agent_id) ?? 0) + Number(e.amount)));
    return m;
  }, [expenses]);
  const agents = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    filteredSales.forEach((s) => {
      const cur = map.get(s.agent_id) ?? {
        agent_id: s.agent_id,
        agent_name: s.agent_name,
        team_id: s.team_id,
        team_name: s.team_name ?? "Unassigned",
        revenue: 0,
        count: 0,
        avgDeal: 0,
        lifeCount: 0,
        healthCount: 0,
        addonCount: 0,
        lifeRevenue: 0,
        healthRevenue: 0,
        addonRevenue: 0,
        cpa: 0
      };
      cur.revenue += Number(s.deal_size);
      cur.count += 1;
      cur.lifeCount += countByKind(s, "life");
      cur.healthCount += countByKind(s, "health");
      cur.addonCount += countByKind(s, "addon");
      cur.lifeRevenue += revenueByKind(s, "life");
      cur.healthRevenue += revenueByKind(s, "health");
      cur.addonRevenue += revenueByKind(s, "addon");
      map.set(s.agent_id, cur);
    });
    return [...map.values()].map((a) => {
      const totalExpense = expenseByAgent.get(a.agent_id) ?? 0;
      return {
        ...a,
        avgDeal: a.count ? a.revenue / a.count : 0,
        cpa: a.count ? totalExpense / a.count : 0
      };
    }).sort((a, b) => b.revenue - a.revenue || b.count - a.count);
  }, [filteredSales, expenseByAgent]);
  const teamOptions = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    sales.forEach((s) => {
      const id = s.team_id ?? "none";
      m.set(id, s.team_name ?? "Unassigned");
    });
    return [...m.entries()].map(([id, name]) => ({
      id,
      name
    }));
  }, [sales]);
  const carrierOptions = useMemo(() => Array.from(new Set(sales.map((s) => s.carrier))).sort(), [sales]);
  const productOptions = useMemo(() => Array.from(new Set(sales.map((s) => s.product))).sort(), [sales]);
  const leadSourceOptions = useMemo(() => Array.from(new Set(sales.map((s) => s.lead_source).filter((x) => !!x))).sort(), [sales]);
  const addonOptions = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
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
  const teams = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    filteredSales.forEach((s) => {
      const key = s.team_id ?? "none";
      const cur = map.get(key) ?? {
        team_id: s.team_id,
        team_name: s.team_name ?? "Unassigned",
        revenue: 0,
        count: 0,
        avgDeal: 0,
        cpa: 0
      };
      cur.revenue += Number(s.deal_size);
      cur.count += 1;
      cur.cpa += Number(s.cost_per_lead ?? 0);
      map.set(key, cur);
    });
    return [...map.values()].map((t) => ({
      ...t,
      avgDeal: t.count ? t.revenue / t.count : 0,
      cpa: t.count ? t.cpa / t.count : 0
    })).sort((a, b) => b.revenue - a.revenue || b.count - a.count);
  }, [filteredSales]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Leaderboards" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Top performers, ranked by revenue. Auto-refreshes every minute." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden text-xs text-muted-foreground sm:block", children: [
          "Updated ",
          refreshedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", onClick: load, disabled: loading, children: "Refresh" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: TIMEFRAMES.map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTimeframe(t.key), className: "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " + (timeframe === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"), children: t.label }, t.key)) }),
    timeframe === "custom" && /* @__PURE__ */ jsxs("div", { className: "surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end", children: [
      /* @__PURE__ */ jsx(DateField, { label: "From", value: customFrom, onChange: setCustomFrom, max: customTo }),
      /* @__PURE__ */ jsx(DateField, { label: "To", value: customTo, onChange: setCustomTo, min: customFrom })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Carrier" }),
        /* @__PURE__ */ jsxs(Select, { value: carrierFilter, onValueChange: setCarrierFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All carriers" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All carriers" }),
            carrierOptions.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Product" }),
        /* @__PURE__ */ jsxs(Select, { value: productFilter, onValueChange: setProductFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All products" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All products" }),
            productOptions.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Add-on" }),
        /* @__PURE__ */ jsxs(Select, { value: addonFilter, onValueChange: setAddonFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Any" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Any add-on" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "__none", children: "No add-ons" }),
            addonOptions.map((a) => /* @__PURE__ */ jsx(SelectItem, { value: a, children: a }, a))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Lead source" }),
        /* @__PURE__ */ jsxs(Select, { value: leadSourceFilter, onValueChange: setLeadSourceFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All sources" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All sources" }),
            leadSourceOptions.map((l) => /* @__PURE__ */ jsx(SelectItem, { value: l, children: l }, l))
          ] })
        ] })
      ] }),
      hasExtraFilters && /* @__PURE__ */ jsx("div", { className: "sm:col-span-2 lg:col-span-4", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
        setCarrierFilter("all");
        setProductFilter("all");
        setLeadSourceFilter("all");
        setAddonFilter("all");
      }, children: "Clear filters" }) })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "agents", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "agents", children: "Top Agents" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "teams", children: "Top Teams" })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "agents", className: "mt-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-center", children: [
          /* @__PURE__ */ jsx(Input, { placeholder: "Search agent…", value: agentSearch, onChange: (e) => setAgentSearch(e.target.value), className: "sm:max-w-xs" }),
          /* @__PURE__ */ jsxs(Select, { value: teamFilter, onValueChange: setTeamFilter, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "sm:max-w-xs", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All teams" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All teams" }),
              teamOptions.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.id, children: t.name }, t.id))
            ] })
          ] }),
          (agentSearch || teamFilter !== "all") && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
            setAgentSearch("");
            setTeamFilter("all");
          }, children: "Clear" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "surface-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "w-16 px-4 py-3 text-left", children: "Rank" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Agent" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Team" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Total $" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Sales" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Avg Deal" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Life Count" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Life $" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Health Count" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Health $" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Addons" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Addons $" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "CPA" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { children: [
            filteredAgents.map((a, i) => /* @__PURE__ */ jsxs(Row, { rank: i + 1, highlight: a.agent_id === user?.id, children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: a.agent_name }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: a.team_name }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right font-semibold", children: formatCurrency(a.revenue) }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: a.count }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(a.avgDeal) }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: a.lifeCount }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(a.lifeRevenue) }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: a.healthCount }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(a.healthRevenue) }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: a.addonCount }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(a.addonRevenue) }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(a.cpa) })
            ] }, a.agent_id)),
            !loading && filteredAgents.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 13, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No agents match your filters." }) })
          ] })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "teams", className: "mt-4", children: /* @__PURE__ */ jsx("div", { className: "surface-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "w-16 px-4 py-3 text-left", children: "Rank" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Team" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Revenue" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Sales" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Avg Deal" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Avg CPA" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          teams.map((t, i) => /* @__PURE__ */ jsxs(Row, { rank: i + 1, children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: t.team_name }),
            /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right font-semibold", children: formatCurrency(t.revenue) }),
            /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: t.count }),
            /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(t.avgDeal) }),
            /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: formatCurrency(t.cpa) })
          ] }, (t.team_id ?? "none") + i)),
          !loading && teams.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No team sales yet." }) })
        ] })
      ] }) }) }) })
    ] })
  ] });
}
function Row({
  rank,
  highlight,
  children
}) {
  const medal = rank === 1 ? /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4", style: {
    color: "var(--gold)"
  } }) : rank === 2 ? /* @__PURE__ */ jsx(Medal, { className: "h-4 w-4", style: {
    color: "var(--silver)"
  } }) : rank === 3 ? /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4", style: {
    color: "var(--bronze)"
  } }) : null;
  return /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/50 " + (highlight ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : "hover:bg-secondary/30"), children: [
    /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxs("span", { className: "num w-5 font-semibold text-muted-foreground", children: [
        "#",
        rank
      ] }),
      medal
    ] }) }),
    children
  ] });
}
export {
  LeaderboardsPage as component
};
