import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import type { AuthUser } from "@/integrations/auth";
import { mapSupabaseUser } from "@/integrations/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw redirect({
        to: "/auth",
        search: { callbackUrl: location.pathname },
      });
    }

    return { user: mapSupabaseUser(session.user) as AuthUser };
  },
  component: () => <Outlet />,
});
