// src/components/minhaTabela/useCtrcData.ts
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

type StatusEntrega = { id: number; nome: string };

export function useCtrcData() {
  const { token, usuario } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // ------------------------------
  // ESTADOS PRINCIPAIS
  // ------------------------------
  const [allRows, setAllRows] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<StatusEntrega[]>([]);
  const [statusesById, setStatusesById] = useState<Record<number, string>>({});
  const [dirty, setDirty] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  const [periodo, setPeriodo] = useState({ dataInicio: "", dataFim: "" });
  const [unidades, setUnidades] = useState<string[]>([]);

  // gridRef para usar node.setDataValue e autosize
  const gridRef = useRef<any>(null);

  // Esporádico (mesma lógica do antigo)
  const ESPORADICO_ID = 3573;
  const isEsporadico = usuario?.clientes?.some(
    c => Number(c.id) === ESPORADICO_ID,
  );

  // ------------------------------
  // AGENDA (MESMA IDEIA DO ANTIGO)
  // ------------------------------
  const [agendaModalVisible, setAgendaModalVisible] = useState(false);
  const [agendaCTRCId, setAgendaCTRCId] = useState<number | null>(null);
  const [agendaDataAtual, setAgendaDataAtual] = useState<string | null>(null);

  function handleAbrirAgendaModal(id: number, data: string | null) {
    setAgendaCTRCId(id);
    setAgendaDataAtual(data);
    setAgendaModalVisible(true);
  }

  async function handleSalvarAgenda({ ctrcId, tipoAgendaId, dataAgenda }: any) {
    try {
      // mesma ideia do antigo: só atualiza front,
      // o Modal já faz o PUT dele se precisar
      setRows(prev =>
        prev.map(r =>
          r.id === ctrcId ? { ...r, dataAgenda, tipoAgendaId } : r,
        ),
      );
      setAllRows(prev =>
        prev.map(r =>
          r.id === ctrcId ? { ...r, dataAgenda, tipoAgendaId } : r,
        ),
      );
    } catch (err) {
      console.error("Erro ao salvar agenda:", err);
    } finally {
      setAgendaModalVisible(false);
    }
  }

  // ------------------------------
  // CARREGAR GRID (baseado no antigo fetchGrid)
  // ------------------------------
  async function fetchGrid() {
    setLoading(true);
    try {
      const [gridRes, lookupsRes] = await Promise.all([
        axios.get(`${API_URL}/api/ctrcs/grid`, {
          params: periodo,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/ctrcs/lookups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const data = gridRes.data ?? [];
      setAllRows(data);
      setRows(data);

      const unds = Array.from(new Set(data.map((r: any) => r.unidade)))
        .filter(Boolean)
        .sort();
      setUnidades(unds);

      const apiStatuses: StatusEntrega[] =
        lookupsRes.data?.statusesEntrega &&
        Array.isArray(lookupsRes.data.statusesEntrega)
          ? lookupsRes.data.statusesEntrega
          : [];

      const fallbackStatuses: StatusEntrega[] = [
        { id: 1, nome: "ENTREGUE NO PRAZO" },
        { id: 2, nome: "ATRASADA" },
        { id: 3, nome: "ENTREGUE COM ATRASO" },
        { id: 4, nome: "AG. AGENDA" },
        { id: 5, nome: "HOJE" },
        { id: 6, nome: "OCORRENCIA" },
        { id: 7, nome: "NO PRAZO" },
        { id: 8, nome: "ENTR. AGENDADA" },
        { id: 9, nome: "PENDENTE BAIXA" },
        { id: 10, nome: "CANCELADA" },
        { id: 11, nome: "REAGENDAR" },
      ];

      const finalStatuses = apiStatuses.length ? apiStatuses : fallbackStatuses;

      setStatuses(finalStatuses);
      setStatusesById(
        finalStatuses.reduce<Record<number, string>>((acc, s) => {
          acc[s.id] = s.nome;
          return acc;
        }, {}),
      );

      // autosize depois que dados carregarem
      setTimeout(() => autoSizeAllColumns(), 300);
    } catch (err) {
      console.error("Erro ao carregar grid:", err);
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------
  // AUTOSIZE DAS COLUNAS
  // ------------------------------
  function autoSizeAllColumns() {
    if (!gridRef.current) return;
    const columnApi = gridRef.current.columnApi;
    if (!columnApi) return;

    const allColumnIds: string[] = [];
    columnApi.getAllColumns().forEach((col: any) => {
      allColumnIds.push(col.getId());
    });

    columnApi.autoSizeColumns(allColumnIds, false);
  }

  // ------------------------------
  // PERÍODO INICIAL (mesma lógica: últimos 60 dias)
  // ------------------------------
  useEffect(() => {
    const hoje = new Date();
    const fim = hoje.toISOString().split("T")[0];
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 60);
    const inicioStr = inicio.toISOString().split("T")[0];
    setPeriodo({ dataInicio: inicioStr, dataFim: fim });
  }, []);

  // quando período mudar, recarrega grid
  useEffect(() => {
    if (periodo.dataInicio && periodo.dataFim) {
      fetchGrid();
    }
  }, [periodo.dataInicio, periodo.dataFim]);

  // ------------------------------
  // RETORNO PARA A PAGE / OUTROS HOOKS
  // ------------------------------
  return {
    // dados
    rows,
    setRows,
    allRows,
    setAllRows,

    // autosave
    dirty,
    setDirty,

    // lookups
    unidades,
    statuses,
    statusesById,

    // período
    periodo,
    setPeriodo,

    // loading
    loading,

    // esporádico
    isEsporadico,
    token,

    // grid
    gridRef,
    fetchGrid,
    autoSizeAllColumns,

    // agenda
    agendaModalVisible,
    setAgendaModalVisible,
    agendaCTRCId,
    agendaDataAtual,
    handleAbrirAgendaModal,
    handleSalvarAgenda,
  };
}

export default useCtrcData;
