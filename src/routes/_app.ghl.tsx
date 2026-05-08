import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getGhlStatus, refreshGhlToken } from "@/lib/ghl.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ghl")({
  component: GhlPage,
});

const CLIENT_ID = "69fe0a4d9cd6a4f8e8fb4d15-mox49qdl";
const SCOPES = [
  "contacts.readonly",
  "contacts.write",
  "locations/customFields.readonly",
  "locations/customFields.write",
  "locations/customValues.readonly",
  "locations/customValues.write",
  "locations/tasks.readonly",
  "locations/tasks.write",
  "recurring-tasks.readonly",
  "recurring-tasks.write",
  "locations/tags.readonly",
  "locations/tags.write",
  "locations/templates.readonly",
  "opportunities.readonly",
  "opportunities.write",
  "users.readonly",
  "users.write",
].join(" ");
const VERSION_ID = "69fe0a4d9cd6a4f8e8fb4d15";

type Status = Awaited<ReturnType<typeof getGhlStatus>>["token"];

function GhlPage() {
  const fetchStatus = useServerFn(getGhlStatus);
  const refresh = useServerFn(refreshGhlToken);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchStatus();
      setStatus(res.token ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRedirectUri(`${window.location.origin}/ghl/callback`);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const installUrl = redirectUri
    ? `https://marketplace.leadconnectorhq.com/v2/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&version_id=${VERSION_ID}`
    : "#";

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh({});
      toast.success("Token refreshed");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const expiresIn = status?.expires_at
    ? Math.round((new Date(status.expires_at).getTime() - Date.now()) / 1000 / 60)
    : null;

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">GoHighLevel Connection</h1>
        <p className="text-sm text-muted-foreground">Hidden admin page for managing the GHL OAuth connection.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Redirect URI (add this to your GHL app)</label>
            <Input value={redirectUri} readOnly />
          </div>
          <Button asChild>
            <a href={installUrl} target="_blank" rel="noreferrer">Connect to GoHighLevel</a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Connection Status</span>
            <Button size="sm" variant="outline" onClick={onRefresh} disabled={refreshing || !status}>
              {refreshing ? "Refreshing…" : "Refresh Token"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !status ? (
            <p className="text-sm text-muted-foreground">No connection yet. Click "Connect to GoHighLevel" above.</p>
          ) : (
            <>
              <Field label="Location ID" value={status.location_id ?? "—"} />
              <Field label="Company ID" value={status.company_id ?? "—"} />
              <Field label="User Type" value={status.user_type ?? "—"} />
              <Field
                label="Expires At"
                value={`${new Date(status.expires_at).toLocaleString()}${
                  expiresIn !== null ? ` (in ${expiresIn} min)` : ""
                }`}
              />
              <Field label="Access Token" value={status.access_token} mono />
              <Field label="Refresh Token" value={status.refresh_token} mono />
              <Field label="Scope" value={status.scope ?? "—"} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input value={value} readOnly className={mono ? "font-mono text-xs" : ""} />
    </div>
  );
}
