import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import UsersPage from "@/pages/UsersPage";
import DashboardLayout from "./layouts/DashboardLayout";
import UserPage from "@/pages/UsersPage";
import EditUserPage from "./pages/EditUserPage";
import CargosPage from "./pages/parametros/CargosPage";
import ClientesPage from "./pages/parametros/ClientesPage";
import UsuariosPage from "./pages/parametros/UsuariosPage";
import EditarUsuarioPage from "./pages/parametros/EditarUsuarioPage";
import GerenciarSenhasPage from "./pages/parametros/GerenciarSenhasPage";
import Csv455Page from "./pages/parametros/Uploads/Csv455Page";
import MinhaTabelaPage from "./pages/MinhaTabelaPage";
import EsporadicosPage from "./pages/parametros/EsporadicosPage";
import DashboardHome from "./pages/Painel/DashboardHome";

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
            <Route path="painel" element={<DashboardHome />} />
            {/* futuras rotas internas aqui */}

            <Route path="parametros/esporadicos" element={<EsporadicosPage />} />
            <Route path="parametros/gerenciar-senhas" element={<GerenciarSenhasPage />} />
            <Route path="parametros/uploads/csv-455" element={<Csv455Page />} />

            <Route path="parametros/usuarios" element={<UsuariosPage />} />

            <Route path="parametros/usuarios/editar/:id" element={<EditarUsuarioPage />} />
            <Route path="parametros/clientes" element={<ClientesPage />} />
            <Route
              path="/minha-tabela"
              element={
                <ProtectedRoute>
                  <MinhaTabelaPage />
                </ProtectedRoute>
              }
            />

            <Route path="parametros/cargos" element={<CargosPage />} />
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
