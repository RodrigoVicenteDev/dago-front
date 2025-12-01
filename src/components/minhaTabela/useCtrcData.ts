// src/components/minhaTabela/useCtrcData.ts
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useAuth } from "@/context/AuthContext";

ModuleRegistry.registerModules([AllCommunityModule]);

type StatusEntrega = { id: number; nome: string };

export function useCtrcData() {
  const { token, usuario } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // ⚡ Estados principais
  const [allRows, setAllRows] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<StatusEntrega[]>([]);
  const [statusesById, setStatusesById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState({ dataInicio: "", dataFim: "" });
  const [unidades, setUnidades] = useState<string[]>([]);

  const gridRef = useRef<any>(null);

  // ⚡ Cálculo de esporádico (mantido exatamente igual ao original)
  const ESPORADICO_ID = 3573;
  const isEsporadico = usuario?.clientes?.some(
    (c) => Number(c.id) === ESPORADICO_ID
  );

  // ⚡ Agenda modal (só estados)
  const [agendaModalVisible, setAgendaModalVisible] = useState(false);
  const [agendaCTRCId, setAgendaCTRCId] = useState<number | null>(null);
  const [agendaDataAtual, setAgendaDataAtual] = useState<string | null>(null);

  const handleAbrirAgendaModal = (id: number, data: string | null) => {
    setAgendaCTRCId(id);
    setAgendaDataAtual(data);
    setAgendaModalVisible(true);
  };

  const handleSalvarAgenda = ({ ctrcId, tipoAgendaId, dataAgenda }: any) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === ctrcId ? { ...r, dataAgenda, tipoAgendaId } : r
      )
    );
    setAllRows((prev) =>
      prev.map((r) =>
        r.id === ctrcId ? { ...r, dataAgenda, tipoAgendaId } : r
      )
    );
  };

  // Inicializa período padrão (60 dias)
  useEffect(() => {
    const hoje = new Date();
    const fim = hoje.toISOString().split("T")[0];

    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 60);
    const inicioStr = inicio.toISOString().split("T")[0];

    setPeriodo({ dataInicio: inicioStr, dataFim: fim });
  }, []);

  // Função auxiliar
  const autoSizeAllColumns = () => {
    if (!gridRef.current) return;
    const columnApi = gridRef.current.columnApi;
    if (!columnApi) return;
    const allColumnIds: string[] = [];
    columnApi.getAllColumns().forEach((col: any) => allColumnIds.push(col.getId()));
    columnApi.autoSizeColumns(allColumnIds, false);
  };

  // Carrega grid + lookups (mantido 100% idêntico ao original)
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

      // UND únicas
      const unds = Array.from(new Set(data.map((r: any) => r.unidade)))
        .filter(Boolean)
        .sort();
      setUnidades(unds);

      // Statuses + fallback
      const apiStatuses: StatusEntrega[] =
        lookupsRes.data?.statusesEntrega ?? [];

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
        finalStatuses.reduce((acc, s) => {
          acc[s.id] = s.nome;
          return acc;
        }, {} as Record<number, string>)
      );

      setTimeout(() => autoSizeAllColumns(), 300);
    } catch (err) {
      console.error("Erro ao carregar grid:", err);
    } finally {
      setLoading(false);
    }
  }

  // Carrega ao montar
  useEffect(() => {
    fetchGrid();
  }, []);

  return {
    allRows,
    rows,
    setRows,
    statuses,
    statusesById,
    periodo,
    setPeriodo,
    unidades,
    loading,
    isEsporadico,
    fetchGrid,
    gridRef,
    autoSizeAllColumns,

    // agenda
    agendaModalVisible,
    agendaCTRCId,
    agendaDataAtual,
    handleAbrirAgendaModal,
    handleSalvarAgenda,
    setAgendaModalVisible,
  };
}
