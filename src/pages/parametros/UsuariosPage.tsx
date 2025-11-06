import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, UserPlus, Users, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: { id: number; nome: string };
}

interface Cargo {
  id: number;
  nome: string;
}

export default function UsuariosPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargoId, setCargoId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarUsuarios();
    listarCargos();
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
    }
  }

  async function listarCargos() {
    try {
      const res = await axios.get(`${API_URL}/api/Cargo/listar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCargos(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setLoading(true);
    console.log("Payload final:", {
  nome,
  email,
  senha,
  cargoId,
  clientesID: []
});
    try {
      await axios.post(
        `${API_URL}/api/Usuario/cadastrar`,
        { nome, email, senha, cargoId, clientesID: [] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMensagem("Usuário cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setCargoId("");
      listarUsuarios();
    } catch (err: any) {
  console.error("Erro no cadastro:", err.response?.data);
  alert("Erro 400: " + JSON.stringify(err.response?.data, null, 2));

    } finally {
      setLoading(false);
    }
  }

  async function deletarUsuario(id: number) {
    if (!confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await axios.delete(`${API_URL}/api/Usuario/deletar/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir usuário.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <Users className="text-emerald-500" /> Usuários
        </h1>
      </div>

      {/* Formulário */}
      <form onSubmit={cadastrarUsuario} className="flex flex-col sm:flex-row gap-3 mb-8 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
          />
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
          />
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
          <select
            value={cargoId}
            onChange={e => setCargoId(Number(e.target.value))}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
          >
            <option value="">Selecione</option>
            {cargos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <UserPlus size={18} />
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {/* Mensagens */}
      {erro && (
        <div className="text-red-500 text-sm mb-3 border border-red-200 bg-red-50 rounded-md p-2">
          {erro}
        </div>
      )}
      {mensagem && (
        <div className="text-emerald-600 text-sm mb-3 border border-emerald-200 bg-emerald-50 rounded-md p-2">
          {mensagem}
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
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
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 border-b border-slate-100">
                <td className="p-3">{u.id}</td>
                <td className="p-3 font-medium text-slate-800">{u.nome}</td>
                <td className="p-3 text-slate-600">{u.email}</td>
                <td className="p-3 text-slate-600">{u.cargo?.nome}</td>
                <td className="p-3 text-right flex justify-end gap-3">
                  <button
                    onClick={() => navigate(`/parametros/usuarios/editar/${u.id}`)}
                    className="text-emerald-500 hover:text-emerald-700 transition"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deletarUsuario(u.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-slate-500">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
