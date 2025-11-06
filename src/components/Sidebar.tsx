import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, Users, Briefcase, Building2, Upload, Edit3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [parametrosOpen, setParametrosOpen] = useState(false);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const podeVerParametros = usuario?.cargo === "gerente"; // 👈 apenas cargoId 2 vê o menu

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col border-r border-white/10 shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/usuarios")}
        >
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-emerald-400 font-bold">DG</span>
          </div>
          {open && <span className="font-semibold text-lg">Painel</span>}
        </div>

        <button onClick={() => setOpen(!open)} className="p-1 text-slate-300 hover:text-white">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu principal */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {/* Meu Usuário */}
        <button
          onClick={() => navigate("/meu-usuario")}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-white/10 transition"
        >
          <User size={20} className="text-emerald-400" />
          {open && <span>Meu Usuário</span>}
        </button>
        <button
  onClick={() => navigate("/minha-tabela")}
  className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-white/10 transition"
>
  <Edit3 size={20} className="text-emerald-400" />
  {open && <span>Minha Tabela</span>}
</button>

        {/* ✅ Parâmetros (somente cargoId 2) */}
        {podeVerParametros && (
          <div>
            <button
              onClick={() => setParametrosOpen(!parametrosOpen)}
              className="flex items-center justify-between w-full rounded-lg px-3 py-2 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-emerald-400" />
                {open && <span>Parâmetros</span>}
              </div>
              {open && (
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    parametrosOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {/* Submenus (animados) */}
            <div
              className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all ${
                parametrosOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <button
                onClick={() => navigate("/parametros/uploads/csv-455")}
                className="flex items-center gap-2 w-full text-sm rounded-lg px-3 py-2 hover:bg-white/10 transition text-slate-300"
              >
                <Upload size={16} className="text-emerald-400" />
                {open && "Upload CSV-455"}
              </button>
              <button
                onClick={() => navigate("/parametros/cargos")}
                className="flex items-center gap-2 w-full text-sm rounded-lg px-3 py-2 hover:bg-white/10 transition text-slate-300"
              >
                <Briefcase size={16} className="text-emerald-400" />
                {open && "Cargos"}
              </button>

              <button
                onClick={() => navigate("/parametros/clientes")}
                className="flex items-center gap-2 w-full text-sm rounded-lg px-3 py-2 hover:bg-white/10 transition text-slate-300"
              >
                <Building2 size={16} className="text-emerald-400" />
                {open && "Clientes"}
              </button>

              <button
                onClick={() => navigate("/parametros/usuarios")}
                className="flex items-center gap-2 w-full text-sm rounded-lg px-3 py-2 hover:bg-white/10 transition text-slate-300"
              >
                <Users size={16} className="text-emerald-400" />
                {open && "Usuários"}
              </button>
              <button
                onClick={() => navigate("/parametros/gerenciar-senhas")}
                className="flex items-center gap-2 w-full text-sm rounded-lg px-3 py-2 hover:bg-white/10 transition text-slate-300"
              >
                <Settings size={16} className="text-emerald-400" />
                {open && "Gerenciar Senhas"}
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 hover:bg-white/10 transition mt-auto"
        >
          <LogOut size={20} className="text-emerald-400" />
          {open && <span>Sair</span>}
        </button>
      </nav>
    </div>
  );
}
