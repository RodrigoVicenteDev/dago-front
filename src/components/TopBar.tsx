import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  Users,
  Briefcase,
  Building2,
  Upload,
  Edit3,
  Settings2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const [parametrosOpen, setParametrosOpen] = useState(false);
  const parametrosRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const podeVerParametros = usuario?.cargo === "gerente";

  // 🔥 FECHAR MENU QUANDO CLICAR FORA
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (parametrosRef.current && !parametrosRef.current.contains(e.target as Node)) {
        setParametrosOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 Função para navegação que também fecha o dropdown
  const go = (path: string) => {
    setParametrosOpen(false);
    navigate(path);
  };

  return (
    <div className="w-full h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-white/10 shadow-lg flex items-center px-4 select-none">
      {/* LOGO */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => go("/usuarios")}>
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
          <span className="text-emerald-400 font-bold">DG</span>
        </div>
        <span className="font-semibold text-lg">Painel</span>
      </div>

      {/* Menus */}
      <div className="flex items-center gap-6 ml-10 text-sm">
        <button
          onClick={() => go("/meu-usuario")}
          className="flex items-center gap-2 hover:text-emerald-400 transition"
        >
          <User size={18} className="text-emerald-400" /> Meu Usuário
        </button>

        <button
          onClick={() => go("/minha-tabela")}
          className="flex items-center gap-2 hover:text-emerald-400 transition"
        >
          <Edit3 size={18} className="text-emerald-400" /> Minha Tabela
        </button>

        {/* 🔥 Dropdown Parâmetros com clique-fora */}
        {podeVerParametros && (
          <div className="relative" ref={parametrosRef}>
            <button
              onClick={() => setParametrosOpen(!parametrosOpen)}
              className="flex items-center gap-2 hover:text-emerald-400 transition"
            >
              <Settings size={18} className="text-emerald-400" />
              Parâmetros
              <ChevronDown
                size={16}
                className={`transition-transform ${parametrosOpen ? "rotate-180" : ""}`}
              />
            </button>

            {parametrosOpen && (
              <div className="absolute top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-lg shadow-xl p-2 z-50">
                <div className="flex flex-col gap-1">
                  {" "}
                  {/* ← AGRUPA EM COLUNA */}
                  <button
                    onClick={() => go("/parametros/uploads/csv-455")}
                    className="dropdown-item"
                  >
                    <Upload size={16} className="text-emerald-400" />
                    Upload CSV-455
                  </button>
                  <button onClick={() => go("/parametros/cargos")} className="dropdown-item">
                    <Briefcase size={16} className="text-emerald-400" />
                    Cargos
                  </button>
                  <button onClick={() => go("/parametros/clientes")} className="dropdown-item">
                    <Building2 size={16} className="text-emerald-400" />
                    Clientes
                  </button>
                  <button onClick={() => go("/parametros/usuarios")} className="dropdown-item">
                    <Users size={16} className="text-emerald-400" />
                    Usuários
                  </button>
                  <button
                    onClick={() => go("/parametros/gerenciar-senhas")}
                    className="dropdown-item"
                  >
                    <Settings size={16} className="text-emerald-400" />
                    Gerenciar Senhas
                  </button>
                  <button onClick={() => go("/parametros/esporadicos")} className="dropdown-item">
                    <Settings2 size={16} className="text-emerald-400" />
                    Esporádicos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="ml-auto">
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-2 hover:text-emerald-400 transition"
        >
          <LogOut size={18} className="text-emerald-400" />
          Sair
        </button>
      </div>
      <style>{`
  .dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    color: #e2e8f0;
    background: transparent;
    transition: background 0.15s;
  }
  .dropdown-item:hover {
    background: rgba(255,255,255,0.08);
  }
`}</style>
    </div>
  );
}
