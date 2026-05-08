import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { exchangeGhlCode } from "@/lib/ghl.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/ghl/callback")({
  component: GhlCallbackPage,
});

function GhlCallbackPage() {
  const exchange = useServerFn(exchangeGhlCode);
  const navigate = useNavigate();
  const [state, setState] = useState<"working" | "success" | "error">("working");
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
    const redirectUri = `${window.location.origin}/ghl/callback`;
    exchange({ data: { code, redirectUri } })
      .then(() => {
        setState("success");
        setMessage("Connected successfully. Redirecting…");
        setTimeout(() => navigate({ to: "/ghl" }), 1200);
      })
      .catch((e: unknown) => {
        setState("error");
        setMessage(e instanceof Error ? e.message : "Failed to exchange code");
      });
  }, [exchange, navigate]);

  return (
    <div className="container mx-auto max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle>GoHighLevel Callback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={state === "error" ? "text-destructive" : "text-muted-foreground"}>{message}</p>
          {state === "error" && (
            <Button asChild variant="outline">
              <Link to="/ghl">Back to GHL Settings</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
