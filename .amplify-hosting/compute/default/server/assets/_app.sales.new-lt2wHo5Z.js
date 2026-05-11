import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { z } from "zod";
import { Plus, X, Trash2, CheckCircle2, PlusCircle, Loader2 } from "lucide-react";
import { u as useServerFn, a as updateGhlContactFromSale } from "./ghl.functions-CGCmj2yR.js";
import { u as useAuth, s as supabase, I as Input, e as cn, B as Button, L as Label, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./router-CvBcNStb.js";
import { f as formatCurrency, g as generateSaleId } from "./sales-Bp_442nI.js";
import { T as Textarea } from "./textarea-BKK-Ohyn.js";
import { toast } from "sonner";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function CustomerAutocomplete({ value, onChange, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ghlUserId, setGhlUserId] = useState(null);
  const wrapRef = useRef(null);
  const skipNextSearch = useRef(false);
  const { user } = useAuth();
  const query = value.trim();
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("ghl_users").select("id").eq("app_user_id", user.id).maybeSingle();
      if (!cancelled) setGhlUserId(data?.id ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (query.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.from("ghl_contacts").select("id, name, email, phone, user_id").ilike("name", `%${query}%`).order("name").limit(8);
      if (cancelled) return;
      if (error) {
        console.error("[CustomerAutocomplete]", error);
        setResults([]);
      } else {
        setResults(data ?? []);
        setHighlight(0);
      }
      setLoading(false);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);
  useEffect(() => {
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const showList = open && query.length >= 2;
  const pick = (c) => {
    skipNextSearch.current = true;
    onChange(c.name ?? "");
    onSelect?.(c);
    setOpen(false);
    setResults([]);
  };
  const formUrl = ghlUserId ? `https://calendar.pinnaclewellnessagencies.com/widget/form/gPzkXchRgBxBPrEbjYxj?id=${ghlUserId}` : `https://calendar.pinnaclewellnessagencies.com/widget/form/gPzkXchRgBxBPrEbjYxj`;
  return /* @__PURE__ */ jsxs("div", { ref: wrapRef, className: "relative", children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        value,
        placeholder,
        onChange: (e) => {
          onChange(e.target.value);
          setOpen(true);
        },
        onFocus: () => setOpen(true),
        onKeyDown: (e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter" && results[highlight]) {
            e.preventDefault();
            pick(results[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        },
        autoComplete: "off"
      }
    ),
    showList && /* @__PURE__ */ jsxs("div", { className: "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md", children: [
      loading && /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-xs text-muted-foreground", children: "Searching…" }),
      !loading && results.length === 0 && /* @__PURE__ */ jsx("div", { className: "px-3 py-2 text-xs text-muted-foreground", children: "No contacts found" }),
      !loading && results.map((c, i) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onMouseEnter: () => setHighlight(i),
          onClick: () => pick(c),
          className: cn(
            "block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60",
            i === highlight && "bg-muted/60"
          ),
          children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: c.name || "(unnamed)" }),
            c.user_id && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "User ID: ",
              c.user_id
            ] }),
            (c.email || c.phone) && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: [c.email, c.phone].filter(Boolean).join(" · ") })
          ]
        },
        c.id
      )),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            skipNextSearch.current = true;
            onChange("");
            setResults([]);
            setShowAddModal(true);
            setOpen(false);
          },
          className: "flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm font-medium text-primary hover:bg-accent",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
            "Add contact"
          ]
        }
      )
    ] }),
    showAddModal && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-[100] flex items-center justify-center bg-background/30 p-4 backdrop-blur-md",
        onClick: () => setShowAddModal(false),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative h-[85vh] w-full max-w-2xl overflow-hidden rounded-lg bg-background shadow-xl",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowAddModal(false),
                  className: "absolute right-2 top-2 z-10 rounded-md bg-background/90 p-1.5 text-foreground shadow hover:bg-accent",
                  "aria-label": "Close",
                  children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "iframe",
                {
                  src: formUrl,
                  className: "h-full w-full border-0",
                  title: "Add contact"
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
const lineItemSchema = z.object({
  kind: z.enum(["health", "life", "addon"]),
  carrier: z.string(),
  product: z.string().min(1, "Product required"),
  amount: z.number().min(0, "Amount must be ≥ 0")
});
const schema = z.object({
  agent_name: z.string().trim().min(2, "Agent name required").max(80),
  team_id: z.string().uuid().optional().nullable(),
  sale_date: z.string().min(1, "Date required"),
  customer_name: z.string().trim().min(2, "Customer name required").max(120),
  line_items: z.array(lineItemSchema).min(1, "Add at least one line item"),
  lead_source: z.string().optional(),
  notes: z.string().max(500).optional()
});
function newLineItem() {
  return {
    id: crypto.randomUUID(),
    kind: "",
    carrier: "",
    product: "",
    amount: ""
  };
}
function SalesEntryPage() {
  const {
    profile,
    user,
    session
  } = useAuth();
  const navigate = useNavigate();
  const updateGhlFn = useServerFn(updateGhlContactFromSale);
  const [teams, setTeams] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [products, setProducts] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [form, setForm] = useState({
    agent_name: "",
    team_id: "",
    sale_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    customer_name: "",
    line_items: [newLineItem()],
    lead_source: "",
    notes: ""
  });
  useEffect(() => {
    supabase.from("teams").select("id, name").order("name").then(({
      data
    }) => {
      if (data) setTeams(data);
    });
    supabase.from("carriers").select("id, name, carrier_type").eq("active", true).order("name").then(({
      data
    }) => {
      if (data) setCarriers(data);
    });
    supabase.from("products").select("id, name, carrier_id").eq("active", true).order("name").then(({
      data
    }) => {
      if (data) setProducts(data);
    });
    supabase.from("add_ons").select("id, name").eq("active", true).order("name").then(({
      data
    }) => {
      if (data) setAddOns(data);
    });
    supabase.from("lead_sources").select("name").eq("active", true).order("name").then(({
      data
    }) => {
      if (data) setLeadSources(data.map((r) => r.name));
    });
  }, []);
  useEffect(() => {
    if (profile && !form.agent_name) {
      setForm((f) => ({
        ...f,
        agent_name: profile.display_name,
        team_id: profile.team_id ?? f.team_id
      }));
    }
  }, [profile]);
  const update = (key, val) => setForm((f) => ({
    ...f,
    [key]: val
  }));
  const updateLine = (id, patch) => {
    setForm((f) => ({
      ...f,
      line_items: f.line_items.map((li) => li.id === id ? {
        ...li,
        ...patch
      } : li)
    }));
  };
  const onLineKindChange = (id, kind) => {
    updateLine(id, {
      kind,
      carrier: "",
      product: ""
    });
  };
  const onLineCarrierChange = (id, carrierName) => {
    updateLine(id, {
      carrier: carrierName,
      product: ""
    });
  };
  const addLine = () => setForm((f) => ({
    ...f,
    line_items: [...f.line_items, newLineItem()]
  }));
  const removeLine = (id) => setForm((f) => ({
    ...f,
    line_items: f.line_items.length > 1 ? f.line_items.filter((li) => li.id !== id) : f.line_items
  }));
  const total = useMemo(() => form.line_items.reduce((sum, li) => sum + (Number(li.amount) || 0), 0), [form.line_items]);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedContactId) {
      toast.error("Please select a contact from the suggestions before submitting.");
      return;
    }
    const normalizedItems = [];
    for (const li of form.line_items) {
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
      if (li.amount === "" || li.amount === void 0) {
        toast.error("Each line item needs an amount");
        return;
      }
      const n = Number(li.amount);
      if (!isFinite(n) || n < 0) {
        toast.error(`Invalid amount on line item`);
        return;
      }
      normalizedItems.push({
        kind: li.kind,
        carrier: li.carrier,
        product: li.product,
        amount: n
      });
    }
    const parsed = schema.safeParse({
      agent_name: form.agent_name,
      team_id: form.team_id || null,
      sale_date: form.sale_date,
      customer_name: form.customer_name,
      line_items: normalizedItems,
      lead_source: form.lead_source || void 0,
      notes: form.notes || void 0
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const e2 = {};
      Object.entries(flat).forEach(([k, v]) => e2[k] = v?.[0]);
      setErrors(e2);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    const sale_id = generateSaleId(new Date(parsed.data.sale_date));
    const team = teams.find((t) => t.id === parsed.data.team_id);
    const dealSize = parsed.data.line_items.reduce((s, li) => s + li.amount, 0);
    const first = parsed.data.line_items[0];
    const {
      error
    } = await supabase.from("sales").insert({
      sale_id,
      agent_id: user.id,
      agent_name: parsed.data.agent_name,
      team_id: parsed.data.team_id ?? null,
      team_name: team?.name ?? null,
      sale_date: new Date(parsed.data.sale_date).toISOString(),
      customer_name: parsed.data.customer_name,
      deal_size: dealSize,
      carrier: first.carrier || (first.kind === "addon" ? "Add-on" : ""),
      product: first.product,
      add_ons: [],
      add_on_amounts: {},
      line_items: parsed.data.line_items,
      lead_source: parsed.data.lead_source ?? null,
      notes: parsed.data.notes ?? null
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    try {
      const accessToken = session?.access_token;
      if (accessToken && selectedContactId) {
        await updateGhlFn({
          data: {
            accessToken,
            contactId: selectedContactId,
            lineItems: parsed.data.line_items.map((li) => ({
              kind: li.kind,
              carrier: li.carrier,
              product: li.product
            }))
          }
        });
      }
    } catch (err) {
      console.error("[GHL update]", err);
      toast.warning("Sale saved, but failed to update GHL contact fields.");
    }
    setSubmitting(false);
    setSelectedContactId(null);
    setConfirmation({
      sale_id,
      date: (/* @__PURE__ */ new Date()).toLocaleString()
    });
  };
  const resetForm = () => {
    setConfirmation(null);
    setForm({
      ...form,
      customer_name: "",
      line_items: [newLineItem()],
      lead_source: "",
      notes: "",
      sale_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16)
    });
  };
  if (confirmation) {
    return /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-xl", children: /* @__PURE__ */ jsxs("div", { className: "surface-card p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 ring-1 ring-success/30", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-7 w-7 text-success" }) }),
      /* @__PURE__ */ jsx("h1", { className: "mt-5 text-2xl font-bold tracking-tight", children: "Sale recorded!" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Your sale is now live in the dashboard." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-lg border border-border bg-muted/40 p-4 text-left", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Sale ID" }),
        /* @__PURE__ */ jsx("div", { className: "num mt-1 text-lg font-semibold", children: confirmation.sale_id }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs uppercase tracking-wider text-muted-foreground", children: "Submitted" }),
        /* @__PURE__ */ jsx("div", { className: "num mt-1 text-sm", children: confirmation.date })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: resetForm, children: [
          /* @__PURE__ */ jsx(PlusCircle, { className: "mr-2 h-4 w-4" }),
          " Submit another"
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => navigate({
          to: "/dashboard"
        }), children: "View dashboard" })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "New sale" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Log a closed policy. A unique Sale ID is generated automatically." })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "surface-card space-y-8 p-6 sm:p-8", children: [
      /* @__PURE__ */ jsxs(Section, { title: "Sale details", children: [
        /* @__PURE__ */ jsx(Field, { label: "Agent name", error: errors.agent_name, children: /* @__PURE__ */ jsx(Input, { value: form.agent_name, readOnly: true, disabled: true }) }),
        /* @__PURE__ */ jsx(Field, { label: "Team / Manager", children: /* @__PURE__ */ jsx(Input, { value: form.team_id ? teams.find((t) => t.id === form.team_id)?.name ?? "Loading…" : "— No team assigned —", readOnly: true, disabled: true }) }),
        /* @__PURE__ */ jsx(Field, { label: "Date of sale", error: errors.sale_date, children: /* @__PURE__ */ jsx(Input, { type: "datetime-local", value: form.sale_date, onChange: (e) => update("sale_date", e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Customer name", error: errors.customer_name, children: /* @__PURE__ */ jsx(CustomerAutocomplete, { value: form.customer_name, onChange: (v) => {
          update("customer_name", v);
          setSelectedContactId(null);
        }, onSelect: (c) => setSelectedContactId(c.id), placeholder: "Search a contact…" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Line items" }),
          /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: addLine, children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-1 h-3 w-3" }),
            " Add line item"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: form.line_items.map((li, idx) => /* @__PURE__ */ jsx(LineItemRow, { index: idx, item: li, carriers, products, addOns, canRemove: form.line_items.length > 1, onKindChange: (v) => onLineKindChange(li.id, v), onCarrierChange: (v) => onLineCarrierChange(li.id, v), onProductChange: (v) => updateLine(li.id, {
          product: v
        }), onAmountChange: (v) => updateLine(li.id, {
          amount: v
        }), onRemove: () => removeLine(li.id) }, li.id)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-end gap-3 border-t border-border pt-3 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsx("span", { className: "num text-base font-semibold", children: formatCurrency(total) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Section, { title: "Lead info (optional)", children: [
        /* @__PURE__ */ jsx(Field, { label: "Lead source", children: /* @__PURE__ */ jsxs(Select, { value: form.lead_source || void 0, onValueChange: (v) => update("lead_source", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select source" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: leadSources.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s)) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "notes", className: "mb-1.5 block", children: "Notes" }),
          /* @__PURE__ */ jsx(Textarea, { id: "notes", maxLength: 500, rows: 3, value: form.notes, onChange: (e) => update("notes", e.target.value), placeholder: "Anything noteworthy about this deal…" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 text-right text-xs text-muted-foreground", children: [
            form.notes.length,
            "/500"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "inline-flex items-center justify-center rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/70", children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, className: "min-w-[160px]", children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
          " Submitting…"
        ] }) : "Submit sale" })
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
  error,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsx(Label, { children: label }),
    children,
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
  ] });
}
export {
  LineItemRow,
  SalesEntryPage as component
};
