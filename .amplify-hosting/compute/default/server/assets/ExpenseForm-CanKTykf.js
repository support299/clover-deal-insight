import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { parseISO } from "date-fns";
import { toast } from "sonner";
import { u as useAuth, I as Input, B as Button, s as supabase } from "./router-CvBcNStb.js";
import { T as Textarea } from "./textarea-BKK-Ohyn.js";
import { D as DateField } from "./DateField-ClvYY_8u.js";
function ExpenseForm({ existing, onSaved, onCancel }) {
  const { user } = useAuth();
  const [from, setFrom] = useState(existing ? parseISO(existing.start_date) : void 0);
  const [to, setTo] = useState(existing ? parseISO(existing.end_date) : void 0);
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!user) {
      toast.error("Not signed in");
      return;
    }
    if (!from || !to) {
      toast.error("Pick a date range");
      return;
    }
    if (to < from) {
      toast.error("End date must be after start date");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    const payload = {
      amount: amt,
      start_date: from.toISOString().slice(0, 10),
      end_date: to.toISOString().slice(0, 10),
      notes: notes.trim() || null
    };
    let error;
    if (existing) {
      ({ error } = await supabase.from("expenses").update(payload).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("expenses").insert({ ...payload, agent_id: user.id }));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(existing ? "Expense updated" : "Expense logged");
    onSaved();
  };
  return /* @__PURE__ */ jsxs("div", { className: "surface-card space-y-5 p-5 sm:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsx(DateField, { label: "From", value: from, onChange: setFrom, max: to }),
      /* @__PURE__ */ jsx(DateField, { label: "To", value: to, onChange: setTo, min: from })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Amount" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          type: "number",
          inputMode: "decimal",
          step: "0.01",
          min: "0",
          placeholder: "0.00",
          value: amount,
          onChange: (e) => setAmount(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Notes" }),
      /* @__PURE__ */ jsx(
        Textarea,
        {
          rows: 3,
          placeholder: "Optional notes",
          value: notes,
          onChange: (e) => setNotes(e.target.value),
          maxLength: 1e3
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onCancel, disabled: saving, children: "Cancel" }),
      /* @__PURE__ */ jsx(Button, { onClick: submit, disabled: saving, children: saving ? "Saving…" : existing ? "Save changes" : "Log expense" })
    ] })
  ] });
}
export {
  ExpenseForm as E
};
