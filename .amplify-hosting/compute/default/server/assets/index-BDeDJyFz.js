import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useAuth, B as Button } from "./router-CvBcNStb.js";
import { Zap, BarChart3, Trophy } from "lucide-react";
import { l as logo } from "./aftermath-logo-BME8kEpR.js";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function Index() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [loading, user, navigate]);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex min-h-screen max-w-[1100px] flex-col items-center justify-center px-6 py-12 text-center", children: [
    /* @__PURE__ */ jsx("img", { src: logo, alt: "Aftermath Insurance Group", className: "mb-8 h-20 w-auto sm:h-24" }),
    /* @__PURE__ */ jsxs("h1", { className: "text-balance text-4xl font-bold tracking-tight sm:text-6xl", children: [
      /* @__PURE__ */ jsx("span", { className: "gradient-text", children: "Aftermath Insurance Group" }),
      " Performance Dashboard"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg", children: "Log every policy in seconds, watch revenue, attach rates, and CPA update in real time, and turn your team into a leaderboard‑driven sales machine." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Sign in" }) }),
      /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", variant: "secondary", children: /* @__PURE__ */ jsx(Link, { to: "/signup", children: "Create account" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-16 grid w-full grid-cols-1 gap-4 sm:grid-cols-3", children: [{
      icon: Zap,
      title: "Frictionless entry",
      desc: "Submit a sale in under 30 seconds with auto-generated IDs."
    }, {
      icon: BarChart3,
      title: "Live analytics",
      desc: "Revenue, attach rates, CPA, and trends update instantly."
    }, {
      icon: Trophy,
      title: "Leaderboards",
      desc: "Rank agents and teams daily, weekly, or monthly."
    }].map((f) => /* @__PURE__ */ jsxs("div", { className: "surface-card p-5 text-left", children: [
      /* @__PURE__ */ jsx(f.icon, { className: "h-5 w-5 text-accent" }),
      /* @__PURE__ */ jsx("div", { className: "mt-3 font-semibold", children: f.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: f.desc })
    ] }, f.title)) })
  ] }) });
}
export {
  Index as component
};
