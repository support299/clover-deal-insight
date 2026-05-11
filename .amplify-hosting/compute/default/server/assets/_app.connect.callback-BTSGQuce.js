import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { u as useServerFn, e as exchangeGhlCode } from "./ghl.functions-CGCmj2yR.js";
import { useState, useRef, useEffect } from "react";
import { s as supabase, B as Button } from "./router-CvBcNStb.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-CY8TFgFJ.js";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
function GhlCallbackPage() {
  const exchange = useServerFn(exchangeGhlCode);
  const navigate = useNavigate();
  const [state, setState] = useState("working");
  const [message, setMessage] = useState("Exchanging authorization code…");
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) {
      setState("error");
      setMessage("No code parameter found in URL.");
      return;
    }
    const redirectUri = `${window.location.origin}/connect/callback`;
    (async () => {
      const {
        data: sess
      } = await supabase.auth.getSession();
      const accessToken = sess.session?.access_token;
      if (!accessToken) {
        setState("error");
        setMessage("You must be logged in as an admin.");
        return;
      }
      try {
        await exchange({
          data: {
            code,
            redirectUri,
            accessToken
          }
        });
        setState("success");
        setMessage("Connected successfully. Redirecting…");
        setTimeout(() => navigate({
          to: "/connect"
        }), 1200);
      } catch (e) {
        setState("error");
        setMessage(e instanceof Error ? e.message : "Failed to exchange code");
      }
    })();
  }, [exchange, navigate]);
  return /* @__PURE__ */ jsx("div", { className: "container mx-auto max-w-xl py-12", children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "GoHighLevel Callback" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: state === "error" ? "text-destructive" : "text-muted-foreground", children: message }),
      state === "error" && /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: "/connect", children: "Back to GHL Settings" }) })
    ] })
  ] }) });
}
export {
  GhlCallbackPage as component
};
