import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Loader2, ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { g as Route, u as useAuth, s as supabase, B as Button, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, L as Label } from "./router-CvBcNStb.js";
import { f as formatCurrency } from "./sales-Bp_442nI.js";
import { T as Textarea } from "./textarea-BKK-Ohyn.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function newLineItem() {
  return {
    id: crypto.randomUUID(),
    kind: "",
    carrier: "",
    product: "",
    amount: ""
  };
}
function SalesEditPage() {
  const {
    saleId
  } = Route.useParams();
  const {
    user,
    profile,
    roles
  } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");
  const isManager = roles.includes("manager");
  const [sale, setSale] = useState(null);
  const [teams, setTeams] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [products, setProducts] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [saleDate, setSaleDate] = useState("");
  const [teamId, setTeamId] = useState("");
  const [lineItems, setLineItems] = useState([newLineItem()]);
  const [leadSource, setLeadSource] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([supabase.from("sales").select("*").eq("id", saleId).maybeSingle(), supabase.from("teams").select("id, name").order("name"), supabase.from("carriers").select("id, name, carrier_type").eq("active", true).order("name"), supabase.from("products").select("id, name, carrier_id").eq("active", true).order("name"), supabase.from("add_ons").select("id, name").eq("active", true).order("name"), supabase.from("lead_sources").select("name").eq("active", true).order("name")]).then(([sRes, tRes, cRes, pRes, aRes, lRes]) => {
      if (!active) return;
      if (!sRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const s = sRes.data;
      setSale(s);
      setCustomerName(s.customer_name ?? "");
      setSaleDate(new Date(s.sale_date).toISOString().slice(0, 16));
      setTeamId(s.team_id ?? "");
      const carriersData = cRes.data ?? [];
      const addOnsData = aRes.data ?? [];
      const inferKind = (carrierName, productName) => {
        if (addOnsData.some((a) => a.name === productName)) return "addon";
        const c = carriersData.find((cc) => cc.name === carrierName);
        if (c?.carrier_type === "life") return "life";
        if (c?.carrier_type === "health") return "health";
        return "";
      };
      const rawItems = Array.isArray(s.line_items) ? s.line_items : [];
      if (rawItems.length > 0) {
        setLineItems(rawItems.map((it) => {
          const carrier = String(it.carrier ?? "");
          const product = String(it.product ?? "");
          const kind = it.kind || inferKind(carrier, product);
          return {
            id: crypto.randomUUID(),
            kind,
            carrier: kind === "addon" ? "" : carrier,
            product,
            amount: it.amount != null ? String(it.amount) : ""
          };
        }));
      } else if (s.carrier || s.product) {
        const kind = inferKind(s.carrier ?? "", s.product ?? "");
        setLineItems([{
          id: crypto.randomUUID(),
          kind,
          carrier: kind === "addon" ? "" : s.carrier ?? "",
          product: s.product ?? "",
          amount: s.deal_size != null ? String(s.deal_size) : ""
        }]);
      } else {
        setLineItems([newLineItem()]);
      }
      setLeadSource(s.lead_source ?? "");
      setNotes(s.notes ?? "");
      setTeams(tRes.data ?? []);
      setCarriers(carriersData);
      setProducts(pRes.data ?? []);
      setAddOns(addOnsData);
      setLeadSources((lRes.data ?? []).map((r) => r.name));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [saleId]);
  const canEdit = useMemo(() => {
    if (!sale || !user) return false;
    if (isAdmin) return true;
    if (isManager && sale.team_id && profile?.team_id && sale.team_id === profile.team_id) return true;
    return sale.agent_id === user.id;
  }, [sale, user, profile, isAdmin, isManager]);
  const updateLine = (id, patch) => setLineItems((prev) => prev.map((li) => li.id === id ? {
    ...li,
    ...patch
  } : li));
  const addLine = () => setLineItems((p) => [...p, newLineItem()]);
  const removeLine = (id) => setLineItems((p) => p.length > 1 ? p.filter((li) => li.id !== id) : p);
  const total = useMemo(() => lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0), [lineItems]);
  const onSave = async (e) => {
    e.preventDefault();
    if (!sale || !canEdit) return;
    if (!customerName.trim()) {
      toast.error("Customer name required");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }
    const normalized = [];
    for (const li of lineItems) {
      if (!li.kind) {
        toast.error("Select a type for each line item");
        return;
      }
      if (li.kind !== "addon" && !li.carrier) {
        toast.error("Each insurance line item needs a carrier");
        return;
      }
      if (!li.product) {
        toast.error("Each line item needs a product");
        return;
      }
      if (li.amount === "") {
        toast.error("Each line item needs an amount");
        return;
      }
      const n = Number(li.amount);
      if (!isFinite(n) || n < 0) {
        toast.error("Invalid amount on a line item");
        return;
      }
      normalized.push({
        kind: li.kind,
        carrier: li.carrier,
        product: li.product,
        amount: n
      });
    }
    setSaving(true);
    const team = teams.find((t) => t.id === teamId);
    const dealSize = normalized.reduce((s, li) => s + li.amount, 0);
    const first = normalized[0];
    const {
      error
    } = await supabase.from("sales").update({
      customer_name: customerName,
      sale_date: new Date(saleDate).toISOString(),
      team_id: teamId || null,
      team_name: team?.name ?? null,
      deal_size: dealSize,
      carrier: first.carrier || (first.kind === "addon" ? "Add-on" : ""),
      product: first.product,
      line_items: normalized,
      add_ons: [],
      add_on_amounts: {},
      lead_source: leadSource || null,
      notes: notes || null
    }).eq("id", sale.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sale updated");
    navigate({
      to: "/sales"
    });
  };
  const onDelete = async () => {
    if (!sale || !isAdmin) return;
    if (!confirm(`Delete sale ${sale.sale_id}? This cannot be undone.`)) return;
    const {
      error
    } = await supabase.from("sales").delete().eq("id", sale.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sale deleted");
    navigate({
      to: "/sales"
    });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (notFound || !sale) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-xl text-center", children: /* @__PURE__ */ jsxs("div", { className: "surface-card p-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Sale not found" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "It may have been deleted or you don't have access." }),
      /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/sales", children: "Back to sales" }) })
    ] }) });
  }
  if (!canEdit) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-xl text-center", children: /* @__PURE__ */ jsxs("div", { className: "surface-card p-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "No edit access" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "You don't have permission to edit this sale." }),
      /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/sales", children: "Back to sales" }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "-ml-2 mb-2", children: /* @__PURE__ */ jsxs(Link, { to: "/sales", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
        " All sales"
      ] }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Edit sale" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        "Sale ID: ",
        /* @__PURE__ */ jsx("span", { className: "num", children: sale.sale_id }),
        " · Agent: ",
        sale.agent_name
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: onSave, className: "surface-card space-y-8 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsxs(Section, { title: "Sale details", children: [
        /* @__PURE__ */ jsx(Field, { label: "Customer name", children: /* @__PURE__ */ jsx(Input, { value: customerName, onChange: (e) => setCustomerName(e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Date of sale", children: /* @__PURE__ */ jsx(Input, { type: "datetime-local", value: saleDate, onChange: (e) => setSaleDate(e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Team", children: /* @__PURE__ */ jsxs(Select, { value: teamId || "__none", onValueChange: (v) => setTeamId(v === "__none" ? "" : v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "__none", children: "— No team —" }),
            teams.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.id, children: t.name }, t.id))
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Line items" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: addLine, children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-1 h-3 w-3" }),
            " Add line item"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: lineItems.map((li, idx) => /* @__PURE__ */ jsx(LineItemRow, { index: idx, item: li, carriers, products, addOns, canRemove: lineItems.length > 1, onKindChange: (v) => updateLine(li.id, {
          kind: v,
          carrier: "",
          product: ""
        }), onCarrierChange: (v) => updateLine(li.id, {
          carrier: v,
          product: ""
        }), onProductChange: (v) => updateLine(li.id, {
          product: v
        }), onAmountChange: (v) => updateLine(li.id, {
          amount: v
        }), onRemove: () => removeLine(li.id) }, li.id)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-end gap-3 border-t border-border pt-3 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsx("span", { className: "num text-base font-semibold", children: formatCurrency(total) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Section, { title: "Lead info", children: [
        /* @__PURE__ */ jsx(Field, { label: "Lead source", children: /* @__PURE__ */ jsxs(Select, { value: leadSource || "__none", onValueChange: (v) => setLeadSource(v === "__none" ? "" : v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "__none", children: "— None —" }),
            leadSources.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s))
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "mb-1.5 block", children: "Notes" }),
          /* @__PURE__ */ jsx(Textarea, { rows: 3, maxLength: 500, value: notes, onChange: (e) => setNotes(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-between", children: [
        isAdmin ? /* @__PURE__ */ jsxs(Button, { type: "button", variant: "destructive", onClick: onDelete, children: [
          /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
          " Delete"
        ] }) : /* @__PURE__ */ jsx("div", {}),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "secondary", children: /* @__PURE__ */ jsx(Link, { to: "/sales", children: "Cancel" }) }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, className: "min-w-[140px]", children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
            " Saving…"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
            " Save changes"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
function LineItemRow({
  index,
  item,
  carriers,
  products,
  addOns,
  canRemove,
  onKindChange,
  onCarrierChange,
  onProductChange,
  onAmountChange,
  onRemove
}) {
  const isAddon = item.kind === "addon";
  const filteredCarriers = item.kind && item.kind !== "addon" ? carriers.filter((c) => c.carrier_type === item.kind) : [];
  const selectedCarrier = carriers.find((c) => c.name === item.carrier);
  const filteredProducts = isAddon ? addOns.map((a) => ({
    id: a.id,
    name: a.name
  })) : selectedCarrier ? products.filter((p) => p.carrier_id === selectedCarrier.id) : [];
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border bg-muted/20 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
        "Item #",
        index + 1
      ] }),
      canRemove && /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: onRemove, className: "h-7 px-2 text-destructive hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "mb-1 block text-xs", children: "Type" }),
        /* @__PURE__ */ jsxs(Select, { value: item.kind || void 0, onValueChange: (v) => onKindChange(v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select type" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "health", children: "Health Insurance" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "life", children: "Life Insurance" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "addon", children: "Add-on" })
          ] })
        ] })
      ] }),
      !isAddon && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "mb-1 block text-xs", children: "Carrier" }),
        /* @__PURE__ */ jsxs(Select, { value: item.carrier || void 0, onValueChange: onCarrierChange, disabled: !item.kind, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: item.kind ? "Select carrier" : "Pick a type first" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            filteredCarriers.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.name, children: c.name }, c.id)),
            item.kind && filteredCarriers.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-2 py-1.5 text-xs text-muted-foreground", children: "No carriers for this type" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "mb-1 block text-xs", children: isAddon ? "Add-on" : "Product" }),
        /* @__PURE__ */ jsxs(Select, { value: item.product || void 0, onValueChange: onProductChange, disabled: isAddon ? !item.kind : !item.carrier, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: isAddon ? item.kind ? "Select add-on" : "Pick a type first" : item.carrier ? "Select product" : "Pick a carrier first" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            filteredProducts.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p.name, children: p.name }, p.id)),
            (isAddon && item.kind && filteredProducts.length === 0 || !isAddon && item.carrier && filteredProducts.length === 0) && /* @__PURE__ */ jsx("div", { className: "px-2 py-1.5 text-xs text-muted-foreground", children: isAddon ? "No add-ons available" : "No products for this carrier" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "mb-1 block text-xs", children: "Annual Premium ($)" }),
        /* @__PURE__ */ jsx(Input, { type: "number", inputMode: "decimal", min: "0", step: "0.01", placeholder: "0.00", value: item.amount, onChange: (e) => onAmountChange(e.target.value) })
      ] })
    ] })
  ] });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: title }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx(Label, { children: label }),
    children
  ] });
}
export {
  SalesEditPage as component
};
