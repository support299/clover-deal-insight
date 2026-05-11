import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, useLocation, Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useAuth, h as highestRole, s as supabase, B as Button } from "./router-CvBcNStb.js";
import { LayoutDashboard, Trophy, Users, Receipt, Wallet, Settings, LogOut } from "lucide-react";
import { B as Badge } from "./badge-C4fVAAET.js";
import { l as logo } from "./aftermath-logo-BME8kEpR.js";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
function TopNav() {
  const { profile, roles, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = highestRole(roles);
  const canManage = roles.includes("admin") || roles.includes("manager");
  const [ghlUserId, setGhlUserId] = useState(null);
  useEffect(() => {
    if (!user?.id) {
      setGhlUserId(null);
      return;
    }
    let cancelled = false;
    supabase.from("ghl_users").select("id").eq("app_user_id", user.id).maybeSingle().then(({ data }) => {
      if (!cancelled) setGhlUserId(data?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leaderboards", label: "Leaderboards", icon: Trophy },
    ...canManage ? [{ to: "/agents", label: "Agents", icon: Users }] : [],
    { to: "/sales", label: "Sales", icon: Receipt },
    { to: "/expenses", label: "Expenses", icon: Wallet },
    { to: "/settings", label: "Settings", icon: Settings }
  ];
  return /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: [
    /* @__PURE__ */ jsxs("div", { className: "mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "flex items-center gap-3", "aria-label": "Performance Dashboard", children: [
        /* @__PURE__ */ jsx("img", { src: logo, alt: "Aftermath Insurance Group", className: "h-9 w-auto" }),
        /* @__PURE__ */ jsx("span", { className: "hidden text-sm font-medium tracking-tight text-muted-foreground sm:inline", children: "Performance Dashboard" })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "hidden items-center gap-1 md:flex", children: items.map(({ to, label, icon: Icon }) => {
        const active = location.pathname.startsWith(to);
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to,
            className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " + (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"),
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
              label
            ]
          },
          to
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden text-right sm:block", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium leading-tight", children: profile?.display_name ?? user?.email }),
          ghlUserId && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-mono", children: ghlUserId }),
          /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mt-0.5 text-[10px] uppercase tracking-wider", children: role })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: async () => {
              await signOut();
              navigate({ to: "/login" });
            },
            "aria-label": "Sign out",
            children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex items-center gap-1 overflow-x-auto border-t border-border/60 px-2 py-2 md:hidden", children: items.map(({ to, label, icon: Icon }) => {
      const active = location.pathname.startsWith(to);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          to,
          className: "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium " + (active ? "bg-secondary text-foreground" : "text-muted-foreground"),
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }),
            label
          ]
        },
        to
      );
    }) })
  ] });
}
function AppLayout() {
  const {
    user,
    profile,
    loading
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user && profile?.must_change_password && location.pathname !== "/reset-password") {
      navigate({
        to: "/reset-password"
      });
    }
  }, [loading, user, profile, location.pathname, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }) });
  }
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }
  if (profile?.must_change_password) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(TopNav, {}),
    /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8", children: /* @__PURE__ */ jsx(Outlet, {}) })
  ] });
}
export {
  AppLayout as component
};
