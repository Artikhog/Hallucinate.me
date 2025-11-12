import { AuthProvider } from "@/features/auth/lib/auth-provider"
import { router } from "@/pages/router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <>
        <RouterProvider router={router} />
        </>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
