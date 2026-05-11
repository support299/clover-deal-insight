import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { PlusCircle, Search, Pencil } from "lucide-react";
import { u as useAuth, s as supabase, B as Button, I as Input } from "./router-CvBcNStb.js";
import { f as formatCurrency } from "./sales-Bp_442nI.js";
import { B as Badge } from "./badge-C4fVAAET.js";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function SalesListPage() {
  const {
    user,
    profile,
    roles
  } = useAuth();
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    let q = supabase.from("sales").select("*").order("sale_date", {
      ascending: false
    }).limit(500);
    if (!isAdmin && !isManager) q = q.eq("agent_id", user.id);
    else if (isManager && !isAdmin && profile?.team_id) q = q.eq("team_id", profile.team_id);
    q.then(({
      data
    }) => {
      if (!active) return;
      setSales(data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user?.id, isAdmin, isManager, profile?.team_id]);
  const canEdit = (s) => isAdmin || isManager && s.team_id && profile?.team_id && s.team_id === profile.team_id || s.agent_id === user?.id;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => s.sale_id.toLowerCase().includes(q) || s.agent_name.toLowerCase().includes(q) || (s.customer_name?.toLowerCase().includes(q) ?? false) || s.carrier.toLowerCase().includes(q));
  }, [sales, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Sales" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isAdmin ? "All sales records." : isManager ? "Sales for your team." : "Your sales records." })
      ] }),
      /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/sales/new", children: [
        /* @__PURE__ */ jsx(PlusCircle, { className: "mr-2 h-4 w-4" }),
        " New sale"
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "surface-card p-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { className: "pl-9", placeholder: "Search by sale ID, agent, customer, carrier…", value: search, onChange: (e) => {
        setSearch(e.target.value);
        setPage(1);
      } })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between border-b border-border p-4", children: /* @__PURE__ */ jsxs("h2", { className: "text-base font-semibold", children: [
        filtered.length,
        " record",
        filtered.length === 1 ? "" : "s"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Sale ID" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Agent" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Customer" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Deal" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left", children: "Carrier" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          pageRows.map((s) => {
            const editable = canEdit(s);
            return /* @__PURE__ */ jsxs("tr", { className: "border-t border-border/50 hover:bg-secondary/30", children: [
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-xs", children: s.sale_id }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: s.agent_name }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: s.customer_name ?? "—" }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-xs text-muted-foreground", children: format(new Date(s.sale_date), "MMM d, yyyy h:mm a") }),
              /* @__PURE__ */ jsx("td", { className: "num px-4 py-3 text-right font-medium", children: formatCurrency(Number(s.deal_size)) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: s.carrier }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: editable ? /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "secondary", children: /* @__PURE__ */ jsxs(Link, { to: "/sales/$saleId/edit", params: {
                saleId: s.id
              }, children: [
                /* @__PURE__ */ jsx(Pencil, { className: "mr-1 h-3 w-3" }),
                " Edit"
              ] }) }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px]", children: "View only" }) })
            ] }, s.id);
          }),
          !loading && pageRows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No sales records found." }) })
        ] })
      ] }) }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-border p-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Page ",
          page,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Prev" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "sm", disabled: page === totalPages, onClick: () => setPage((p) => p + 1), children: "Next" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SalesListPage as component
};
