import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { Settings2, Save, RefreshCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Cliente {
  id: number;
  nome: string;
}

interface Unidade {
  id: number;
  nome: string;
  estado?: { id: number; nome: string; sigla: string };
}

export default function EsporadicosPage() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);

  // 🟢 agora armazenamos IDs (números) ao invés de nomes
  const [clientesExcluidos, setClientesExcluidos] = useState<number[]>([]);
  const [unidadesExcluidas, setUnidadesExcluidas] = useState<number[]>([]);
  const [destinatariosExcluidos, setDestinatariosExcluidos] = useState<string[]>([]);

  const [novoDestinatario, setNovoDestinatario] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // 🔹 Buscar listas auxiliares (clientes + unidades)
  async function carregarListas() {
    try {
      const [clientesRes, undsRes] = await Promise.all([
        axios.get(`${API_URL}/api/Cliente`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/unidade/listar`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setClientes(clientesRes.data || []);
      setUnidades(undsRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar listas:", err);
    }
  }

  // 🔹 Buscar configuração atual
  async function carregarConfiguracoes() {
    setLoading(true);
    setErro(null);
    try {
      const res = await axios.get(`${API_URL}/api/configuracoes-esporadico`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Espera IDs do backend
      setClientesExcluidos(res.data.clientesExcluidos || []);
      setUnidadesExcluidas(res.data.unidadesExcluidas || []);
      setDestinatariosExcluidos(res.data.destinatariosExcluidos || []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMensagem("Nenhuma configuração encontrada. Crie uma nova.");
      } else {
        setErro("Erro ao carregar configurações.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarListas();
    carregarConfiguracoes();
  }, []);

  // 🔹 Salvar configuração
  async function salvarConfiguracoes() {
    setLoading(true);
    setMensagem(null);
    setErro(null);
    try {
      const payload = {
        clientesExcluidos,
        unidadesExcluidas,
        destinatariosExcluidos,
      };
      await axios.post(`${API_URL}/api/configuracoes-esporadico`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensagem("Configurações atualizadas com sucesso!");
    } catch (err) {
      console.error(err);
      setErro("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  }

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: "#cbd5e1",
      minHeight: "38px",
      boxShadow: "none",
      "&:hover": { borderColor: "#94a3b8" },
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Settings2 className="text-emerald-500" /> Configuração de Esporádicos
      </h1>

      {erro && <div className="text-red-600 text-sm mb-3">{erro}</div>}
      {mensagem && <div className="text-emerald-600 text-sm mb-3">{mensagem}</div>}

      {loading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <>
          {/* CLIENTES */}
          <section className="mb-6">
            <h2 className="font-medium text-slate-700 mb-2">Clientes Excluídos</h2>
            <Select
              isMulti
              value={clientes
                .filter((c) => clientesExcluidos.includes(c.id))
                .map((c) => ({ value: c.id, label: c.nome }))}
              onChange={(opts) => setClientesExcluidos(opts.map((o) => o.value))}
              options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
              placeholder="Selecione clientes..."
              closeMenuOnSelect={false}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </section>

          {/* UNIDADES */}
          <section className="mb-6">
            <h2 className="font-medium text-slate-700 mb-2">Unidades Excluídas</h2>
            <Select
              isMulti
              value={unidades
                .filter((u) => unidadesExcluidas.includes(u.id))
                .map((u) => ({
                  value: u.id,
                  label: `${u.nome}${u.estado ? ` (${u.estado.sigla})` : ""}`,
                }))}
              onChange={(opts) => setUnidadesExcluidas(opts.map((o) => o.value))}
              options={unidades.map((u) => ({
                value: u.id,
                label: `${u.nome}${u.estado ? ` (${u.estado.sigla})` : ""}`,
              }))}
              placeholder="Selecione unidades..."
              closeMenuOnSelect={false}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </section>

          {/* DESTINATÁRIOS */}
          <section className="mb-6">
            <h2 className="font-medium text-slate-700 mb-2">Destinatários Excluídos</h2>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nome do destinatário"
                value={novoDestinatario}
                onChange={(e) => setNovoDestinatario(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1"
              />
              <button
                onClick={() => {
                  if (novoDestinatario.trim()) {
                    setDestinatariosExcluidos((prev) => [
                      ...prev,
                      novoDestinatario.trim(),
                    ]);
                    setNovoDestinatario("");
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm"
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {destinatariosExcluidos.map((nome) => (
                <span
                  key={nome}
                  className="bg-slate-100 px-3 py-1 rounded-full text-sm text-slate-700 flex items-center gap-2"
                >
                  {nome}
                  <button
                    onClick={() =>
                      setDestinatariosExcluidos((prev) =>
                        prev.filter((n) => n !== nome)
                      )
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              {destinatariosExcluidos.length === 0 && (
                <p className="text-slate-400 text-sm">Nenhum destinatário excluído.</p>
              )}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                carregarConfiguracoes();
                carregarListas();
              }}
              className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600"
            >
              <RefreshCcw size={16} /> Recarregar
            </button>
            <button
              onClick={salvarConfiguracoes}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-lg transition"
            >
              <Save size={16} /> {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
