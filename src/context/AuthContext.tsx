import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  clientes: Cliente[];
}

interface AuthContextType {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, usuario?: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true); // 👈 controla carregamento inicial

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    // 🔹 Recupera o usuário logado
    axios
      .get(`${API_URL}/api/Auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then(res => {
        setUsuario(res.data);
        localStorage.setItem("usuario", JSON.stringify(res.data));
      })
      .catch(err => {
        console.error("Erro ao recuperar usuário:", err);
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (newToken: string, newUsuario?: Usuario) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    if (newUsuario) {
      setUsuario(newUsuario);
      localStorage.setItem("usuario", JSON.stringify(newUsuario));
    } else {
      // se não vier no login, busca via /me
      axios
        .get(`${API_URL}/api/Auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        })
        .then(res => {
          setUsuario(res.data);
          localStorage.setItem("usuario", JSON.stringify(res.data));
        })
        .catch(err => {
          console.error("Erro ao buscar usuário após login:", err);
        });
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {/* enquanto verifica o token, mostra um loading */}
      {loading ? (
        <div className="flex items-center justify-center h-screen text-slate-500">
          Carregando sessão...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
