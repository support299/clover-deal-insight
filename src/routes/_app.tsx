import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";
import platformBg from "@/assets/aftermath-logo.png";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile?.must_change_password && location.pathname !== "/reset-password") {
      navigate({ to: "/reset-password" });
    }
  }, [loading, user, profile, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (profile?.must_change_password) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-black bg-center bg-no-repeat bg-contain"
      style={{ backgroundImage: `url(${platformBg})`, backgroundAttachment: "fixed" }}
    >
      <TopNav />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

