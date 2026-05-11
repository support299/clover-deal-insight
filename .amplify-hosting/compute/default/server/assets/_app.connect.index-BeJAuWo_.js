import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { u as useServerFn, g as getGhlStatus, r as refreshGhlToken } from "./ghl.functions-CGCmj2yR.js";
import { useState, useEffect } from "react";
import { I as Input, B as Button, s as supabase } from "./router-CvBcNStb.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-CY8TFgFJ.js";
import { toast } from "sonner";
import "@tanstack/react-router";
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
import "lucide-react";
async function getAccessToken() {
  const {
    data
  } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new Error("Not authenticated");
  return t;
}
const CLIENT_ID = "69fe0a4d9cd6a4f8e8fb4d15-mox49qdl";
const SCOPES = ["contacts.readonly", "contacts.write", "locations/customFields.readonly", "locations/customFields.write", "locations/customValues.readonly", "locations/customValues.write", "locations/tasks.readonly", "locations/tasks.write", "recurring-tasks.readonly", "recurring-tasks.write", "locations/tags.readonly", "locations/tags.write", "locations/templates.readonly", "opportunities.readonly", "opportunities.write", "users.readonly", "users.write"].join(" ");
const VERSION_ID = "69fe0a4d9cd6a4f8e8fb4d15";
function GhlPage() {
  const fetchStatus = useServerFn(getGhlStatus);
  const refresh = useServerFn(refreshGhlToken);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");
  const load = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const res = await fetchStatus({
        data: {
          accessToken
        }
      });
      setStatus(res.locationToken ?? res.token ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setRedirectUri(`${window.location.origin}/connect/callback`);
    load();
  }, []);
  const installUrl = redirectUri ? `https://marketplace.leadconnectorhq.com/v2/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&version_id=${VERSION_ID}` : "#";
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const accessToken = await getAccessToken();
      await refresh({
        data: {
          accessToken
        }
      });
      toast.success("Token refreshed");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };
  const expiresIn = status?.expires_at ? Math.round((new Date(status.expires_at).getTime() - Date.now()) / 1e3 / 60) : null;
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-3xl py-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold", children: "GoHighLevel Connection" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Hidden admin page for managing the GHL OAuth connection." })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Onboard" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: "Redirect URI (add this to your GHL app)" }),
          /* @__PURE__ */ jsx(Input, { value: redirectUri, readOnly: true })
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx("a", { href: installUrl, target: "_blank", rel: "noreferrer", children: "Connect to GoHighLevel" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { children: "Connection Status" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: onRefresh, disabled: refreshing || !status, children: refreshing ? "Refreshing…" : "Refresh Token" })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: loading ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading…" }) : !status ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'No connection yet. Click "Connect to GoHighLevel" above.' }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Field, { label: "Location ID", value: status.location_id ?? "—" }),
        /* @__PURE__ */ jsx(Field, { label: "Company ID", value: status.company_id ?? "—" }),
        /* @__PURE__ */ jsx(Field, { label: "User Type", value: status.user_type ?? "—" }),
        /* @__PURE__ */ jsx(Field, { label: "Expires At", value: `${new Date(status.expires_at).toLocaleString()}${expiresIn !== null ? ` (in ${expiresIn} min)` : ""}` }),
        /* @__PURE__ */ jsx(Field, { label: "Access Token", value: status.access_token, mono: true }),
        /* @__PURE__ */ jsx(Field, { label: "Refresh Token", value: status.refresh_token || "—", mono: true }),
        /* @__PURE__ */ jsx(Field, { label: "Scope", value: status.scope ?? "—" })
      ] }) })
    ] })
  ] });
}
function Field({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx(Input, { value, readOnly: true, className: mono ? "font-mono text-xs" : "" })
  ] });
}
export {
  GhlPage as component
};
