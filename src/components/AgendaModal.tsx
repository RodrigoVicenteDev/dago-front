import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TipoAgenda {
  id: number;
  nome: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { ctrcId: number; tipoAgendaId: number; dataAgenda: string }) => void;
  ctrcId: number | null;
}

export default function AgendaModal({ visible, onClose, onSave, ctrcId }: Props) {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // estados locais
  const [tiposAgenda, setTiposAgenda] = useState<TipoAgenda[]>([]);
  const [tipoAgendaId, setTipoAgendaId] = useState<number | "">("");
  const [data, setData] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // 🔹 carregar tipos quando o modal abre
  useEffect(() => {
    if (visible) {
      setErro(null);
      setData("");
      setTipoAgendaId("");
      carregarTipos();
    }
  }, [visible]);

  async function carregarTipos() {
    try {
      const res = await axios.get(`${API_URL}/api/Agenda/api/tiposagenda`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTiposAgenda(res.data);
    } catch (err) {
      console.error("Erro ao carregar tipos de agenda:", err);
      setErro("Falha ao carregar os tipos de agenda.");
    }
  }

  // 🔹 salvar agenda
  async function salvar() {
    if (!ctrcId || !data || !tipoAgendaId) {
      setErro("Selecione o tipo e a data da agenda.");
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      // envia exatamente o formato que o back espera
      await axios.post(
        `${API_URL}/api/agenda`,
        {
          ctrcId,
          tipoAgendaId,
          dataAgenda: data,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // atualiza apenas a linha do grid pai (sem recarregar tudo)
      onSave({
        ctrcId,
        tipoAgendaId: Number(tipoAgendaId),
        dataAgenda: data,
      });

      onClose(); // fecha o modal
    } catch (err: any) {
      console.error("Erro ao salvar agenda:", err);
      setErro("Erro ao salvar agenda.");
    } finally {
      setSalvando(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[95%] max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="text-emerald-500" /> Agendar / Reagendar
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Combo de tipos */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Tipo de agenda</label>
            <select
              value={tipoAgendaId}
              onChange={e => setTipoAgendaId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            >
              <option value="">Selecione...</option>
              {tiposAgenda.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {erro}
            </p>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button" // 🟢 impede reload da página
              onClick={salvar}
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
