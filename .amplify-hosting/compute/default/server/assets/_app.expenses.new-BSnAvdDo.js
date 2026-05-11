import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { E as ExpenseForm } from "./ExpenseForm-CanKTykf.js";
import "react";
import "date-fns";
import "sonner";
import "./router-CvBcNStb.js";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
import "./textarea-BKK-Ohyn.js";
import "./DateField-ClvYY_8u.js";
import "react-day-picker";
import "@radix-ui/react-popover";
function NewExpensePage() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: "Log expense" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Record an expense for a date range. It will be split equally across your sales in that period." })
    ] }),
    /* @__PURE__ */ jsx(ExpenseForm, { onSaved: () => navigate({
      to: "/expenses"
    }), onCancel: () => navigate({
      to: "/expenses"
    }) })
  ] });
}
export {
  NewExpensePage as component
};
