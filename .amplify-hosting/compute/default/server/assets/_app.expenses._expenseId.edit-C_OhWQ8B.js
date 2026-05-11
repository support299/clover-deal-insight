import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { i as Route, s as supabase } from "./router-CvBcNStb.js";
import { E as ExpenseForm } from "./ExpenseForm-CanKTykf.js";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
import "date-fns";
import "./textarea-BKK-Ohyn.js";
import "./DateField-ClvYY_8u.js";
import "react-day-picker";
import "@radix-ui/react-popover";
function EditExpensePage() {
  const {
    expenseId
  } = Route.useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.from("expenses").select("*").eq("id", expenseId).maybeSingle().then(({
      data
    }) => {
      if (!active) return;
      setExpense(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [expenseId]);
  if (loading) return /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" });
  if (!expense) return /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Expense not found." });
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Edit expense" }) }),
    /* @__PURE__ */ jsx(ExpenseForm, { existing: expense, onSaved: () => navigate({
      to: "/expenses"
    }), onCancel: () => navigate({
      to: "/expenses"
    }) })
  ] });
}
export {
  EditExpensePage as component
};
