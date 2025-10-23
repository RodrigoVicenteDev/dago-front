import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";



function App() {
  

  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          <Route path="/redefinir-senha" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
