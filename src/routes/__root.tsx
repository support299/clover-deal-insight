import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { AutoLoginHandler } from "@/components/AutoLoginHandler";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Performance Dashboard" },
      { name: "description", content: "Aftermath Insurance Group performance dashboard — track sales, monitor team performance, and climb the leaderboards." },
      { property: "og:title", content: "Performance Dashboard" },
      { name: "twitter:title", content: "Performance Dashboard" },
      { property: "og:description", content: "Aftermath Insurance Group performance dashboard — track sales, monitor team performance, and climb the leaderboards." },
      { name: "twitter:description", content: "Aftermath Insurance Group performance dashboard — track sales, monitor team performance, and climb the leaderboards." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ae2yB6PQyIft21EHc39UKyKFAIl2/social-images/social-1776678895443-Pinnacle_Wellness_Group_hwh.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/ae2yB6PQyIft21EHc39UKyKFAIl2/social-images/social-1776678895443-Pinnacle_Wellness_Group_hwh.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AutoLoginHandler />
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
