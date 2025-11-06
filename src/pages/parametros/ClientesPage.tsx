import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Building2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  usuario?: {
    id: number;
    nome: string;
  };
}

export default function ClientesPage() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // 🔹 listar clientes ao carregar
  useEffect(() => {
    listarClientes();
  }, []);

  async function listarClientes() {
    try {
      const res = await axios.get(`${API_URL}/api/Cliente`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(res.data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao listar clientes.");
    }
  }

  // 🔹 cadastrar novo cliente
  async function cadastrarCliente(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/Cliente/cadastrar`,
        { nome, cnpj },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMensagem("Cliente cadastrado com sucesso!");
      setNome("");
      setCnpj("");
      listarClientes();
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 deletar cliente
  async function deletarCliente(id: number) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    try {
      await axios.delete(`${API_URL}/api/Cliente/deletar/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(clientes.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir cliente.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
          <Building2 className="text-emerald-500" /> Clientes
        </h1>
      </div>

      {/* Formulário */}
      <form
        onSubmit={cadastrarCliente}
        className="flex flex-col sm:flex-row gap-3 mb-8 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            placeholder="Nome do cliente"
          />
        </div>
        <div className="w-56">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            CNPJ
          </label>
          <input
            type="text"
            value={cnpj}
            onChange={e => setCnpj(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

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

      {/* Tabela de clientes */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="text-left p-3 border-b">ID</th>
              <th className="text-left p-3 border-b">Nome</th>
              <th className="text-left p-3 border-b">CNPJ</th>
              <th className="text-left p-3 border-b">Responsável</th>
              <th className="text-right p-3 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr
                key={cliente.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                <td className="p-3">{cliente.id}</td>
                <td className="p-3 font-medium text-slate-800">
                  {cliente.nome}
                </td>
                <td className="p-3 text-slate-600">{cliente.cnpj}</td>
                <td className="p-3 text-slate-600">
                  {cliente.usuario ? cliente.usuario.nome : "-"}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => deletarCliente(cliente.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Excluir cliente"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-slate-500">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
