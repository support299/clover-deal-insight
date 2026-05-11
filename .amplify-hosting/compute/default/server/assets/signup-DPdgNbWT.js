import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { l as logo } from "./aftermath-logo-BME8kEpR.js";
import { u as useAuth, s as supabase, L as Label, I as Input, S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem, B as Button } from "./router-CvBcNStb.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
const schema = z.object({
  display_name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Min 8 characters").max(72)
});
function SignupPage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamId, setTeamId] = useState();
  const [teams, setTeams] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    supabase.from("teams").select("id, name").order("name").then(({
      data
    }) => {
      if (data) setTeams(data);
    });
  }, []);
  useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [loading, user, navigate]);
  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      display_name: displayName,
      email,
      password
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        display_name: flat.display_name?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0]
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : void 0,
        data: {
          display_name: parsed.data.display_name
        }
      }
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    if (data.user && teamId) {
      await supabase.from("profiles").update({
        team_id: teamId,
        display_name: parsed.data.display_name
      }).eq("id", data.user.id);
    }
    setSubmitting(false);
    toast.success("Account created!");
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "surface-card w-full max-w-md p-8", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-8 flex justify-center", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "Aftermath Insurance Group", className: "h-14 w-auto" }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Create your account" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Join the Performance Dashboard." }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full name" }),
        /* @__PURE__ */ jsx(Input, { id: "name", value: displayName, onChange: (e) => setDisplayName(e.target.value), autoComplete: "name" }),
        errors.display_name && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.display_name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", autoComplete: "email", value: email, onChange: (e) => setEmail(e.target.value) }),
        errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", autoComplete: "new-password", value: password, onChange: (e) => setPassword(e.target.value) }),
        errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.password })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { children: "Team (optional)" }),
        /* @__PURE__ */ jsxs(Select, { value: teamId, onValueChange: setTeamId, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a team" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: teams.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.id, children: t.name }, t.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "submit", className: "w-full", disabled: submitting, children: [
        submitting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Create account"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
      "Already have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Sign in" })
    ] })
  ] }) });
}
export {
  SignupPage as component
};
