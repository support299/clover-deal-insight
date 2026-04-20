import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Save, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { AppRole } from "@/lib/auth";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

interface UserRow {
  id: string;
  display_name: string;
  team_id: string | null;
  role: AppRole;
}
interface TeamRow {
  id: string;
  name: string;
  manager_id: string | null;
}
interface NamedRow {
  id: string;
  name: string;
  active: boolean;
}
interface ProductRow extends NamedRow {
  carrier_id: string | null;
}

function SettingsPage() {
  const { roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate({ to: "/dashboard" });
  }, [authLoading, isAdmin, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, teams, carriers, and products.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UsersPanel /></TabsContent>
        <TabsContent value="teams"><TeamsPanel /></TabsContent>
        <TabsContent value="carriers"><NamedListPanel table="carriers" label="Carrier" /></TabsContent>
        <TabsContent value="products"><ProductsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- Users ---------------- */
function UsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<UserRow>>>({});

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roleRows }, { data: teamData }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, team_id"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("teams").select("id, name, manager_id"),
    ]);
    const roleMap = new Map<string, AppRole>();
    (roleRows ?? []).forEach((r) => {
      const cur = roleMap.get(r.user_id);
      const rank = (x: AppRole) => (x === "admin" ? 3 : x === "manager" ? 2 : 1);
      if (!cur || rank(r.role as AppRole) > rank(cur)) roleMap.set(r.user_id, r.role as AppRole);
    });
    setUsers(
      (profiles ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name,
        team_id: p.team_id,
        role: roleMap.get(p.id) ?? "agent",
      })),
    );
    setTeams(teamData ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setEdit = (id: string, patch: Partial<UserRow>) => {
    setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));
  };

  const save = async (u: UserRow) => {
    const patch = edits[u.id];
    if (!patch) return;
    setSavingId(u.id);
    try {
      const newName = patch.display_name ?? u.display_name;
      const newTeam = patch.team_id !== undefined ? patch.team_id : u.team_id;
      const newRole = patch.role ?? u.role;

      const { error: pErr } = await supabase
        .from("profiles")
        .update({ display_name: newName, team_id: newTeam })
        .eq("id", u.id);
      if (pErr) throw pErr;

      if (newRole !== u.role) {
        await supabase.from("user_roles").delete().eq("user_id", u.id);
        const { error: rErr } = await supabase
          .from("user_roles")
          .insert({ user_id: u.id, role: newRole });
        if (rErr) throw rErr;
      }
      toast.success("User updated");
      setEdits((e) => { const c = { ...e }; delete c[u.id]; return c; });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingId(null);
    }
  };

  const removeUser = async (u: UserRow) => {
    const { error } = await supabase.from("profiles").delete().eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("User profile removed");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Edit display names, assign teams, and change roles.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const e = edits[u.id] ?? {};
                  const dirty = Object.keys(e).length > 0;
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Input
                          value={e.display_name ?? u.display_name}
                          onChange={(ev) => setEdit(u.id, { display_name: ev.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={(e.team_id ?? u.team_id) ?? "none"}
                          onValueChange={(v) => setEdit(u.id, { team_id: v === "none" ? null : v })}
                        >
                          <SelectTrigger className="min-w-[160px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— None —</SelectItem>
                            {teams.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={e.role ?? u.role}
                          onValueChange={(v) => setEdit(u.id, { role: v as AppRole })}
                        >
                          <SelectTrigger className="min-w-[130px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">agent</SelectItem>
                            <SelectItem value="manager">manager</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant={dirty ? "default" : "secondary"}
                          disabled={!dirty || savingId === u.id}
                          onClick={() => save(u)}
                        >
                          {savingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove user profile?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes the profile and roles. The auth account is not deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeUser(u)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- Teams ---------------- */
function TeamsPanel() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [users, setUsers] = useState<{ id: string; display_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("teams").select("id, name, manager_id").order("name"),
      supabase.from("profiles").select("id, display_name").order("display_name"),
    ]);
    setTeams(t ?? []);
    setUsers(p ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const addTeam = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("teams").insert({ name: newName.trim() });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success("Team created");
    load();
  };

  const updateManager = async (teamId: string, managerId: string | null) => {
    const { error } = await supabase.from("teams").update({ manager_id: managerId }).eq("id", teamId);
    if (error) return toast.error(error.message);
    toast.success("Manager updated");
    load();
  };

  const renameTeam = async (teamId: string, name: string) => {
    const { error } = await supabase.from("teams").update({ name }).eq("id", teamId);
    if (error) return toast.error(error.message);
    toast.success("Team renamed");
    load();
  };

  const deleteTeam = async (teamId: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) return toast.error(error.message);
    toast.success("Team deleted");
    load();
  };

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.display_name])), [users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <CardDescription>Create teams and assign managers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="New team name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button onClick={addTeam} disabled={adding || !newName.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((t) => (
                <TeamRowEditor
                  key={t.id}
                  team={t}
                  users={users}
                  userMap={userMap}
                  onRename={(n) => renameTeam(t.id, n)}
                  onManager={(m) => updateManager(t.id, m)}
                  onDelete={() => deleteTeam(t.id)}
                />
              ))}
              {teams.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No teams yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function TeamRowEditor({
  team, users, userMap, onRename, onManager, onDelete,
}: {
  team: TeamRow;
  users: { id: string; display_name: string }[];
  userMap: Map<string, string>;
  onRename: (name: string) => void;
  onManager: (managerId: string | null) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(team.name);
  const dirty = name !== team.name;
  return (
    <TableRow>
      <TableCell>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          {dirty && <Button size="sm" onClick={() => onRename(name)}><Save className="h-4 w-4" /></Button>}
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={team.manager_id ?? "none"}
          onValueChange={(v) => onManager(v === "none" ? null : v)}
        >
          <SelectTrigger className="min-w-[200px]">
            <SelectValue placeholder="Select manager">
              {team.manager_id ? userMap.get(team.manager_id) ?? "Unknown" : "— None —"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— None —</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete team?</AlertDialogTitle>
              <AlertDialogDescription>Members will be unassigned from this team.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

/* ---------------- Carriers / Products ---------------- */
function NamedListPanel({ table, label }: { table: "carriers" | "products"; label: string }) {
  const [rows, setRows] = useState<NamedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select("id, name, active").order("name");
    setRows((data ?? []) as NamedRow[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, [table]);

  const add = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const { error } = await supabase.from(table).insert({ name: newName.trim() });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success(`${label} added`);
    load();
  };

  const toggle = async (row: NamedRow) => {
    const { error } = await supabase.from(table).update({ active: !row.active }).eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };

  const rename = async (id: string, name: string) => {
    const { error } = await supabase.from(table).update({ name }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`${label} removed`);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}s</CardTitle>
        <CardDescription>Manage available {label.toLowerCase()}s for sales entry.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder={`New ${label.toLowerCase()} name`} value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button onClick={add} disabled={adding || !newName.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Active</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <NamedRowEditor key={r.id} row={r} onRename={(n) => rename(r.id, n)} onToggle={() => toggle(r)} onDelete={() => remove(r.id)} />
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">None yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function NamedRowEditor({
  row, onRename, onToggle, onDelete,
}: {
  row: NamedRow;
  onRename: (name: string) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(row.name);
  const dirty = name !== row.name;
  return (
    <TableRow>
      <TableCell>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          {dirty && <Button size="sm" onClick={() => onRename(name)}><Save className="h-4 w-4" /></Button>}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch checked={row.active} onCheckedChange={onToggle} />
          <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Active" : "Inactive"}</Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

/* ---------------- Products (carrier-scoped) ---------------- */
function ProductsPanel() {
  const [carriers, setCarriers] = useState<NamedRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("carriers").select("id, name, active").order("name"),
      supabase.from("products").select("id, name, active, carrier_id").order("name"),
    ]);
    setCarriers((c ?? []) as NamedRow[]);
    setProducts((p ?? []) as ProductRow[]);
    if (!selectedCarrier && c && c.length > 0) setSelectedCarrier(c[0].id);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(
    () => products.filter((p) => p.carrier_id === selectedCarrier),
    [products, selectedCarrier],
  );
  const carrierMap = useMemo(() => new Map(carriers.map((c) => [c.id, c.name])), [carriers]);

  const add = async () => {
    if (!newName.trim() || !selectedCarrier) return;
    setAdding(true);
    const { error } = await supabase
      .from("products")
      .insert({ name: newName.trim(), carrier_id: selectedCarrier });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success("Product added");
    load();
  };

  const toggle = async (row: ProductRow) => {
    const { error } = await supabase.from("products").update({ active: !row.active }).eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };
  const rename = async (id: string, name: string) => {
    const { error } = await supabase.from("products").update({ name }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    load();
  };
  const reassign = async (id: string, carrier_id: string) => {
    const { error } = await supabase.from("products").update({ carrier_id }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Carrier updated");
    load();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product removed");
    load();
  };

  const orphans = products.filter((p) => !p.carrier_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <CardDescription>Products are scoped to a carrier. Pick a carrier to manage its products.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px]">
            <div className="mb-1 text-xs text-muted-foreground">Carrier</div>
            <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
              <SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger>
              <SelectContent>
                {carriers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="New product name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Button onClick={add} disabled={adding || !newName.trim() || !selectedCarrier}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        {orphans.length > 0 && (
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
            <div className="font-medium mb-2">{orphans.length} product(s) have no carrier assigned:</div>
            <div className="space-y-2">
              {orphans.map((o) => (
                <div key={o.id} className="flex items-center gap-2">
                  <span className="flex-1">{o.name}</span>
                  <Select onValueChange={(v) => reassign(o.id, v)}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Assign carrier" /></SelectTrigger>
                    <SelectContent>
                      {carriers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[180px]">Carrier</TableHead>
                <TableHead className="w-[120px]">Active</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <ProductRowEditor
                  key={r.id}
                  row={r}
                  carriers={carriers}
                  carrierMap={carrierMap}
                  onRename={(n) => rename(r.id, n)}
                  onReassign={(cid) => reassign(r.id, cid)}
                  onToggle={() => toggle(r)}
                  onDelete={() => remove(r.id)}
                />
              ))}
              {visible.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No products for this carrier</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ProductRowEditor({
  row, carriers, carrierMap, onRename, onReassign, onToggle, onDelete,
}: {
  row: ProductRow;
  carriers: NamedRow[];
  carrierMap: Map<string, string>;
  onRename: (name: string) => void;
  onReassign: (carrierId: string) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(row.name);
  const dirty = name !== row.name;
  return (
    <TableRow>
      <TableCell>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          {dirty && <Button size="sm" onClick={() => onRename(name)}><Save className="h-4 w-4" /></Button>}
        </div>
      </TableCell>
      <TableCell>
        <Select value={row.carrier_id ?? ""} onValueChange={onReassign}>
          <SelectTrigger><SelectValue>{row.carrier_id ? carrierMap.get(row.carrier_id) : "—"}</SelectValue></SelectTrigger>
          <SelectContent>
            {carriers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch checked={row.active} onCheckedChange={onToggle} />
          <Badge variant={row.active ? "default" : "secondary"}>{row.active ? "Active" : "Inactive"}</Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}
