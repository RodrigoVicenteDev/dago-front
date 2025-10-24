import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";

export default function UserPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Carregando informações do usuário...
      </div>
    );
  }

  const cliente = usuario.clientes?.[0];

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-2xl border border-slate-200 p-8 relative">
      {/* Botão de editar */}
      <button
        onClick={() => navigate(`/meu-usuario/editar/${usuario.id}`)}
        className="absolute top-5 right-5 p-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition"
        title="Editar usuário"
      >
        <Pencil size={18} />
      </button>

      {/* Saudação */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-800">
          Olá, <span className="text-emerald-600">{usuario.nome}</span> 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Cargo: <span className="font-medium text-slate-700">{usuario.cargo}</span>
        </p>
      </div>

      {/* Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-100 p-6 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Informações pessoais
          </h2>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li>
              <span className="font-medium text-slate-700">ID:</span> {usuario.id}
            </li>
            <li>
              <span className="font-medium text-slate-700">E-mail:</span>{" "}
              {usuario.email}
            </li>
            <li>
              <span className="font-medium text-slate-700">Cargo:</span>{" "}
              {usuario.cargo}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-100 p-6 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Cliente associado
          </h2>
          {cliente ? (
            <>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">Nome:</span>{" "}
                {cliente.nome}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">CNPJ:</span>{" "}
                {cliente.cnpj}
              </p>
            </>
          ) : (
            <p className="text-slate-500 text-sm">Nenhum cliente associado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
