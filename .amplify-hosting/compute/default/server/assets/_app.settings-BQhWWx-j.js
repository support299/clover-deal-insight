import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Check, Loader2, KeyRound, Shield, Save, Trash2, Plus } from "lucide-react";
import { e as cn, f as buttonVariants, u as useAuth, L as Label, I as Input, B as Button, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, s as supabase } from "./router-CvBcNStb.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-CY8TFgFJ.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-CAiLApz2.js";
import { B as Badge } from "./badge-C4fVAAET.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const Table = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx("table", { ref, className: cn("w-full caption-bottom text-sm", className), ...props }) })
);
Table.displayName = "Table";
const TableHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tbody", { ref, className: cn("[&_tr:last-child]:border-0", className), ...props }));
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "tfoot",
  {
    ref,
    className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "tr",
    {
      ref,
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  )
);
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "th",
  {
    ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "td",
  {
    ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props }));
TableCaption.displayName = "TableCaption";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function SettingsPage() {
  const {
    roles,
    loading: authLoading
  } = useAuth();
  const isAdmin = roles.includes("admin");
  if (authLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Settings" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your password." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "password", className: "space-y-4", children: [
        /* @__PURE__ */ jsx(TabsList, { children: /* @__PURE__ */ jsx(TabsTrigger, { value: "password", children: "Password" }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "password", children: /* @__PURE__ */ jsx(PasswordPanel, {}) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Shield, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Admin Settings" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Manage users, teams, carriers, and products." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "users", className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-3 sm:w-auto sm:inline-flex sm:grid-cols-none", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "users", children: "Users" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "teams", children: "Teams" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "carriers", children: "Carriers" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "products", children: "Products" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "addons", children: "Add-ons" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "lead_sources", children: "Lead Sources" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "targets", children: "Targets" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "password", children: "Password" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "users", children: /* @__PURE__ */ jsx(UsersPanel, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "teams", children: /* @__PURE__ */ jsx(TeamsPanel, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "carriers", children: /* @__PURE__ */ jsx(CarriersPanel, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "products", children: /* @__PURE__ */ jsx(ProductsPanel, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "addons", children: /* @__PURE__ */ jsx(NamedListPanel, { table: "add_ons", label: "Add-on" }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "lead_sources", children: /* @__PURE__ */ jsx(NamedListPanel, { table: "lead_sources", label: "Lead Source" }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "targets", children: /* @__PURE__ */ jsx(TargetsPanel, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "password", children: /* @__PURE__ */ jsx(PasswordPanel, {}) })
    ] })
  ] });
}
function PasswordPanel() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password === "P!nnacl3Adm!n#W3lln3ss") {
      toast.error("Choose a password different from the default.");
      return;
    }
    setSubmitting(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password
    });
    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        must_change_password: false
      }).eq("id", user.id);
    }
    setPassword("");
    setConfirm("");
    setSubmitting(false);
    toast.success("Password updated.");
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Change password" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Set a new password for your account." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "max-w-md space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-password", children: "New password" }),
        /* @__PURE__ */ jsx(Input, { id: "new-password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), minLength: 8, required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-password", children: "Confirm password" }),
        /* @__PURE__ */ jsx(Input, { id: "confirm-password", type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), minLength: 8, required: true })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? "Saving..." : "Update password" })
    ] }) })
  ] });
}
function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [edits, setEdits] = useState({});
  const load = async () => {
    setLoading(true);
    const [{
      data: profiles
    }, {
      data: roleRows
    }, {
      data: teamData
    }] = await Promise.all([supabase.from("profiles").select("id, display_name, team_id"), supabase.from("user_roles").select("user_id, role"), supabase.from("teams").select("id, name").order("name")]);
    const roleMap = /* @__PURE__ */ new Map();
    (roleRows ?? []).forEach((r) => {
      const cur = roleMap.get(r.user_id);
      const rank = (x) => x === "admin" ? 3 : x === "manager" ? 2 : 1;
      if (!cur || rank(r.role) > rank(cur)) roleMap.set(r.user_id, r.role);
    });
    setUsers((profiles ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name,
      team_id: p.team_id,
      role: roleMap.get(p.id) ?? "agent"
    })));
    setTeams((teamData ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      manager_ids: []
    })));
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const setEdit = (id, patch) => {
    setEdits((e) => ({
      ...e,
      [id]: {
        ...e[id],
        ...patch
      }
    }));
  };
  const save = async (u) => {
    const patch = edits[u.id];
    if (!patch) return;
    setSavingId(u.id);
    try {
      const newName = patch.display_name ?? u.display_name;
      const newTeam = patch.team_id !== void 0 ? patch.team_id : u.team_id;
      const newRole = patch.role ?? u.role;
      const {
        error: pErr
      } = await supabase.from("profiles").update({
        display_name: newName,
        team_id: newTeam
      }).eq("id", u.id);
      if (pErr) throw pErr;
      if (newRole !== u.role) {
        await supabase.from("user_roles").delete().eq("user_id", u.id);
        const {
          error: rErr
        } = await supabase.from("user_roles").insert({
          user_id: u.id,
          role: newRole
        });
        if (rErr) throw rErr;
      }
      toast.success("User updated");
      setEdits((e) => {
        const c = {
          ...e
        };
        delete c[u.id];
        return c;
      });
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingId(null);
    }
  };
  const removeUser = async (u) => {
    const {
      error
    } = await supabase.from("profiles").delete().eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success("User profile removed");
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Users" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Edit display names, assign teams, and change roles." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Team" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
        /* @__PURE__ */ jsx(TableHead, { className: "w-[180px] text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: users.map((u) => {
        const e = edits[u.id] ?? {};
        const dirty = Object.keys(e).length > 0;
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { value: e.display_name ?? u.display_name, onChange: (ev) => setEdit(u.id, {
            display_name: ev.target.value
          }) }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, { value: e.team_id ?? u.team_id ?? "none", onValueChange: (v) => setEdit(u.id, {
            team_id: v === "none" ? null : v
          }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "min-w-[160px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "none", children: "— None —" }),
              teams.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.id, children: t.name }, t.id))
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, { value: e.role ?? u.role, onValueChange: (v) => setEdit(u.id, {
            role: v
          }), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "min-w-[130px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "agent", children: "agent" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "manager", children: "manager" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "admin", children: "admin" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(TableCell, { className: "text-right space-x-2", children: [
            /* @__PURE__ */ jsxs(Button, { size: "sm", variant: dirty ? "default" : "secondary", disabled: !dirty || savingId === u.id, onClick: () => save(u), children: [
              savingId === u.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              "Save"
            ] }),
            /* @__PURE__ */ jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) }),
              /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
                /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Remove user profile?" }),
                  /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This removes the profile and roles. The auth account is not deleted." })
                ] }),
                /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
                  /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => removeUser(u), children: "Remove" })
                ] })
              ] })
            ] })
          ] })
        ] }, u.id);
      }) })
    ] }) }) })
  ] });
}
function TeamsPanel() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const load = async () => {
    setLoading(true);
    const [{
      data: t
    }, {
      data: p
    }, {
      data: tm
    }] = await Promise.all([supabase.from("teams").select("id, name").order("name"), supabase.from("profiles").select("id, display_name").order("display_name"), supabase.from("team_managers").select("team_id, user_id")]);
    const managersByTeam = /* @__PURE__ */ new Map();
    (tm ?? []).forEach((row) => {
      const arr = managersByTeam.get(row.team_id) ?? [];
      arr.push(row.user_id);
      managersByTeam.set(row.team_id, arr);
    });
    setTeams((t ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      manager_ids: managersByTeam.get(row.id) ?? []
    })));
    setUsers(p ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const addTeam = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const {
      error
    } = await supabase.from("teams").insert({
      name: newName.trim()
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success("Team created");
    load();
  };
  const setManagers = async (teamId, managerIds) => {
    const {
      error: delErr
    } = await supabase.from("team_managers").delete().eq("team_id", teamId);
    if (delErr) return toast.error(delErr.message);
    if (managerIds.length > 0) {
      const rows = managerIds.map((uid) => ({
        team_id: teamId,
        user_id: uid
      }));
      const {
        error: insErr
      } = await supabase.from("team_managers").insert(rows);
      if (insErr) return toast.error(insErr.message);
    }
    await supabase.from("teams").update({
      manager_id: managerIds[0] ?? null
    }).eq("id", teamId);
    toast.success("Managers updated");
    load();
  };
  const renameTeam = async (teamId, name) => {
    const {
      error
    } = await supabase.from("teams").update({
      name
    }).eq("id", teamId);
    if (error) return toast.error(error.message);
    toast.success("Team renamed");
    load();
  };
  const deleteTeam = async (teamId) => {
    const {
      error
    } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) return toast.error(error.message);
    toast.success("Team deleted");
    load();
  };
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u.display_name])), [users]);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Teams" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Create teams and assign one or more managers." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "New team name", value: newName, onChange: (e) => setNewName(e.target.value) }),
        /* @__PURE__ */ jsxs(Button, { onClick: addTeam, disabled: adding || !newName.trim(), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add"
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Managers" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[100px] text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          teams.map((t) => /* @__PURE__ */ jsx(TeamRowEditor, { team: t, users, userMap, onRename: (n) => renameTeam(t.id, n), onSetManagers: (m) => setManagers(t.id, m), onDelete: () => deleteTeam(t.id) }, t.id)),
          teams.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground py-6", children: "No teams yet" }) })
        ] })
      ] })
    ] })
  ] });
}
function TeamRowEditor({
  team,
  users,
  userMap,
  onRename,
  onSetManagers,
  onDelete
}) {
  const [name, setName] = useState(team.name);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(team.manager_ids);
  const dirty = name !== team.name;
  useEffect(() => {
    setDraft(team.manager_ids);
  }, [team.manager_ids]);
  const toggle = (uid) => {
    setDraft((d) => d.includes(uid) ? d.filter((x) => x !== uid) : [...d, uid]);
  };
  team.manager_ids.length === 0 ? "— None —" : team.manager_ids.map((id) => userMap.get(id) ?? "Unknown").join(", ");
  return /* @__PURE__ */ jsxs(TableRow, { children: [
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { value: name, onChange: (e) => setName(e.target.value) }),
      dirty && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => onRename(name), children: /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
        team.manager_ids.length === 0 && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "No managers assigned" }),
        team.manager_ids.map((id) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: userMap.get(id) ?? "Unknown" }, id))
      ] }),
      !open ? /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
        setDraft(team.manager_ids);
        setOpen(true);
      }, children: "Edit managers" }) : /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-border p-2 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "max-h-48 overflow-y-auto space-y-1", children: users.map((u) => {
          const checked = draft.includes(u.id);
          return /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1 hover:bg-muted/50", children: [
            /* @__PURE__ */ jsx(Checkbox, { checked, onCheckedChange: () => toggle(u.id) }),
            /* @__PURE__ */ jsx("span", { children: u.display_name })
          ] }, u.id);
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => {
            onSetManagers(draft);
            setOpen(false);
          }, children: [
            /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            " Save"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) }),
      /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete team?" }),
          /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Members will be unassigned from this team." })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: onDelete, children: "Delete" })
        ] })
      ] })
    ] }) })
  ] });
}
function NamedListPanel({
  table,
  label
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const load = async () => {
    setLoading(true);
    const {
      data
    } = await supabase.from(table).select("id, name, active").order("name");
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [table]);
  const add = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const {
      error
    } = await supabase.from(table).insert({
      name: newName.trim()
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success(`${label} added`);
    load();
  };
  const toggle = async (row) => {
    const {
      error
    } = await supabase.from(table).update({
      active: !row.active
    }).eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };
  const rename = async (id, name) => {
    const {
      error
    } = await supabase.from(table).update({
      name
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    load();
  };
  const remove = async (id) => {
    const {
      error
    } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`${label} removed`);
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { children: [
        label,
        "s"
      ] }),
      /* @__PURE__ */ jsxs(CardDescription, { children: [
        "Manage available ",
        label.toLowerCase(),
        "s for sales entry."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Input, { placeholder: `New ${label.toLowerCase()} name`, value: newName, onChange: (e) => setNewName(e.target.value) }),
        /* @__PURE__ */ jsxs(Button, { onClick: add, disabled: adding || !newName.trim(), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add"
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[120px]", children: "Active" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[100px] text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          rows.map((r) => /* @__PURE__ */ jsx(NamedRowEditor, { row: r, onRename: (n) => rename(r.id, n), onToggle: () => toggle(r), onDelete: () => remove(r.id) }, r.id)),
          rows.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground py-6", children: "None yet" }) })
        ] })
      ] })
    ] })
  ] });
}
function NamedRowEditor({
  row,
  onRename,
  onToggle,
  onDelete
}) {
  const [name, setName] = useState(row.name);
  const dirty = name !== row.name;
  return /* @__PURE__ */ jsxs(TableRow, { children: [
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { value: name, onChange: (e) => setName(e.target.value) }),
      dirty && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => onRename(name), children: /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Switch, { checked: row.active, onCheckedChange: onToggle }),
      /* @__PURE__ */ jsx(Badge, { variant: row.active ? "default" : "secondary", children: row.active ? "Active" : "Inactive" })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) }),
      /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete?" }),
          /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This action cannot be undone." })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: onDelete, children: "Delete" })
        ] })
      ] })
    ] }) })
  ] });
}
function ProductsPanel() {
  const [carriers, setCarriers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const load = async () => {
    setLoading(true);
    const [{
      data: c
    }, {
      data: p
    }] = await Promise.all([supabase.from("carriers").select("id, name, active").order("name"), supabase.from("products").select("id, name, active, carrier_id").order("name")]);
    setCarriers(c ?? []);
    setProducts(p ?? []);
    if (!selectedCarrier && c && c.length > 0) setSelectedCarrier(c[0].id);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const visible = useMemo(() => products.filter((p) => p.carrier_id === selectedCarrier), [products, selectedCarrier]);
  const carrierMap = useMemo(() => new Map(carriers.map((c) => [c.id, c.name])), [carriers]);
  const add = async () => {
    if (!newName.trim() || !selectedCarrier) return;
    setAdding(true);
    const {
      error
    } = await supabase.from("products").insert({
      name: newName.trim(),
      carrier_id: selectedCarrier
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success("Product added");
    load();
  };
  const toggle = async (row) => {
    const {
      error
    } = await supabase.from("products").update({
      active: !row.active
    }).eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };
  const rename = async (id, name) => {
    const {
      error
    } = await supabase.from("products").update({
      name
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    load();
  };
  const reassign = async (id, carrier_id) => {
    const {
      error
    } = await supabase.from("products").update({
      carrier_id
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Carrier updated");
    load();
  };
  const remove = async (id) => {
    const {
      error
    } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product removed");
    load();
  };
  const orphans = products.filter((p) => !p.carrier_id);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Products" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Products are scoped to a carrier. Pick a carrier to manage its products." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-[220px]", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-1 text-xs text-muted-foreground", children: "Carrier" }),
          /* @__PURE__ */ jsxs(Select, { value: selectedCarrier, onValueChange: setSelectedCarrier, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select carrier" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: carriers.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Input, { placeholder: "New product name", value: newName, onChange: (e) => setNewName(e.target.value), className: "flex-1 min-w-[200px]" }),
        /* @__PURE__ */ jsxs(Button, { onClick: add, disabled: adding || !newName.trim() || !selectedCarrier, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add"
        ] })
      ] }),
      orphans.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-warning/40 bg-warning/10 p-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "font-medium mb-2", children: [
          orphans.length,
          " product(s) have no carrier assigned:"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: orphans.map((o) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "flex-1", children: o.name }),
          /* @__PURE__ */ jsxs(Select, { onValueChange: (v) => reassign(o.id, v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Assign carrier" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: carriers.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
          ] })
        ] }, o.id)) })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[180px]", children: "Carrier" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[120px]", children: "Active" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[100px] text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          visible.map((r) => /* @__PURE__ */ jsx(ProductRowEditor, { row: r, carriers, carrierMap, onRename: (n) => rename(r.id, n), onReassign: (cid) => reassign(r.id, cid), onToggle: () => toggle(r), onDelete: () => remove(r.id) }, r.id)),
          visible.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-6", children: "No products for this carrier" }) })
        ] })
      ] })
    ] })
  ] });
}
function ProductRowEditor({
  row,
  carriers,
  carrierMap,
  onRename,
  onReassign,
  onToggle,
  onDelete
}) {
  const [name, setName] = useState(row.name);
  const dirty = name !== row.name;
  return /* @__PURE__ */ jsxs(TableRow, { children: [
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { value: name, onChange: (e) => setName(e.target.value) }),
      dirty && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => onRename(name), children: /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, { value: row.carrier_id ?? "", onValueChange: onReassign, children: [
      /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { children: row.carrier_id ? carrierMap.get(row.carrier_id) : "—" }) }),
      /* @__PURE__ */ jsx(SelectContent, { children: carriers.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Switch, { checked: row.active, onCheckedChange: onToggle }),
      /* @__PURE__ */ jsx(Badge, { variant: row.active ? "default" : "secondary", children: row.active ? "Active" : "Inactive" })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) }),
      /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete?" }),
          /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This action cannot be undone." })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: onDelete, children: "Delete" })
        ] })
      ] })
    ] }) })
  ] });
}
function CarriersPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("health");
  const [adding, setAdding] = useState(false);
  const load = async () => {
    setLoading(true);
    const {
      data
    } = await supabase.from("carriers").select("id, name, active, carrier_type").order("name");
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    const {
      error
    } = await supabase.from("carriers").insert({
      name: newName.trim(),
      carrier_type: newType
    });
    setAdding(false);
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success("Carrier added");
    load();
  };
  const toggle = async (row) => {
    const {
      error
    } = await supabase.from("carriers").update({
      active: !row.active
    }).eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };
  const rename = async (id, name) => {
    const {
      error
    } = await supabase.from("carriers").update({
      name
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Renamed");
    load();
  };
  const setType = async (id, carrier_type) => {
    const {
      error
    } = await supabase.from("carriers").update({
      carrier_type
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Type updated");
    load();
  };
  const remove = async (id) => {
    const {
      error
    } = await supabase.from("carriers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Carrier removed");
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Carriers" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Manage carriers and their insurance type." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "New carrier name", value: newName, onChange: (e) => setNewName(e.target.value), className: "flex-1 min-w-[200px]" }),
        /* @__PURE__ */ jsx("div", { className: "min-w-[180px]", children: /* @__PURE__ */ jsxs(Select, { value: newType, onValueChange: (v) => setNewType(v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "health", children: "Health Insurance" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "life", children: "Life Insurance" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(Button, { onClick: add, disabled: adding || !newName.trim(), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          " Add"
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[200px]", children: "Type" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[120px]", children: "Active" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[100px] text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          rows.map((r) => /* @__PURE__ */ jsx(CarrierRowEditor, { row: r, onRename: (n) => rename(r.id, n), onSetType: (t) => setType(r.id, t), onToggle: () => toggle(r), onDelete: () => remove(r.id) }, r.id)),
          rows.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-6", children: "No carriers yet" }) })
        ] })
      ] })
    ] })
  ] });
}
function CarrierRowEditor({
  row,
  onRename,
  onSetType,
  onToggle,
  onDelete
}) {
  const [name, setName] = useState(row.name);
  const dirty = name !== row.name;
  return /* @__PURE__ */ jsxs(TableRow, { children: [
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { value: name, onChange: (e) => setName(e.target.value) }),
      dirty && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => onRename(name), children: /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Select, { value: row.carrier_type, onValueChange: (v) => onSetType(v), children: [
      /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsx(SelectItem, { value: "health", children: "Health Insurance" }),
        /* @__PURE__ */ jsx(SelectItem, { value: "life", children: "Life Insurance" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Switch, { checked: row.active, onCheckedChange: onToggle }),
      /* @__PURE__ */ jsx(Badge, { variant: row.active ? "default" : "secondary", children: row.active ? "Active" : "Inactive" })
    ] }) }),
    /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" }) }) }),
      /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete?" }),
          /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This action cannot be undone." })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: onDelete, children: "Delete" })
        ] })
      ] })
    ] }) })
  ] });
}
const EMPTY_TARGET = {
  life_revenue_target: 0,
  health_revenue_target: 0,
  addon_revenue_target: 0,
  life_attach_ratio_target: 0,
  health_attach_ratio_target: 0,
  addon_attach_ratio_target: 0
};
function TargetsPanel() {
  const [agents, setAgents] = useState([]);
  const [company, setCompany] = useState({
    scope: "company",
    agent_id: null,
    ...EMPTY_TARGET
  });
  const [agentTargets, setAgentTargets] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const load = async () => {
    setLoading(true);
    const [{
      data: profiles
    }, {
      data: targets
    }] = await Promise.all([supabase.from("profiles").select("id, display_name").order("display_name"), supabase.from("targets").select("*")]);
    setAgents(profiles ?? []);
    const comp = (targets ?? []).find((t) => t.scope === "company");
    if (comp) setCompany(comp);
    else setCompany({
      scope: "company",
      agent_id: null,
      ...EMPTY_TARGET
    });
    const map = {};
    (targets ?? []).forEach((t) => {
      if (t.scope === "agent" && t.agent_id) map[t.agent_id] = t;
    });
    setAgentTargets(map);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const saveCompany = async () => {
    setSavingKey("company");
    const payload = {
      scope: "company",
      agent_id: null,
      life_revenue_target: Number(company.life_revenue_target) || 0,
      health_revenue_target: Number(company.health_revenue_target) || 0,
      addon_revenue_target: Number(company.addon_revenue_target) || 0,
      life_attach_ratio_target: Number(company.life_attach_ratio_target) || 0,
      health_attach_ratio_target: Number(company.health_attach_ratio_target) || 0,
      addon_attach_ratio_target: Number(company.addon_attach_ratio_target) || 0
    };
    const {
      error
    } = company.id ? await supabase.from("targets").update(payload).eq("id", company.id) : await supabase.from("targets").insert(payload);
    setSavingKey(null);
    if (error) return toast.error(error.message);
    toast.success("Company targets saved");
    load();
  };
  const getAgentDraft = (agentId) => agentTargets[agentId] ?? {
    scope: "agent",
    agent_id: agentId,
    ...EMPTY_TARGET
  };
  const updateAgentDraft = (agentId, patch) => {
    setAgentTargets((prev) => ({
      ...prev,
      [agentId]: {
        ...getAgentDraft(agentId),
        ...patch
      }
    }));
  };
  const saveAgent = async (agentId) => {
    const draft = getAgentDraft(agentId);
    setSavingKey(agentId);
    const payload = {
      scope: "agent",
      agent_id: agentId,
      life_revenue_target: Number(draft.life_revenue_target) || 0,
      health_revenue_target: Number(draft.health_revenue_target) || 0,
      addon_revenue_target: Number(draft.addon_revenue_target) || 0,
      life_attach_ratio_target: Number(draft.life_attach_ratio_target) || 0,
      health_attach_ratio_target: Number(draft.health_attach_ratio_target) || 0,
      addon_attach_ratio_target: Number(draft.addon_attach_ratio_target) || 0
    };
    const {
      error
    } = draft.id ? await supabase.from("targets").update(payload).eq("id", draft.id) : await supabase.from("targets").insert(payload);
    setSavingKey(null);
    if (error) return toast.error(error.message);
    toast.success("Agent targets saved");
    load();
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) });
  }
  const selectedDraft = selectedAgent ? getAgentDraft(selectedAgent) : null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Company Targets" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Goals applied to the company as a whole." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx(TargetFields, { value: company, onChange: (patch) => setCompany((c) => ({
          ...c,
          ...patch
        })) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsxs(Button, { onClick: saveCompany, disabled: savingKey === "company", children: [
          savingKey === "company" ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          "Save company targets"
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Agent Targets" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Override goals for a specific agent." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground", children: "Agent" }),
          /* @__PURE__ */ jsxs(Select, { value: selectedAgent, onValueChange: setSelectedAgent, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "max-w-md", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select an agent" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: agents.map((a) => /* @__PURE__ */ jsxs(SelectItem, { value: a.id, children: [
              a.display_name,
              agentTargets[a.id] ? " ✓" : ""
            ] }, a.id)) })
          ] })
        ] }),
        selectedAgent && selectedDraft && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(TargetFields, { value: selectedDraft, onChange: (patch) => updateAgentDraft(selectedAgent, patch) }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(Button, { onClick: () => saveAgent(selectedAgent), disabled: savingKey === selectedAgent, children: [
            savingKey === selectedAgent ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
            "Save agent targets"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
function TargetFields({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Life Insurance revenue ($)" }),
      /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: "0.01", value: value.life_revenue_target, onChange: (e) => onChange({
        life_revenue_target: Number(e.target.value)
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Health Insurance revenue ($)" }),
      /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: "0.01", value: value.health_revenue_target, onChange: (e) => onChange({
        health_revenue_target: Number(e.target.value)
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Add-on revenue ($)" }),
      /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: "0.01", value: value.addon_revenue_target, onChange: (e) => onChange({
        addon_revenue_target: Number(e.target.value)
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Life attach ratio (%)" }),
      /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 100, step: "0.1", value: value.life_attach_ratio_target, onChange: (e) => onChange({
        life_attach_ratio_target: Number(e.target.value)
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Health attach ratio (%)" }),
      /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 100, step: "0.1", value: value.health_attach_ratio_target, onChange: (e) => onChange({
        health_attach_ratio_target: Number(e.target.value)
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Add-on attach ratio (%)" }),
      /* @__PURE__ */ jsx(Input, { type: "number", min: 0, max: 100, step: "0.1", value: value.addon_attach_ratio_target, onChange: (e) => onChange({
        addon_attach_ratio_target: Number(e.target.value)
      }) })
    ] })
  ] });
}
export {
  SettingsPage as component
};
