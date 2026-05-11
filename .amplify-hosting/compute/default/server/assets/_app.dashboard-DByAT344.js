import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { DollarSign, Wallet, Percent, ShieldPlus, TrendingUp, Heart, Package, Users, LineChart, ArrowUp, ArrowDown } from "lucide-react";
import { ResponsiveContainer, LineChart as LineChart$1, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { u as useAuth, s as supabase, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, I as Input } from "./router-CvBcNStb.js";
import { f as formatCurrency, a as formatPct } from "./sales-Bp_442nI.js";
import { r as rangeFromKey, p as previousRange, f as fetchExpensesInRange, c as computeMetrics, a as computeCpa, b as buildTrend, d as pctChange } from "./expenses-DJbzHgBI.js";
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
import "react-day-picker";
import "@radix-ui/react-popover";
function useRefreshTick(intervalMs) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setTick((t) => t + 1);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
const RANGE_OPTIONS = [{
  key: "today",
  label: "Today"
}, {
  key: "week",
  label: "This Week"
}, {
  key: "month",
  label: "This Month"
}, {
  key: "30d",
  label: "Last 30 days"
}, {
  key: "90d",
  label: "Last 90 days"
}, {
  key: "ytd",
  label: "YTD"
}, {
  key: "all",
  label: "All time"
}, {
  key: "custom",
  label: "Custom range…"
}];
function DashboardPage() {
  const {
    profile,
    roles,
    user
  } = useAuth();
  const isAgentOnly = roles.length > 0 && !roles.includes("admin") && !roles.includes("manager");
  const [rangeKey, setRangeKey] = useState("month");
  const [customFrom, setCustomFrom] = useState(void 0);
  const [customTo, setCustomTo] = useState(void 0);
  const [carrier, setCarrier] = useState("all");
  const [team, setTeam] = useState("all");
  const [product, setProduct] = useState("all");
  const [leadSource, setLeadSource] = useState("all");
  const [addon, setAddon] = useState("all");
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState([]);
  const [prevSales, setPrevSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [prevExpenses, setPrevExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targets, setTargets] = useState(null);
  const [trendMetric, setTrendMetric] = useState("revenue");
  const range = useMemo(() => rangeFromKey(rangeKey, {
    from: customFrom,
    to: customTo
  }), [rangeKey, customFrom, customTo]);
  const prevRange = useMemo(() => previousRange(range), [range]);
  const refreshTick = useRefreshTick(3e5);
  useEffect(() => {
    let active = true;
    if (!user) return;
    setLoading(true);
    const curQ = supabase.from("sales").select("*").gte("sale_date", range.from.toISOString()).lte("sale_date", range.to.toISOString()).order("sale_date", {
      ascending: false
    });
    const prevQ = supabase.from("sales").select("*").gte("sale_date", prevRange.from.toISOString()).lt("sale_date", prevRange.to.toISOString());
    if (isAgentOnly) {
      curQ.eq("agent_id", user.id);
      prevQ.eq("agent_id", user.id);
    }
    Promise.all([curQ, prevQ, fetchExpensesInRange(range.from, range.to, isAgentOnly ? {
      agentId: user.id
    } : void 0), fetchExpensesInRange(prevRange.from, prevRange.to, isAgentOnly ? {
      agentId: user.id
    } : void 0)]).then(([cur, prev, exp, prevExp]) => {
      if (!active) return;
      setSales(cur.data ?? []);
      setPrevSales(prev.data ?? []);
      setExpenses(exp);
      setPrevExpenses(prevExp);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user?.id, isAgentOnly, range.from.getTime(), range.to.getTime(), refreshTick]);
  useEffect(() => {
    if (!user) return;
    let active = true;
    const q = supabase.from("targets").select("life_revenue_target, health_revenue_target, addon_revenue_target, life_attach_ratio_target, health_attach_ratio_target, addon_attach_ratio_target, scope, agent_id");
    const run = async () => {
      const agentRes = isAgentOnly ? await q.eq("scope", "agent").eq("agent_id", user.id).maybeSingle() : {
        data: null
      };
      if (active && agentRes.data) {
        setTargets(agentRes.data);
        return;
      }
      const compRes = await supabase.from("targets").select("life_revenue_target, health_revenue_target, addon_revenue_target, life_attach_ratio_target, health_attach_ratio_target, addon_attach_ratio_target").eq("scope", "company").maybeSingle();
      if (active) setTargets(compRes.data ?? null);
    };
    run();
    return () => {
      active = false;
    };
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
        if (!s.sale_id.toLowerCase().includes(q) && !s.agent_name.toLowerCase().includes(q) && !(s.customer_name?.toLowerCase().includes(q) ?? false)) return false;
      }
      return true;
    });
  }, [sales, carrier, team, product, leadSource, addon, search]);
  const m = useMemo(() => computeMetrics(filtered), [filtered]);
  const mPrev = useMemo(() => computeMetrics(prevSales), [prevSales]);
  const cpa = useMemo(() => computeCpa(expenses, filtered), [expenses, filtered]);
  const cpaPrev = useMemo(() => computeCpa(prevExpenses, prevSales), [prevExpenses, prevSales]);
  const trend = useMemo(() => buildTrend(filtered, range.from, range.to, expenses), [filtered, range.from.getTime(), range.to.getTime(), expenses]);
  const carriers = useMemo(() => Array.from(new Set(sales.map((s) => s.carrier))).sort(), [sales]);
  const products = useMemo(() => Array.from(new Set(sales.map((s) => s.product))).sort(), [sales]);
  const leadSources = useMemo(() => Array.from(new Set(sales.map((s) => s.lead_source).filter((x) => !!x))).sort(), [sales]);
  const addons = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    sales.forEach((s) => s.add_ons?.forEach((a) => set.add(a)));
    return [...set].sort();
  }, [sales]);
  const teamOptions = useMemo(() => {
    const m2 = /* @__PURE__ */ new Map();
    sales.forEach((s) => m2.set(s.team_id ?? "none", s.team_name ?? "Unassigned"));
    return [...m2.entries()].map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [sales]);
  const topByKind = useMemo(() => {
    const make = () => /* @__PURE__ */ new Map();
    const maps = {
      life: make(),
      health: make(),
      addon: make()
    };
    const bump = (kind, name, amount) => {
      const m2 = maps[kind];
      const cur = m2.get(name) ?? {
        count: 0,
        revenue: 0
      };
      cur.count += 1;
      cur.revenue += amount;
      m2.set(name, cur);
    };
    filtered.forEach((s) => {
      const items = s.line_items;
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((li) => {
          const k = li.kind;
          if (k !== "life" && k !== "health" && k !== "addon") return;
          bump(k, li.product || "Unknown", Number(li.amount ?? 0));
        });
      }
      if (Array.isArray(s.add_ons)) {
        const amounts = s.add_on_amounts ?? {};
        s.add_ons.forEach((a) => {
          const hasInLineItems = Array.isArray(items) && items.some((li) => li.kind === "addon" && li.product === a);
          if (hasInLineItems) return;
          bump("addon", a, Number(amounts?.[a] ?? 0));
        });
      }
    });
    const top = (m2) => [...m2.entries()].map(([name, v]) => ({
      name,
      ...v
    })).sort((a, b) => b.count - a.count).slice(0, 10);
    return {
      life: top(maps.life),
      health: top(maps.health),
      addon: top(maps.addon)
    };
  }, [filtered]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Dashboard" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        "Welcome back",
        profile ? `, ${profile.display_name}` : "",
        ". Here's how sales are performing."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Date range" }),
        /* @__PURE__ */ jsxs(Select, { value: rangeKey, onValueChange: (v) => setRangeKey(v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: RANGE_OPTIONS.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.key, children: o.label }, o.key)) })
        ] })
      ] }),
      rangeKey === "custom" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DateField, { label: "From", value: customFrom, onChange: setCustomFrom, max: customTo }),
        /* @__PURE__ */ jsx(DateField, { label: "To", value: customTo, onChange: setCustomTo, min: customFrom })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Carrier" }),
        /* @__PURE__ */ jsxs(Select, { value: carrier, onValueChange: setCarrier, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All carriers" }),
            carriers.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Product" }),
        /* @__PURE__ */ jsxs(Select, { value: product, onValueChange: setProduct, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All products" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All products" }),
            products.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Add-on" }),
        /* @__PURE__ */ jsxs(Select, { value: addon, onValueChange: setAddon, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Any" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Any add-on" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "__none", children: "No add-ons" }),
            addons.map((a) => /* @__PURE__ */ jsx(SelectItem, { value: a, children: a }, a))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Lead source" }),
        /* @__PURE__ */ jsxs(Select, { value: leadSource, onValueChange: setLeadSource, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All sources" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All sources" }),
            leadSources.map((l) => /* @__PURE__ */ jsx(SelectItem, { value: l, children: l }, l))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Team" }),
        /* @__PURE__ */ jsxs(Select, { value: team, onValueChange: setTeam, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All teams" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All teams" }),
            teamOptions.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.id, children: t.name }, t.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Search" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Sale ID, agent or customer…", value: search, onChange: (e) => setSearch(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(MetricCard, { title: "Total Revenue", icon: DollarSign, value: formatCurrency(m.totalRevenue), delta: pctChange(m.totalRevenue, mPrev.totalRevenue), sub: "vs previous period", corner: /* @__PURE__ */ jsxs("span", { children: [
        m.numSales.toLocaleString(),
        " sale",
        m.numSales === 1 ? "" : "s"
      ] }) }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Average Deal Size", icon: Wallet, value: formatCurrency(m.avgDealSize), delta: pctChange(m.avgDealSize, mPrev.avgDealSize), sub: `Median: ${formatCurrency(m.medianDealSize)}` }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Add-on Attach Rate", icon: Percent, value: formatPct(m.attachRate), delta: pctChange(m.attachRate, mPrev.attachRate), sub: targets ? `Target: ${formatPct(Number(targets.addon_attach_ratio_target))}` : "Across all sales", targetValue: targets ? Number(targets.addon_attach_ratio_target) : null, currentValue: m.attachRate }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Life Insurance Revenue", icon: ShieldPlus, value: formatCurrency(m.lifeRevenue), delta: pctChange(m.lifeRevenue, mPrev.lifeRevenue), sub: targets ? `Target: ${formatCurrency(Number(targets.life_revenue_target))}` : "No target set", targetValue: targets ? Number(targets.life_revenue_target) : null, currentValue: m.lifeRevenue }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Life Attach Ratio", icon: TrendingUp, value: formatPct(m.lifeAttachRatio), delta: pctChange(m.lifeAttachRatio, mPrev.lifeAttachRatio), sub: targets ? `Target: ${formatPct(Number(targets.life_attach_ratio_target))}` : "No target set", targetValue: targets ? Number(targets.life_attach_ratio_target) : null, currentValue: m.lifeAttachRatio }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Health Insurance Revenue", icon: Heart, value: formatCurrency(m.healthRevenue), delta: pctChange(m.healthRevenue, mPrev.healthRevenue), sub: targets ? `Target: ${formatCurrency(Number(targets.health_revenue_target))}` : "No target set", targetValue: targets ? Number(targets.health_revenue_target) : null, currentValue: m.healthRevenue }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Health Attach Ratio", icon: Percent, value: formatPct(m.healthAttachRatio), delta: pctChange(m.healthAttachRatio, mPrev.healthAttachRatio), sub: targets ? `Target: ${formatPct(Number(targets.health_attach_ratio_target))}` : "No target set", targetValue: targets ? Number(targets.health_attach_ratio_target) : null, currentValue: m.healthAttachRatio }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Add-on Revenue", icon: Package, value: formatCurrency(m.addonRevenue), delta: pctChange(m.addonRevenue, mPrev.addonRevenue), sub: targets ? `Target: ${formatCurrency(Number(targets.addon_revenue_target))}` : "No target set", targetValue: targets ? Number(targets.addon_revenue_target) : null, currentValue: m.addonRevenue }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Cost per Acquisition", icon: Users, value: formatCurrency(cpa.avgCpa), delta: pctChange(cpa.avgCpa, cpaPrev.avgCpa), invertDelta: true, sub: `Total cost: ${formatCurrency(cpa.totalCost)}`, corner: /* @__PURE__ */ jsxs("span", { children: [
        cpa.numSales.toLocaleString(),
        " sale",
        cpa.numSales === 1 ? "" : "s"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card p-4 sm:p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-base font-semibold", children: [
            trendMetric === "revenue" && "Total revenue trend",
            trendMetric === "avgDeal" && "Average deal size trend",
            trendMetric === "life" && "Life insurance revenue trend",
            trendMetric === "health" && "Health insurance revenue trend",
            trendMetric === "totalCost" && "Total Cost trend",
            trendMetric === "all" && "Combined trends"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            format(range.from, "MMM d, yyyy"),
            " → ",
            format(range.to, "MMM d, yyyy")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(Select, { value: trendMetric, onValueChange: (v) => setTrendMetric(v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[220px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "revenue", children: "Total revenue" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "avgDeal", children: "Average deal size" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "life", children: "Life insurance revenue" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "health", children: "Health insurance revenue" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "totalCost", children: "Total Cost" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All metrics" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(LineChart, { className: "h-4 w-4 text-muted-foreground" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-72 w-full", children: loading ? /* @__PURE__ */ jsx("div", { className: "h-full w-full animate-pulse rounded-md bg-muted/40" }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart$1, { data: trend, margin: {
        top: 5,
        right: 16,
        left: 0,
        bottom: 0
      }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "oklch(0.30 0.025 260)", vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "date", stroke: "oklch(0.68 0.03 255)", fontSize: 11, tickLine: false, axisLine: false }),
        /* @__PURE__ */ jsx(YAxis, { stroke: "oklch(0.68 0.03 255)", fontSize: 11, tickLine: false, axisLine: false, tickFormatter: (v) => v >= 1e3 ? `$${(v / 1e3).toFixed(0)}k` : `$${v}` }),
        /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
          background: "oklch(0.20 0.025 260)",
          border: "1px solid oklch(0.30 0.025 260)",
          borderRadius: 8,
          fontSize: 12
        }, labelStyle: {
          color: "oklch(0.97 0.01 250)"
        }, formatter: (v, name) => [formatCurrency(Number(v)), String(name)] }),
        (trendMetric === "revenue" || trendMetric === "all") && /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "revenue", name: "Total revenue", stroke: "oklch(0.72 0.18 250)", strokeWidth: 2.5, dot: false, activeDot: {
          r: 4
        } }),
        (trendMetric === "avgDeal" || trendMetric === "all") && /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "avgDeal", name: "Avg deal size", stroke: "oklch(0.78 0.14 195)", strokeWidth: 2.5, dot: false, activeDot: {
          r: 4
        } }),
        (trendMetric === "life" || trendMetric === "all") && /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "life", name: "Life revenue", stroke: "oklch(0.75 0.18 30)", strokeWidth: 2.5, dot: false, activeDot: {
          r: 4
        } }),
        (trendMetric === "health" || trendMetric === "all") && /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "health", name: "Health revenue", stroke: "oklch(0.75 0.18 145)", strokeWidth: 2.5, dot: false, activeDot: {
          r: 4
        } }),
        (trendMetric === "totalCost" || trendMetric === "all") && /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "totalCost", name: "Total Cost", stroke: "oklch(0.78 0.16 80)", strokeWidth: 2.5, dot: false, activeDot: {
          r: 4
        } })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsx(TopProductsCard, { title: "Most sold life insurance", items: topByKind.life, loading, unitLabel: "Policies" }),
      /* @__PURE__ */ jsx(TopProductsCard, { title: "Most sold health insurance", items: topByKind.health, loading, unitLabel: "Policies" }),
      /* @__PURE__ */ jsx(TopProductsCard, { title: "Most sold add-ons", items: topByKind.addon, loading, unitLabel: "Units" })
    ] })
  ] });
}
function MetricCard({
  title,
  icon: Icon,
  value,
  delta,
  sub,
  invertDelta,
  corner,
  targetValue,
  currentValue
}) {
  const showDelta = delta !== null;
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;
  const hasTarget = typeof targetValue === "number" && targetValue > 0 && typeof currentValue === "number";
  const targetMet = hasTarget && currentValue >= targetValue;
  const subClass = hasTarget ? targetMet ? "text-success font-medium" : "text-destructive font-medium" : "text-muted-foreground";
  return /* @__PURE__ */ jsxs("div", { className: "surface-card p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: title }),
      /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-end justify-between gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "num text-3xl font-bold tracking-tight", children: value }),
      corner && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: corner })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-xs", children: [
      showDelta && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium " + (good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"), children: [
        positive ? /* @__PURE__ */ jsx(ArrowUp, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "h-3 w-3" }),
        Math.abs(delta).toFixed(1),
        "%"
      ] }),
      /* @__PURE__ */ jsx("span", { className: subClass, children: sub })
    ] })
  ] });
}
function TopProductsCard({
  title,
  items,
  loading,
  unitLabel
}) {
  return /* @__PURE__ */ jsxs("div", { className: "surface-card overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border p-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: title }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Top ",
        items.length
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "#" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Product" }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: unitLabel }),
        /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Revenue" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        items.map((p, i) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/50 hover:bg-secondary/30", children: [
          /* @__PURE__ */ jsxs("td", { className: "num px-4 py-3 text-xs text-muted-foreground", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: p.name }),
          /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: p.count }),
          /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right font-medium", children: formatCurrency(p.revenue) })
        ] }, p.name)),
        !loading && items.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-10 text-center text-sm text-muted-foreground", children: "No data in this range." }) })
      ] })
    ] }) })
  ] });
}
export {
  DashboardPage as component
};
