import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  queryClient: QueryClient;
  session: Session | null;
};

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient, session: null } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
