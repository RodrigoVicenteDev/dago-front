import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, ArrowLeft, UserCog } from "lucide-react";

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargoId: number;
  clientes: Cliente[];
}

interface Cargo {
  id: number;
  nome: string;
}

export default function EditarUsuarioPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [clientesDisponiveis, setClientesDisponiveis] = useState<Cliente[]>([]);
  const [clientesAtribuidos, setClientesAtribuidos] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargoId, setCargoId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // 🔹 carregar usuário, cargos e clientes
  useEffect(() => {
    async function carregarDados() {
      try {
        const [usuarioRes, cargosRes, clientesRes] = await Promise.all([
          axios.get(`${API_URL}/api/Usuario/busca/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/Cargo/listar`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/Cliente`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const u: Usuario = usuarioRes.data;
        setUsuario(u);
        setNome(u.nome);
        setEmail(u.email);
        setCargoId(u.cargoId);
        setCargos(cargosRes.data);
        setClientesAtribuidos(u.clientes || []);

        // filtra clientes não atribuídos
        const atribuIds = new Set(u.clientes.map(c => c.id));
        const disponiveis = clientesRes.data.filter(
          (c: Cliente) => !atribuIds.has(c.id)
        );
        setClientesDisponiveis(disponiveis);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar informações do usuário.");
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id]);

  // 🔹 mover cliente de um lado para outro
  const moverCliente = (id: number, destino: "atribuir" | "remover") => {
    if (destino === "atribuir") {
      const cliente = clientesDisponiveis.find(c => c.id === id);
      if (!cliente) return;
      setClientesDisponiveis(prev => prev.filter(c => c.id !== id));
      setClientesAtribuidos(prev => [...prev, cliente]);
    } else {
      const cliente = clientesAtribuidos.find(c => c.id === id);
      if (!cliente) return;
      setClientesAtribuidos(prev => prev.filter(c => c.id !== id));
      setClientesDisponiveis(prev => [...prev, cliente]);
    }
  };

  // 🔹 salvar alterações
  async function salvarAlteracoes(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setSalvando(true);
    setErro(null);
    setMensagem(null);

    try {
      await axios.patch(
        `${API_URL}/api/Usuario/atualizar/${usuario.id}`,
        {
          nome,
          email,
          cargoId,
          clientesIds: clientesAtribuidos.map(c => c.id),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensagem("Usuário atualizado com sucesso!");
      setTimeout(() => navigate("/parametros/usuarios"), 1500);
    } catch (err: any) {
  console.error("Erro no cadastro:", err.response?.data);
  alert("Erro 400: " + JSON.stringify(err.response?.data, null, 2));

    } finally {
      setSalvando(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Carregando dados...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <UserCog className="text-emerald-500" /> Editar Usuário
      </h1>

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

      <form onSubmit={salvarAlteracoes} className="space-y-6">
        {/* Campos básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cargo
            </label>
            <select
              value={cargoId}
              onChange={e => setCargoId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            >
              {cargos.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual list */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Atribuição de Clientes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Esquerda */}
            <div className="border rounded-lg p-3 bg-slate-50 h-64 overflow-y-auto">
              <p className="text-sm text-slate-500 font-medium mb-2">
                Clientes disponíveis
              </p>
              {clientesDisponiveis.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum disponível</p>
              ) : (
                clientesDisponiveis.map(c => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center bg-white rounded-md px-3 py-2 mb-2 border hover:shadow-sm"
                  >
                    <span className="text-slate-700 text-sm font-medium">
                      {c.nome}
                    </span>
                    <button
                      type="button"
                      onClick={() => moverCliente(c.id, "atribuir")}
                      className="text-emerald-500 hover:text-emerald-600"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Espaço central */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="flex flex-col gap-4">
                <ArrowRight className="text-slate-400" />
                <ArrowLeft className="text-slate-400" />
              </div>
            </div>

            {/* Direita */}
            <div className="border rounded-lg p-3 bg-slate-50 h-64 overflow-y-auto">
              <p className="text-sm text-slate-500 font-medium mb-2">
                Clientes atribuídos
              </p>
              {clientesAtribuidos.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum atribuído</p>
              ) : (
                clientesAtribuidos.map(c => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center bg-white rounded-md px-3 py-2 mb-2 border hover:shadow-sm"
                  >
                    <span className="text-slate-700 text-sm font-medium">
                      {c.nome}
                    </span>
                    <button
                      type="button"
                      onClick={() => moverCliente(c.id, "remover")}
                      className="text-red-500 hover:text-red-600"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Botão salvar */}
        <div className="text-right">
          <button
            type="submit"
            disabled={salvando}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
