import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import { Toaster as Toaster$1, toast } from "sonner";
import * as React from "react";
import { useState, useEffect, createContext, useContext, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function createSupabaseClient() {
  const SUPABASE_URL = "https://oogriwahzwovqukbnsdm.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZ3Jpd2FoendvdnF1a2Juc2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NTg0MDIsImV4cCI6MjA5MjIzNDQwMn0.Rfz4-gnlwMmI_HyNeWGb6-ZVBh-TuvGkUlWkGJG1i_E";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadProfile = async (uid) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, team_id, must_change_password").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid)
    ]);
    setProfile(p ?? null);
    setRoles((r ?? []).map((x) => x.role));
  };
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  const value = {
    user,
    session,
    profile,
    roles,
    loading,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refresh: async () => {
      if (user) await loadProfile(user.id);
    }
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
function highestRole(roles) {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("manager")) return "manager";
  return "agent";
}
function AutoLoginHandler() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const logid = url.searchParams.get("logid");
    if (!logid) return;
    ran.current = true;
    (async () => {
      try {
        const res = await fetch("/api/public/auth/exchange-logid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logid })
        });
        const payload = await res.json().catch(() => ({}));
        url.searchParams.delete("logid");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        if (!res.ok || !payload.token_hash) {
          toast.error(payload.error ?? "Auto-login failed");
          return;
        }
        const { error } = await supabase.auth.verifyOtp({
          type: "magiclink",
          token_hash: payload.token_hash
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        window.location.replace("/dashboard");
      } catch (e) {
        console.error("AutoLogin error:", e);
        toast.error("Auto-login failed");
      }
    })();
  }, []);
  return null;
}
const appCss = "/assets/styles-DLsR3eJe.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold gradient-text", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$m = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Performance Dashboard" },
      { name: "description", content: "Aftermath Insurance Group performance dashboard — track sales, monitor team performance, and climb the leaderboards." },
      { property: "og:title", content: "Performance Dashboard" },
      { name: "twitter:title", content: "Performance Dashboard" },
      { property: "og:description", content: "Aftermath Insurance Group performance dashboard — track sales, monitor team performance, and climb the leaderboards." },
      { name: "twitter:description", content: "Aftermath Insurance Group performance dashboard — track sales, monitor team performance, and climb the leaderboards." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ae2yB6PQyIft21EHc39UKyKFAIl2/social-images/social-1776678895443-Pinnacle_Wellness_Group_hwh.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ae2yB6PQyIft21EHc39UKyKFAIl2/social-images/social-1776678895443-Pinnacle_Wellness_Group_hwh.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(AutoLoginHandler, {}),
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" })
  ] });
}
const $$splitComponentImporter$i = () => import("./signup-DPdgNbWT.js");
const Route$l = createFileRoute("/signup")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./reset-password-zaopYW43.js");
const Route$k = createFileRoute("/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./login-CjXseOPZ.js");
const Route$j = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./_app-CUSqCL9r.js");
const Route$i = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./index-BDeDJyFz.js");
const Route$h = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./_app.settings-BQhWWx-j.js");
const Route$g = createFileRoute("/_app/settings")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_app.leaderboards-DObwT2SH.js");
const Route$f = createFileRoute("/_app/leaderboards")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./_app.dashboard-DByAT344.js");
const Route$e = createFileRoute("/_app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./_app.connect-BFsOu0JM.js");
const Route$d = createFileRoute("/_app/connect")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./_app.sales.index-DZd_xYdA.js");
const Route$c = createFileRoute("/_app/sales/")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./_app.expenses.index-zPvEIUaL.js");
const Route$b = createFileRoute("/_app/expenses/")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./_app.connect.index-BeJAuWo_.js");
const Route$a = createFileRoute("/_app/connect/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_app.agents.index-DaMOGHm6.js");
const Route$9 = createFileRoute("/_app/agents/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const $$splitComponentImporter$5 = () => import("./_app.sales.new-lt2wHo5Z.js");
const Route$8 = createFileRoute("/_app/sales/new")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./_app.expenses.new-BSnAvdDo.js");
const Route$7 = createFileRoute("/_app/expenses/new")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./_app.connect.callback-BTSGQuce.js");
const Route$6 = createFileRoute("/_app/connect/callback")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_app.agents._agentId-CZ0GQ5yV.js");
const Route$5 = createFileRoute("/_app/agents/$agentId")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing Supabase server environment variables. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-ghl-signature, x-wh-signature"
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}
function buildName(p) {
  const n = [p?.firstName, p?.lastName].filter(Boolean).join(" ").trim();
  return n || p?.name || null;
}
async function getLocationAccessToken(locationId) {
  const q = supabaseAdmin.from("ghl_tokens").select("access_token, location_id").not("location_id", "is", null);
  const { data, error } = locationId ? await q.eq("location_id", locationId).maybeSingle() : await q.limit(1).maybeSingle();
  if (error) {
    console.error("getLocationAccessToken error", error);
    return null;
  }
  return data?.access_token ?? null;
}
async function fetchContactAssignedUserId(contactId, locationId) {
  const token = await getLocationAccessToken(locationId);
  if (!token) return null;
  try {
    const res = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      headers: {
        Accept: "application/json",
        Version: "2021-07-28",
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      console.error("GHL contact fetch failed", res.status, await res.text());
      return null;
    }
    const json2 = await res.json();
    return json2?.contact?.assignedTo ?? null;
  } catch (e) {
    console.error("GHL contact fetch error", e);
    return null;
  }
}
async function logDelivery(entry) {
  try {
    await supabaseAdmin.from("ghl_webhook_logs").insert({
      status: entry.status,
      type: entry.type ?? null,
      entity_id: entry.entity_id ?? null,
      entity_table: entry.entity_table ?? null,
      action: entry.action ?? null,
      error: entry.error ?? null,
      payload: entry.payload ?? null
    });
  } catch (e) {
    console.error("ghl-webhook: failed to write audit log", e);
  }
}
async function handleEvent(payload) {
  const type = payload?.type ?? "";
  const id = payload?.id;
  if (!id) {
    const result = { skipped: true, reason: "missing id" };
    await logDelivery({ status: "skipped", type, error: "missing id", payload });
    return result;
  }
  const isContact = type.startsWith("Contact");
  const isUser = type.startsWith("User");
  if (!isContact && !isUser) {
    const result = { skipped: true, reason: `unsupported type ${type}` };
    await logDelivery({
      status: "skipped",
      type,
      entity_id: id,
      error: `unsupported type ${type}`,
      payload
    });
    return result;
  }
  const table = isContact ? "ghl_contacts" : "ghl_users";
  try {
    if (type.endsWith("Delete")) {
      await logDelivery({
        status: "skipped",
        type,
        entity_id: id,
        entity_table: table,
        action: "delete-ignored",
        payload
      });
      return { ok: true, action: "delete-ignored", table, id };
    }
    const name = buildName(payload);
    const email = payload?.email ?? null;
    const phone = payload?.phone ?? null;
    const row = {
      id,
      name,
      email,
      phone,
      type,
      location_id: payload?.locationId ?? null,
      raw: payload,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (isContact) {
      const assignedUserId = await fetchContactAssignedUserId(id, payload?.locationId);
      if (assignedUserId) row.user_id = assignedUserId;
    }
    let appUserId = null;
    if (isUser) {
      const { data: existing } = await supabaseAdmin.from("ghl_users").select("app_user_id").eq("id", id).maybeSingle();
      appUserId = existing?.app_user_id ?? null;
      let createdWithDefault = false;
      if (!appUserId && type !== "UserDelete" && email) {
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: "P!nnacl3Adm!n#W3lln3ss",
          email_confirm: true,
          user_metadata: { display_name: name ?? email }
        });
        if (createErr) {
          console.error("admin.createUser failed", createErr);
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const match = list?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );
          if (match) appUserId = match.id;
        } else {
          appUserId = created.user?.id ?? null;
          createdWithDefault = true;
        }
      }
      if (appUserId) {
        row.app_user_id = appUserId;
        const profileUpdate = {};
        if (name) profileUpdate.display_name = name;
        if (email) profileUpdate.email = email;
        if (phone) profileUpdate.phone = phone;
        if (createdWithDefault) profileUpdate.must_change_password = true;
        if (Object.keys(profileUpdate).length > 0) {
          const { error: pErr } = await supabaseAdmin.from("profiles").update(profileUpdate).eq("id", appUserId);
          if (pErr) console.error("profiles update error", pErr);
        }
        const authUpdate = {};
        if (email) {
          authUpdate.email = email;
          authUpdate.email_confirm = true;
        }
        if (name) authUpdate.user_metadata = { display_name: name };
        if (Object.keys(authUpdate).length > 0) {
          const { error: aErr } = await supabaseAdmin.auth.admin.updateUserById(
            appUserId,
            authUpdate
          );
          if (aErr) console.error("auth user update error", aErr);
        }
      }
    }
    const { error } = await supabaseAdmin.from(table).upsert(row, { onConflict: "id" });
    if (error) throw error;
    await logDelivery({
      status: "success",
      type,
      entity_id: id,
      entity_table: table,
      action: appUserId ? "upserted+app-synced" : "upserted",
      payload
    });
    return { ok: true, action: "upserted", table, id, app_user_id: appUserId };
  } catch (err) {
    await logDelivery({
      status: "error",
      type,
      entity_id: id,
      entity_table: table,
      error: err?.message ?? String(err),
      payload
    });
    throw err;
  }
}
const Route$4 = createFileRoute("/api/public/hooks/ghl-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          await logDelivery({ status: "error", error: `invalid json: ${e?.message ?? e}` });
          return json({ success: false, error: "invalid json" }, 400);
        }
        const events = Array.isArray(body) ? body : [body];
        const results = [];
        for (const evt of events) {
          const payload = evt?.body ?? evt;
          try {
            results.push(await handleEvent(payload));
          } catch (e) {
            console.error("ghl-webhook event error:", e);
            results.push({ ok: false, error: e?.message ?? "unknown" });
          }
        }
        return json({ success: true, results });
      }
    }
  }
});
const GHL_CLIENT_ID = "69fe0a4d9cd6a4f8e8fb4d15-mox49qdl";
const GHL_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/token";
const GHL_LOCATION_TOKEN_URL = "https://services.leadconnectorhq.com/oauth/locationToken";
const GHL_LOCATION_ID = "32Xlzcg72vsKh62gCqEz";
const Route$3 = createFileRoute("/api/public/hooks/ghl-refresh")({
  server: {
    handlers: {
      POST: async () => {
        const clientSecret = process.env.GHL_CLIENT_SECRET;
        if (!clientSecret) {
          return Response.json({ error: "GHL_CLIENT_SECRET not configured" }, { status: 500 });
        }
        const admin = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        const { data: companyRow, error } = await admin.from("ghl_tokens").select("id, refresh_token").is("location_id", null).limit(1).maybeSingle();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        if (!companyRow) return Response.json({ skipped: "no company token" });
        const body = new URLSearchParams({
          client_id: GHL_CLIENT_ID,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: companyRow.refresh_token,
          user_type: "Company"
        });
        const res = await fetch(GHL_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
          body: body.toString()
        });
        const text = await res.text();
        if (!res.ok) {
          return Response.json({ error: `GHL ${res.status}: ${text}` }, { status: 502 });
        }
        const token = JSON.parse(text);
        const expiresAt = new Date(Date.now() + token.expires_in * 1e3).toISOString();
        const { error: updErr } = await admin.from("ghl_tokens").update({
          access_token: token.access_token,
          refresh_token: token.refresh_token ?? companyRow.refresh_token,
          expires_at: expiresAt,
          location_id: null,
          company_id: token.companyId ?? null,
          user_type: token.userType ?? "Company",
          scope: token.scope ?? null,
          raw: token
        }).eq("id", companyRow.id);
        if (updErr) return Response.json({ error: updErr.message }, { status: 500 });
        let locationResult = null;
        if (token.companyId) {
          const locBody = new URLSearchParams({
            companyId: token.companyId,
            locationId: GHL_LOCATION_ID
          });
          const locRes = await fetch(GHL_LOCATION_TOKEN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
              Version: "2021-07-28",
              Authorization: `Bearer ${token.access_token}`
            },
            body: locBody.toString()
          });
          const locText = await locRes.text();
          if (!locRes.ok) {
            return Response.json(
              { company_refreshed: true, location_error: `GHL ${locRes.status}: ${locText}` },
              { status: 502 }
            );
          }
          const locTok = JSON.parse(locText);
          const locExpires = new Date(Date.now() + locTok.expires_in * 1e3).toISOString();
          const locId = locTok.locationId ?? GHL_LOCATION_ID;
          const { data: existingLoc } = await admin.from("ghl_tokens").select("id").eq("location_id", locId).maybeSingle();
          const locRow = {
            access_token: locTok.access_token,
            refresh_token: locTok.refresh_token ?? "",
            expires_at: locExpires,
            location_id: locId,
            company_id: locTok.companyId ?? token.companyId,
            user_type: locTok.userType ?? "Location",
            scope: locTok.scope ?? null,
            raw: locTok
          };
          if (existingLoc) {
            await admin.from("ghl_tokens").update(locRow).eq("id", existingLoc.id);
          } else {
            await admin.from("ghl_tokens").insert(locRow);
          }
          locationResult = { location_id: locId, expires_at: locExpires };
        }
        return Response.json({
          success: true,
          company: { expires_at: expiresAt, company_id: token.companyId },
          location: locationResult
        });
      }
    }
  }
});
const Route$2 = createFileRoute("/api/public/auth/exchange-logid")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const logid = body.logid?.trim();
          if (!logid) {
            return Response.json({ error: "Missing logid" }, { status: 400 });
          }
          const { data: ghlUser, error: ghlErr } = await supabaseAdmin.from("ghl_users").select("id, app_user_id, email").eq("id", logid).maybeSingle();
          if (ghlErr) {
            console.error("[exchange-logid] ghl_users error:", ghlErr);
            return Response.json({ error: "Server error" }, { status: 500 });
          }
          if (!ghlUser?.app_user_id) {
            return Response.json({ error: "User not found" }, { status: 404 });
          }
          const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(ghlUser.app_user_id);
          if (userErr || !userData?.user?.email) {
            console.error("[exchange-logid] user lookup failed:", userErr);
            return Response.json({ error: "User not found" }, { status: 404 });
          }
          const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: userData.user.email
          });
          if (linkErr || !linkData?.properties?.hashed_token) {
            console.error("[exchange-logid] generateLink failed:", linkErr);
            return Response.json({ error: "Could not generate session" }, { status: 500 });
          }
          return Response.json({
            email: userData.user.email,
            token_hash: linkData.properties.hashed_token
          });
        } catch (e) {
          console.error("[exchange-logid] unexpected:", e);
          return Response.json({ error: "Server error" }, { status: 500 });
        }
      }
    }
  }
});
const $$splitComponentImporter$1 = () => import("./_app.sales._saleId.edit-Ck-yT-oz.js");
const Route$1 = createFileRoute("/_app/sales/$saleId/edit")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_app.expenses._expenseId.edit-C_OhWQ8B.js");
const Route = createFileRoute("/_app/expenses/$expenseId/edit")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$l.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$m
});
const ResetPasswordRoute = Route$k.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$m
});
const LoginRoute = Route$j.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$m
});
const AppRoute = Route$i.update({
  id: "/_app",
  getParentRoute: () => Route$m
});
const IndexRoute = Route$h.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$m
});
const AppSettingsRoute = Route$g.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRoute
});
const AppLeaderboardsRoute = Route$f.update({
  id: "/leaderboards",
  path: "/leaderboards",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$e.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppConnectRoute = Route$d.update({
  id: "/connect",
  path: "/connect",
  getParentRoute: () => AppRoute
});
const AppSalesIndexRoute = Route$c.update({
  id: "/sales/",
  path: "/sales/",
  getParentRoute: () => AppRoute
});
const AppExpensesIndexRoute = Route$b.update({
  id: "/expenses/",
  path: "/expenses/",
  getParentRoute: () => AppRoute
});
const AppConnectIndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppConnectRoute
});
const AppAgentsIndexRoute = Route$9.update({
  id: "/agents/",
  path: "/agents/",
  getParentRoute: () => AppRoute
});
const AppSalesNewRoute = Route$8.update({
  id: "/sales/new",
  path: "/sales/new",
  getParentRoute: () => AppRoute
});
const AppExpensesNewRoute = Route$7.update({
  id: "/expenses/new",
  path: "/expenses/new",
  getParentRoute: () => AppRoute
});
const AppConnectCallbackRoute = Route$6.update({
  id: "/callback",
  path: "/callback",
  getParentRoute: () => AppConnectRoute
});
const AppAgentsAgentIdRoute = Route$5.update({
  id: "/agents/$agentId",
  path: "/agents/$agentId",
  getParentRoute: () => AppRoute
});
const ApiPublicHooksGhlWebhookRoute = Route$4.update({
  id: "/api/public/hooks/ghl-webhook",
  path: "/api/public/hooks/ghl-webhook",
  getParentRoute: () => Route$m
});
const ApiPublicHooksGhlRefreshRoute = Route$3.update({
  id: "/api/public/hooks/ghl-refresh",
  path: "/api/public/hooks/ghl-refresh",
  getParentRoute: () => Route$m
});
const ApiPublicAuthExchangeLogidRoute = Route$2.update({
  id: "/api/public/auth/exchange-logid",
  path: "/api/public/auth/exchange-logid",
  getParentRoute: () => Route$m
});
const AppSalesSaleIdEditRoute = Route$1.update({
  id: "/sales/$saleId/edit",
  path: "/sales/$saleId/edit",
  getParentRoute: () => AppRoute
});
const AppExpensesExpenseIdEditRoute = Route.update({
  id: "/expenses/$expenseId/edit",
  path: "/expenses/$expenseId/edit",
  getParentRoute: () => AppRoute
});
const AppConnectRouteChildren = {
  AppConnectCallbackRoute,
  AppConnectIndexRoute
};
const AppConnectRouteWithChildren = AppConnectRoute._addFileChildren(
  AppConnectRouteChildren
);
const AppRouteChildren = {
  AppConnectRoute: AppConnectRouteWithChildren,
  AppDashboardRoute,
  AppLeaderboardsRoute,
  AppSettingsRoute,
  AppAgentsAgentIdRoute,
  AppExpensesNewRoute,
  AppSalesNewRoute,
  AppAgentsIndexRoute,
  AppExpensesIndexRoute,
  AppSalesIndexRoute,
  AppExpensesExpenseIdEditRoute,
  AppSalesSaleIdEditRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute,
  ResetPasswordRoute,
  SignupRoute,
  ApiPublicAuthExchangeLogidRoute,
  ApiPublicHooksGhlRefreshRoute,
  ApiPublicHooksGhlWebhookRoute
};
const routeTree = Route$m._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Button as B,
  Input as I,
  Label as L,
  Route$5 as R,
  Select as S,
  SelectTrigger as a,
  SelectValue as b,
  SelectContent as c,
  SelectItem as d,
  cn as e,
  buttonVariants as f,
  Route$1 as g,
  highestRole as h,
  Route as i,
  router as r,
  supabase as s,
  useAuth as u
};
