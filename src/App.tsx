import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import UsersPage from "@/pages/UsersPage";
import DashboardLayout from "./layouts/DashboardLayout";
import UserPage from "@/pages/UsersPage";
import EditUserPage from "./pages/EditUserPage";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/redefinir-senha" element={<ForgotPasswordPage />} />

          {/* Layout interno (protegido) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="usuarios" element={<UsersPage />} />
            {/* futuras rotas internas aqui */}
            <Route path="meu-usuario" element={<UserPage />} />
            <Route path="meu-usuario/editar/:id" element={<EditUserPage />} />
          </Route>

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
