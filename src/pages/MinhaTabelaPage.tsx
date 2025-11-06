import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  iconSetQuartzLight,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// registra módulos community
ModuleRegistry.registerModules([AllCommunityModule]);

// tema Quartz via Theming API
const myTheme = themeQuartz.withPart(iconSetQuartzLight).withParams({
  browserColorScheme: "light",
  headerFontSize: 14,
  headerFontWeight: "600",
  rowHoverColor: "#E6F0FF",
  oddRowBackgroundColor: "#FAFBFC",
  selectedRowBackgroundColor: "#DCEAFE",
  headerBackgroundColor: "#F8FAFC",
  fontFamily: "IBM Plex Sans, sans-serif",
  cellHorizontalPaddingScale: 1.1,
});

type StatusEntrega = { id: number; nome: string };

export default function MinhaTabelaPage() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [allRows, setAllRows] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<StatusEntrega[]>([]);
  const [statusesById, setStatusesById] = useState<Record<number, string>>({});
  const [dirty, setDirty] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);

  const [periodo, setPeriodo] = useState({ dataInicio: "", dataFim: "" });
  const [unidades, setUnidades] = useState<string[]>([]);
  const [filtroUnd, setFiltroUnd] = useState<string>("");
  const gridRef = useRef<any>(null);
  // 🗓️ período padrão (últimos 30 dias)
  useEffect(() => {
    const hoje = new Date();
    const fim = hoje.toISOString().split("T")[0];
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    const inicioStr = inicio.toISOString().split("T")[0];
    setPeriodo({ dataInicio: inicioStr, dataFim: fim });
  }, []);

  // 🕒 formata data
  const formatDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  // 🎨 cor por status
  const getStatusColor = (nome: string) => {
    const map: Record<string, string> = {
      "ENTREGUE NO PRAZO": "#22c55e",
      ATRASADA: "#f97316",
      "ENTREGUE COM ATRASO": "#ef4444",
      "AG. AGENDA": "#eab308",
      "ENTR. AGENDADA": "#a855f7",
      OCORRENCIA: "#facc15",
      CANCELADA: "#6b7280",
      REAGENDAR: "#dc2626",
      "NO PRAZO": "#22c55e",
      "PENDENTE BAIXA": "#0ea5e9",
      HOJE: "#22c55e",
    };
    return map[nome?.toUpperCase()] || "#94a3b8";
  };

  // 🔁 carrega grid + lookups
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

      // UND únicas
      const unds = Array.from(new Set(data.map((r: any) => r.unidade)))
        .filter(Boolean)
        .sort();
      setUnidades(unds);

      // ------- LOOKUPS DE STATUS ------- //
      const apiStatuses: StatusEntrega[] =
        lookupsRes.data?.statusesEntrega && Array.isArray(lookupsRes.data.statusesEntrega)
          ? lookupsRes.data.statusesEntrega
          : [];

      // fallback pra garantir que o dropdown apareça mesmo se o back não mandar nada
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

      console.log("🔍 Statuses usados:", finalStatuses);
      setStatuses(finalStatuses);
      setStatusesById(
        finalStatuses.reduce<Record<number, string>>((acc, s) => {
          acc[s.id] = s.nome;
          return acc;
        }, {}),
      );
      // ---------------------------------- //

      setRows(filtroUnd ? data.filter((r: any) => r.unidade === filtroUnd) : data);

      // 🧩 auto-size colunas (duplo clique no Excel)
      setTimeout(() => {
        autoSizeAllColumns();
      }, 300);
    } catch (err) {
      console.error("Erro ao carregar grid:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (periodo.dataInicio && periodo.dataFim) fetchGrid();
  }, [periodo]);

  // quando muda UND, filtra em memória
  useEffect(() => {
    if (!filtroUnd) setRows(allRows);
    else setRows(allRows.filter((r: any) => r.unidade === filtroUnd));
  }, [filtroUnd, allRows]);

  // 💾 autosave debounce 2s
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const ids = Object.keys(dirty);
      if (!ids.length) return;
      for (const id of ids) {
        try {
          await axios.put(`${API_URL}/api/ctrcs/${id}`, dirty[Number(id)], {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`✅ CTRC ${id} atualizado`, dirty[Number(id)]);
        } catch (err) {
          console.error(`Erro ao salvar CTRC ${id}`, err);
        }
      }
      setDirty({});
    }, 2000);
    return () => clearTimeout(timeout);
  }, [dirty]);

  // ✏️ edição inline
  const onCellEdit = (params: any) => {
    const { id } = params.data;
    const field = params.colDef.field as string;
    const value = params.newValue;

    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    setAllRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
    setDirty(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }));
  };

  // 🔢 definição das colunas
  const columnDefs = [
    {
      headerName: "CTRC",
      field: "ctrc",
      width: 130,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Emissão",
      field: "dataEmissao",
      width: 130,
      valueFormatter: (p: any) => formatDate(p.value),
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Destinatário",
      field: "destinatario",
      width: 220,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Cidade Entrega",
      field: "cidadeEntrega",
      width: 180,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "UF",
      field: "uf",
      width: 70,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "UND",
      field: "unidade",
      width: 90,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "NF",
      field: "numeroNotaFiscal",
      width: 130,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Ocorrência Sistema",
      field: "ultimaOcorrenciaSistema",
      flex: 1,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Ocorrência Atendimento",
      field: "ultimaDescricaoOcorrenciaAtendimento",
      editable: true,
      flex: 1,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Lead Time",
      field: "dataPrevistaEntrega",
      width: 130,
      valueFormatter: (p: any) => formatDate(p.value),
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Data Entrega",
      field: "dataEntregaRealizada",
      width: 130,
      valueFormatter: (p: any) => formatDate(p.value),
      cellClass: "whitespace-nowrap",
    },
    // ⭐ STATUS COM LOOKUP
    {
      headerName: "Status",
      field: "statusEntregaId",
      width: 160,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: () => ({
        values: statuses.map(s => String(s.id)),
      }),
      valueFormatter: (p: any) => {
        const nome = statusesById[Number(p.value)];
        return nome || "";
      },
      cellStyle: (p: any) => {
        const nome = statusesById[Number(p.value)];
        const color = nome ? getStatusColor(nome) : "#94a3b8";

        return {
          backgroundColor: color,
          color: "white",
          fontWeight: 600,
          textAlign: "center",
          fontSize: "12px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "10%", // 👈 largura fixa, sem ocupar o grid todo
          height: "20px",
          margin: "10px auto", // 👈 centraliza e cria espaçamento entre linhas
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)", // 👈 leve sombra pra destacar
        };
      },
      cellClass: "whitespace-nowrap",
    },

    {
      headerName: "Observações",
      field: "observacao",
      editable: true,
      flex: 1,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Dias Atraso",
      field: "desvioPrazoDias",
      width: 110,
      cellClass: "whitespace-nowrap",
    },
    {
      headerName: "Notas Agrupadas",
      field: "notasFiscais",
      width: 180,
      cellClass: "whitespace-nowrap",
    },
  ];
  const autoSizeAllColumns = () => {
    if (!gridRef.current) return;

    const columnApi = gridRef.current.columnApi;
    if (!columnApi) return;

    const allColumnIds: string[] = [];
    columnApi.getAllColumns().forEach((col: any) => {
      allColumnIds.push(col.getId());
    });

    columnApi.autoSizeColumns(allColumnIds, false);
  };

  return (
    <div className="max-w-[97vw] mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <CalendarDays className="text-emerald-500" /> Minha Tabela de CTRCs
        </h1>
        <button
          onClick={fetchGrid}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="date"
          value={periodo.dataInicio}
          onChange={e => setPeriodo(p => ({ ...p, dataInicio: e.target.value }))}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={periodo.dataFim}
          onChange={e => setPeriodo(p => ({ ...p, dataFim: e.target.value }))}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filtroUnd}
          onChange={e => setFiltroUnd(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[140px]"
        >
          <option value="">Todas as UND</option>
          {unidades.map(u => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      <div style={{ height: "70vh", width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          onGridReady={() => autoSizeAllColumns()}
          theme={myTheme}
          rowData={rows}
          columnDefs={columnDefs}
          onCellValueChanged={onCellEdit}
          animateRows
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 50, 100]}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: true,
            wrapText: false,
            autoHeight: false,
          }}
        />
      </div>
    </div>
  );
}
