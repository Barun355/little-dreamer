"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * TanStack Query provider.
 *
 * MOUNTED BUT UNUSED in this phase — a marketing landing page has no server
 * state. It exists so the provider tree and devtools are already correct when
 * the generation wizard arrives, rather than being retrofitted then.
 *
 * The QueryClient is created inside useState, never at module scope: a
 * module-scope client is shared across requests on the server and leaks one
 * user's cached data into another's response.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
