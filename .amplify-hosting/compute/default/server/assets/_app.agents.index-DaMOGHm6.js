import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, Users, ArrowRight } from "lucide-react";
import { u as useAuth, s as supabase, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, B as Button } from "./router-CvBcNStb.js";
import { f as formatCurrency } from "./sales-Bp_442nI.js";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function AgentsIndexPage() {
  const {
    roles,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const canManage = roles.includes("admin") || roles.includes("manager");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("all");
  useEffect(() => {
    if (!authLoading && !canManage) navigate({
      to: "/dashboard"
    });
  }, [authLoading, canManage, navigate]);
  useEffect(() => {
    if (!canManage) return;
    let active = true;
    setLoading(true);
    Promise.all([supabase.from("profiles").select("id, display_name, team_id, teams:team_id(name)"), supabase.from("sales").select("agent_id, deal_size")]).then(([profilesRes, salesRes]) => {
      if (!active) return;
      const totals = /* @__PURE__ */ new Map();
      (salesRes.data ?? []).forEach((s) => {
        const cur = totals.get(s.agent_id) ?? {
          count: 0,
          revenue: 0
        };
        cur.count += 1;
        cur.revenue += Number(s.deal_size) || 0;
        totals.set(s.agent_id, cur);
      });
      const list = (profilesRes.data ?? []).map((p) => ({
        agent_id: p.id,
        agent_name: p.display_name,
        team_id: p.team_id ?? null,
        team_name: p.teams?.name ?? "Unassigned",
        sales_count: totals.get(p.id)?.count ?? 0,
        revenue: totals.get(p.id)?.revenue ?? 0
      }));
      list.sort((a, b) => b.revenue - a.revenue || a.agent_name.localeCompare(b.agent_name));
      setRows(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [canManage]);
  const teamOptions = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    rows.forEach((r) => m.set(r.team_id ?? "none", r.team_name ?? "Unassigned"));
    return [...m.entries()].map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (team !== "all" && (r.team_id ?? "none") !== team) return false;
      if (search && !r.agent_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, team]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Agents" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Select an agent to view their dedicated dashboard." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
        /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Search agent" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(Input, { className: "pl-9", placeholder: "Type a name…", value: search, onChange: (e) => setSearch(e.target.value) })
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
      (search || team !== "all") && /* @__PURE__ */ jsx("div", { className: "sm:col-span-3", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
        setSearch("");
        setTeam("all");
      }, children: "Clear filters" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between border-b border-border p-4", children: /* @__PURE__ */ jsxs("h2", { className: "text-base font-semibold", children: [
        filtered.length,
        " agent",
        filtered.length === 1 ? "" : "s"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Agent" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Team" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Sales" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Revenue" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtered.map((a) => /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/50 hover:bg-secondary/30", children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs", children: /* @__PURE__ */ jsx(Users, { className: "h-3.5 w-3.5" }) }),
              a.agent_name
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: a.team_name ?? "Unassigned" }),
            /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right", children: a.sales_count }),
            /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right font-medium", children: formatCurrency(a.revenue) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "secondary", children: /* @__PURE__ */ jsxs(Link, { to: "/agents/$agentId", params: {
              agentId: a.agent_id
            }, children: [
              "View ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-3 w-3" })
            ] }) }) })
          ] }, a.agent_id)),
          !loading && filtered.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No agents match your filters." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AgentsIndexPage as component
};
