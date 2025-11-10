import { useEffect, useState } from "react";
import axios from "axios";
import { KeyRound, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function GerenciarSenhasPage() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    listarUsuarios();
  }, []);

  async function listarUsuarios() {
    try {
      const res = await axios.get(`${API_URL}/api/Usuario/listartodos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(res.data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao listar usuários.");
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(usuario: any) {
    setUsuarioSelecionado(usuario);
    setNovaSenha("");
    setMensagem(null);
    setMostrarModal(true);
  }

  function fecharModal() {
    setMostrarModal(false);
  }

  async function alterarSenha() {
    if (!novaSenha || novaSenha.length < 5) {
      setMensagem("A nova senha deve ter pelo menos 5 caracteres.");
      return;
    }

    setSalvando(true);
    setMensagem(null);
    try {
      await axios.patch(
        `${API_URL}/api/Usuario/atualizar/${usuarioSelecionado.id}`,
        { novaSenha },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagem("Senha alterada com sucesso!");
      setTimeout(() => fecharModal(), 1200);
    } catch (err: any) {
      console.error(err);
      setMensagem(err.response?.data?.message ?? "Erro ao alterar senha.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Carregando usuários...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <KeyRound className="text-emerald-500" />
        Gerenciar Senhas
      </h1>

      {erro && (
        <div className="text-red-500 text-sm mb-4 border border-red-200 bg-red-50 rounded-md p-2">
          {erro}
        </div>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 text-slate-700">
            <th className="text-left p-3 border-b">ID</th>
            <th className="text-left p-3 border-b">Nome</th>
            <th className="text-left p-3 border-b">E-mail</th>
            <th className="text-left p-3 border-b">Cargo</th>
            <th className="text-right p-3 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-slate-50 border-b border-slate-100"
            >
              <td className="p-3">{u.id}</td>
              <td className="p-3">{u.nome}</td>
              <td className="p-3 text-slate-600">{u.email}</td>
              <td className="p-3 text-slate-600">
                {u.cargo?.nome ?? "—"}
              </td>
              <td className="p-3 text-right">
                <button
                  onClick={() => abrirModal(u)}
                  className="text-emerald-500 hover:text-emerald-700 transition"
                  title="Alterar senha"
                >
                  <Pencil size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[95%] max-w-md">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Alterar senha de {usuarioSelecionado?.nome}
            </h2>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nova senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-emerald-400 outline-none"
              placeholder="Digite a nova senha"
            />

            {mensagem && (
              <p
                className={`text-sm mb-3 ${
                  mensagem.includes("sucesso")
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {mensagem}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={fecharModal}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={alterarSenha}
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-60"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
