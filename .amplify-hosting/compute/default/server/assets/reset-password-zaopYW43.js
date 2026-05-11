import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useAuth, L as Label, I as Input, B as Button, s as supabase } from "./router-CvBcNStb.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-CY8TFgFJ.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
function ResetPasswordPage() {
  const {
    user,
    profile,
    loading,
    refresh
  } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login"
      });
    }
  }, [loading, user, navigate]);
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
    if (user) {
      await supabase.from("profiles").update({
        must_change_password: false
      }).eq("id", user.id);
    }
    await refresh();
    toast.success("Password updated.");
    navigate({
      to: "/dashboard"
    });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Set a new password" }),
      /* @__PURE__ */ jsx(CardDescription, { children: profile?.must_change_password ? "You're using a temporary password. Please set a new one to continue." : "Update your account password." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New password" }),
        /* @__PURE__ */ jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), minLength: 8, required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "confirm", children: "Confirm password" }),
        /* @__PURE__ */ jsx(Input, { id: "confirm", type: "password", value: confirm, onChange: (e) => setConfirm(e.target.value), minLength: 8, required: true })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: submitting, children: submitting ? "Saving..." : "Update password" })
    ] }) })
  ] }) });
}
export {
  ResetPasswordPage as component
};
