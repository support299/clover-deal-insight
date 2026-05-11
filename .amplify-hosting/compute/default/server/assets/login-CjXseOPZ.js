import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { l as logo } from "./aftermath-logo-BME8kEpR.js";
import { u as useAuth, L as Label, I as Input, B as Button, s as supabase } from "./router-CvBcNStb.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72)
});
function LoginPage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [loading, user, navigate]);
  const onSubmit = async (e) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      email,
      password
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        email: flat.email?.[0],
        password: flat.password?.[0]
      });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const {
      error
    } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4 py-10", children: /* @__PURE__ */ jsxs("div", { className: "surface-card w-full max-w-md p-8", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-8 flex justify-center", children: /* @__PURE__ */ jsx("img", { src: logo, alt: "Aftermath Insurance Group", className: "h-14 w-auto" }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Welcome back" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to the Performance Dashboard." }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", autoComplete: "email", value: email, onChange: (e) => setEmail(e.target.value) }),
        errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", autoComplete: "current-password", value: password, onChange: (e) => setPassword(e.target.value) }),
        errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: errors.password })
      ] }),
      /* @__PURE__ */ jsxs(Button, { type: "submit", className: "w-full", disabled: submitting, children: [
        submitting && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Sign in"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/signup", className: "font-medium text-primary hover:underline", children: "Create one" })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
