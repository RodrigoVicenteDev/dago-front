import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Cargo {
  id: number;
  nome: string;
}

export default function CargosPage() {
  const { token } = useAuth();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [novoCargo, setNovoCargo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🟢 Buscar cargos ao carregar a página
  const carregarCargos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/Cargo/listar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCargos(res.data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar cargos.");
    }
  };

  useEffect(() => {
    carregarCargos();
  }, []);

  // ➕ Cadastrar novo cargo
  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCargo.trim()) return;

    setLoading(true);
    setErro(null);
    setMensagem(null);

    try {
      await axios.post(
        `${API_URL}/api/Cargo/cadastrar`,
        { nome: novoCargo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagem("Cargo cadastrado com sucesso!");
      setNovoCargo("");
      carregarCargos();
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar cargo.");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Deletar cargo
  const handleDeletar = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cargo?")) return;

    try {
      await axios.delete(`${API_URL}/api/Cargo/deletar/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensagem("Cargo excluído com sucesso!");
      setCargos(cargos.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      setErro("Erro ao excluir cargo.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Gerenciar Cargos</h1>

      {/* Formulário */}
      <form
        onSubmit={handleCadastrar}
        className="flex items-center gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Novo cargo"
          value={novoCargo}
          onChange={e => setNovoCargo(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg transition"
        >
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      {/* Mensagens */}
      {erro && (
        <div className="mb-4 text-sm rounded-lg border border-red-400 bg-red-50 text-red-600 px-3 py-2">
          {erro}
        </div>
      )}
      {mensagem && (
        <div className="mb-4 text-sm rounded-lg border border-emerald-400 bg-emerald-50 text-emerald-600 px-3 py-2">
          {mensagem}
        </div>
      )}

      {/* Lista de cargos */}
      <div className="border-t border-slate-200 pt-4">
        {cargos.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum cargo cadastrado.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {cargos.map(cargo => (
              <li
                key={cargo.id}
                className="flex items-center justify-between py-2 group"
              >
                <span className="text-slate-700 capitalize">
                  {cargo.nome}
                </span>
                <button
                  onClick={() => handleDeletar(cargo.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-500"
                  title="Excluir cargo"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
