import { AuthProvider } from "@/features/auth/lib/auth-provider"
import { router } from "@/pages/router"
import { RouterProvider } from "react-router-dom"

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
