import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { PlusCircle, Search, Pencil, Trash2 } from "lucide-react";
import { u as useAuth, B as Button, I as Input, s as supabase } from "./router-CvBcNStb.js";
import { f as formatCurrency } from "./sales-Bp_442nI.js";
import { B as Badge } from "./badge-C4fVAAET.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function ExpensesListPage() {
  const {
    user,
    roles
  } = useAuth();
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");
  const canManageOthers = isAdmin || isManager;
  const [rows, setRows] = useState([]);
  const [agentNames, setAgentNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const load = async () => {
    if (!user) return;
    setLoading(true);
    const {
      data
    } = await supabase.from("expenses").select("*").order("start_date", {
      ascending: false
    }).limit(500);
    const list = data ?? [];
    setRows(list);
    const agentIds = Array.from(new Set(list.map((e) => e.agent_id)));
    if (agentIds.length > 0) {
      const {
        data: profs
      } = await supabase.from("profiles").select("id, display_name").in("id", agentIds);
      const map = {};
      (profs ?? []).forEach((p) => {
        map[p.id] = p.display_name;
      });
      setAgentNames(map);
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user?.id]);
  const canEdit = (e) => isAdmin || isManager || e.agent_id === user?.id;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((e) => (agentNames[e.agent_id] ?? "").toLowerCase().includes(q) || (e.notes ?? "").toLowerCase().includes(q));
  }, [rows, search, agentNames]);
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const remove = async (id) => {
    if (!confirm("Delete this expense?")) return;
    const {
      error
    } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Expense deleted");
    load();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Expenses" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: canManageOthers ? "All expenses across the team." : "Your logged expenses." })
      ] }),
      /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/expenses/new", children: [
        /* @__PURE__ */ jsx(PlusCircle, { className: "mr-2 h-4 w-4" }),
        " New expense"
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "surface-card p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { className: "pl-9", placeholder: "Search by agent or notes…", value: search, onChange: (e) => setSearch(e.target.value) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border p-4", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-base font-semibold", children: [
          filtered.length,
          " record",
          filtered.length === 1 ? "" : "s"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Total: ",
          /* @__PURE__ */ jsx("span", { className: "num font-medium text-foreground", children: formatCurrency(total) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Agent" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Range" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Notes" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          filtered.map((e) => {
            const editable = canEdit(e);
            return /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/50 hover:bg-secondary/30", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: agentNames[e.agent_id] ?? "—" }),
              /* @__PURE__ */ jsxs("td", { className: "num px-4 py-3 text-xs text-muted-foreground", children: [
                format(parseISO(e.start_date), "MMM d, yyyy"),
                " → ",
                format(parseISO(e.end_date), "MMM d, yyyy")
              ] }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right font-medium", children: formatCurrency(Number(e.amount)) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-muted-foreground", children: e.notes ?? "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: editable ? /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
                /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "secondary", children: /* @__PURE__ */ jsxs(Link, { to: "/expenses/$expenseId/edit", params: {
                  expenseId: e.id
                }, children: [
                  /* @__PURE__ */ jsx(Pencil, { className: "mr-1 h-3 w-3" }),
                  " Edit"
                ] }) }),
                /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => remove(e.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5 text-destructive" }) })
              ] }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px]", children: "View only" }) })
            ] }, e.id);
          }),
          !loading && filtered.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No expenses yet." }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  ExpensesListPage as component
};
