import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError } from "@/lib/api-client";

// Create QueryClient instance ONCE outside of the component
// This ensures the cache persists across navigations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        console.log("Retrying request:", { failureCount, error });
        if (error instanceof ApiError) {
          if (
            error.httpStatus &&
            error.httpStatus >= 400 &&
            error.httpStatus < 500
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false, // Prevent refetching when component remounts
    },
    mutations: {
      retry: false,
      onError: (error: any) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Export for use in other parts of the app if needed
export { queryClient };

(globalThis as any).__reactQueryClient = queryClient;

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </QueryClientProvider>
  );
}
