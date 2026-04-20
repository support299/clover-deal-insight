import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ADD_ONS, LEAD_SOURCES, generateSaleId } from "@/lib/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sales/new")({
  component: SalesEntryPage,
});

const schema = z.object({
  agent_name: z.string().trim().min(2, "Agent name required").max(80),
  team_id: z.string().uuid().optional().nullable(),
  sale_date: z.string().min(1, "Date required"),
  deal_size: z.number({ invalid_type_error: "Enter a number" }).positive("Must be > 0").max(10_000_000),
  carrier: z.string().min(1, "Carrier required"),
  product: z.string().min(1, "Product required"),
  add_ons: z.array(z.string()),
  add_on_amounts: z.record(z.string(), z.number().min(0)),
  lead_source: z.string().optional(),
  cost_per_lead: z.number().min(0).max(10000).optional().nullable(),
  notes: z.string().max(500).optional(),
});

type FormState = {
  agent_name: string;
  team_id: string;
  sale_date: string;
  deal_size: string;
  carrier: string;
  product: string;
  add_ons: string[];
  add_on_amounts: Record<string, string>;
  lead_source: string;
  cost_per_lead: string;
  notes: string;
};

interface CarrierOpt { id: string; name: string }
interface ProductOpt { id: string; name: string; carrier_id: string | null }

function SalesEntryPage() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [carriers, setCarriers] = useState<CarrierOpt[]>([]);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ sale_id: string; date: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [form, setForm] = useState<FormState>({
    agent_name: "",
    team_id: "",
    sale_date: new Date().toISOString().slice(0, 16),
    deal_size: "",
    carrier: "",
    product: "",
    add_ons: [],
    add_on_amounts: {},
    lead_source: "",
    cost_per_lead: "",
    notes: "",
  });

  useEffect(() => {
    supabase.from("teams").select("id, name").order("name").then(({ data }) => {
      if (data) setTeams(data);
    });
    supabase.from("carriers").select("id, name").eq("active", true).order("name").then(({ data }) => {
      if (data) setCarriers(data);
    });
    supabase.from("products").select("id, name, carrier_id").eq("active", true).order("name").then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  useEffect(() => {
    if (profile && !form.agent_name) {
      setForm((f) => ({
        ...f,
        agent_name: profile.display_name,
        team_id: profile.team_id ?? f.team_id,
      }));
    }
  }, [profile]);

  const selectedCarrier = useMemo(
    () => carriers.find((c) => c.name === form.carrier),
    [carriers, form.carrier],
  );
  const filteredProducts = useMemo(
    () => (selectedCarrier ? products.filter((p) => p.carrier_id === selectedCarrier.id) : []),
    [products, selectedCarrier],
  );

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const onCarrierChange = (carrierName: string) => {
    setForm((f) => ({ ...f, carrier: carrierName, product: "" }));
  };

  const toggleAddOn = (a: string) => {
    setForm((f) => {
      const has = f.add_ons.includes(a);
      const add_ons = has ? f.add_ons.filter((x) => x !== a) : [...f.add_ons, a];
      const add_on_amounts = { ...f.add_on_amounts };
      if (has) delete add_on_amounts[a];
      else add_on_amounts[a] = "";
      return { ...f, add_ons, add_on_amounts };
    });
  };

  const setAddOnAmount = (a: string, val: string) => {
    setForm((f) => ({ ...f, add_on_amounts: { ...f.add_on_amounts, [a]: val } }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amounts: Record<string, number> = {};
    for (const a of form.add_ons) {
      const raw = form.add_on_amounts[a];
      if (raw === "" || raw === undefined) {
        setErrors({ [`addon_${a}`]: "Required" });
        toast.error(`Enter an amount for ${a}`);
        return;
      }
      const n = Number(raw);
      if (!isFinite(n) || n < 0) {
        setErrors({ [`addon_${a}`]: "Invalid amount" });
        toast.error(`Invalid amount for ${a}`);
        return;
      }
      amounts[a] = n;
    }
    const parsed = schema.safeParse({
      agent_name: form.agent_name,
      team_id: form.team_id || null,
      sale_date: form.sale_date,
      deal_size: form.deal_size === "" ? NaN : Number(form.deal_size),
      carrier: form.carrier,
      product: form.product,
      add_ons: form.add_ons,
      add_on_amounts: amounts,
      lead_source: form.lead_source || undefined,
      cost_per_lead: form.cost_per_lead === "" ? null : Number(form.cost_per_lead),
      notes: form.notes || undefined,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const e: Record<string, string | undefined> = {};
      Object.entries(flat).forEach(([k, v]) => (e[k] = v?.[0]));
      setErrors(e);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);

    const sale_id = generateSaleId(new Date(parsed.data.sale_date));
    const team = teams.find((t) => t.id === parsed.data.team_id);
    const { error } = await supabase.from("sales").insert({
      sale_id,
      agent_id: user.id,
      agent_name: parsed.data.agent_name,
      team_id: parsed.data.team_id ?? null,
      team_name: team?.name ?? null,
      sale_date: new Date(parsed.data.sale_date).toISOString(),
      deal_size: parsed.data.deal_size,
      carrier: parsed.data.carrier,
      product: parsed.data.product,
      add_ons: parsed.data.add_ons,
      add_on_amounts: parsed.data.add_on_amounts,
      lead_source: parsed.data.lead_source ?? null,
      cost_per_lead: parsed.data.cost_per_lead ?? null,
      notes: parsed.data.notes ?? null,
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setConfirmation({ sale_id, date: new Date().toLocaleString() });
  };

  const resetForm = () => {
    setConfirmation(null);
    setForm({
      ...form,
      deal_size: "",
      carrier: "",
      product: "",
      add_ons: [],
      add_on_amounts: {},
      lead_source: "",
      cost_per_lead: "",
      notes: "",
      sale_date: new Date().toISOString().slice(0, 16),
    });
  };

  if (confirmation) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="surface-card p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 ring-1 ring-success/30">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Sale recorded!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your sale is now live in the dashboard.</p>
          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-left">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Sale ID</div>
            <div className="num mt-1 text-lg font-semibold">{confirmation.sale_id}</div>
            <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Submitted</div>
            <div className="num mt-1 text-sm">{confirmation.date}</div>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Submit another
            </Button>
            <Button variant="secondary" onClick={() => navigate({ to: "/dashboard" })}>
              View dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New sale</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log a closed policy. A unique Sale ID is generated automatically.</p>
      </div>

      <form onSubmit={onSubmit} className="surface-card space-y-8 p-6 sm:p-8">
        <Section title="Sale details">
          <Field label="Agent name" error={errors.agent_name}>
            <Input value={form.agent_name} onChange={(e) => update("agent_name", e.target.value)} />
          </Field>
          <Field label="Team / Manager">
            <Select value={form.team_id || undefined} onValueChange={(v) => update("team_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger>
              <SelectContent>
                {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date of sale" error={errors.sale_date}>
            <Input type="datetime-local" value={form.sale_date} onChange={(e) => update("sale_date", e.target.value)} />
          </Field>
          <Field label="Deal size ($)" error={errors.deal_size}>
            <Input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={form.deal_size} onChange={(e) => update("deal_size", e.target.value)} />
          </Field>
        </Section>

        <Section title="Coverage">
          <Field label="Carrier" error={errors.carrier}>
            <Select value={form.carrier || undefined} onValueChange={(v) => update("carrier", v)}>
              <SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger>
              <SelectContent>
                {CARRIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Product" error={errors.product}>
            <Select value={form.product || undefined} onValueChange={(v) => update("product", v)}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Add-ons</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ADD_ONS.map((a) => {
                const checked = form.add_ons.includes(a);
                return (
                  <label
                    key={a}
                    className={
                      "flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm transition-colors " +
                      (checked ? "border-primary/50 bg-primary/10" : "border-border hover:bg-secondary/50")
                    }
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleAddOn(a)} />
                    <span>{a}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="Lead info (optional)">
          <Field label="Lead source">
            <Select value={form.lead_source || undefined} onValueChange={(v) => update("lead_source", v)}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {LEAD_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cost per lead ($)">
            <Input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={form.cost_per_lead} onChange={(e) => update("cost_per_lead", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Label htmlFor="notes" className="mb-1.5 block">Notes</Label>
            <Textarea id="notes" maxLength={500} rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Anything noteworthy about this deal…" />
            <div className="mt-1 text-right text-xs text-muted-foreground">{form.notes.length}/500</div>
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/70">Cancel</Link>
          <Button type="submit" disabled={submitting} className="min-w-[160px]">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit sale"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
