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
import FiltrosCTRC from "@/components/FiltrosCTRC";

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

      setRows(filtroUnd ? data.filter((r: any) => r.unidade === filtroUnd) : data);

      setTimeout(() => autoSizeAllColumns(), 300);
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
        const dto = dirty[Number(id)];
        const dataEntrega = dto.DataEntregaRealizada ?? dto.dataEntregaRealizada ?? null;

        let dataISO = null;
        if (dataEntrega) {
          const d = new Date(dataEntrega);
          if (!isNaN(d.getTime())) {
            dataISO = d.toISOString();
          }
        }

        const payload = {
          DataEntregaRealizada: dataISO,
          StatusEntregaId: dto.StatusEntregaId ?? dto.statusEntregaId ?? null,
          Observacao: dto.Observacao ?? dto.observacao ?? null,
          DescricaoOcorrenciaAtendimento:
            dto.DescricaoOcorrenciaAtendimento ??
            dto.descricaoOcorrenciaAtendimento ??
            dto.ultimaDescricaoOcorrenciaAtendimento ??
            null,
        };

        try {
          await axios.put(`${API_URL}/api/ctrcs/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(`✅ CTRC ${id} atualizado com sucesso`, payload);
        } catch (err) {
          console.error(`❌ Erro ao salvar CTRC ${id}`, err);
        }
      }

      setDirty({});
    }, 2000);

    return () => clearTimeout(timeout);
  }, [dirty]);

  // ✏️ edição inline
const onCellEdit = (params: any) => {
  const gridApi = gridRef.current?.api;
  const { id } = params.data;
  const field = params.colDef.field as string;
  let value = params.newValue ?? params.value ?? params.data?.[field] ?? null;

  // 🧭 Ajustes de tipo
  if (field === "statusEntregaId") {
    const asNumber = Number(value);
    if (!isNaN(asNumber)) value = asNumber;
  }

  if (field === "dataEntregaRealizada" && value) {
    let parsed: Date | null = null;
    if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dia, mes, ano] = value.split("/").map(Number);
      parsed = new Date(ano, mes - 1, dia);
    } else parsed = new Date(value);
    if (parsed && !isNaN(parsed.getTime())) value = parsed.toISOString();
    else value = null;
  }

  // 🧠 Atualiza diretamente o node (não recria o array)
  if (gridApi) {
    const node = gridApi.getRowNode(id);
    if (node) {
      node.setDataValue(field, value);
    }
  }

  // 🔐 Atualiza dirty (para autosave)
  const fieldMap: Record<string, string> = {
    dataEntregaRealizada: "DataEntregaRealizada",
    statusEntregaId: "StatusEntregaId",
    observacao: "Observacao",
    descricaoOcorrenciaAtendimento: "DescricaoOcorrenciaAtendimento",
    ultimaDescricaoOcorrenciaAtendimento: "DescricaoOcorrenciaAtendimento",
  };
  const backendField = fieldMap[field] || field;

  setDirty(prev => {
    const updated = {
      ...(prev[id] || {}),
      [backendField]: value,
    };
    return { ...prev, [id]: updated };
  });
};


  const columnDefs = [
    { headerName: "CTRC", field: "ctrc", minWidth: 130 },
    {
      headerName: "Emissão",
      field: "dataEmissao",
      minWidth: 130,
      valueFormatter: (p: any) => formatDate(p.value),
    },
    { headerName: "Destinatário", field: "destinatario", minWidth: 220 },
    { headerName: "Cidade Entrega", field: "cidadeEntrega", minWidth: 180 },
    { headerName: "UF", field: "uf", minWidth: 70 },
    { headerName: "UND", field: "unidade", minWidth: 90 },
    { headerName: "NF", field: "numeroNotaFiscal", minWidth: 130 },
    { headerName: "Ocorrência Sistema", field: "ultimaOcorrenciaSistema", minWidth: 260 },
    {
      headerName: "Ocorrência Atendimento",
      field: "ultimaDescricaoOcorrenciaAtendimento",
      editable: true,
      minWidth: 260,
    },
    {
      headerName: "Lead Time",
      field: "dataPrevistaEntrega",
      minWidth: 130,
      valueFormatter: (p: any) => formatDate(p.value),
    },
    {
      headerName: "Data Entrega",
      field: "dataEntregaRealizada",
      editable: true,
      minWidth: 130,

      // ✅ usa input tipo "date" (sem hora)
      cellEditorSelector: () => ({
        component: "agDateCellEditor",
        params: {
          // limita intervalo aceitável
          min: "2000-01-01",
          max: "2099-12-31",
        },
      }),

      // ✅ formata valor exibido (dd/MM/yyyy)
      cellRenderer: (p: any) => {
        if (!p.value) return "";
        const d = new Date(p.value);
        if (isNaN(d.getTime())) return p.value;
        return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
      },

      // ✅ converte valor digitado para ISO (formato aceito no backend)
      valueParser: (p: any) => {
        if (!p.newValue) return null;
        const v = p.newValue;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
          const [d, m, y] = v.split("/").map(Number);
          return new Date(y, m - 1, d).toISOString();
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
          return new Date(v).toISOString();
        }
        return v;
      },

      cellClass: "whitespace-nowrap",
    },

    {
      headerName: "Status",
      field: "statusEntregaId",
      minWidth: 160,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: () => ({
        values: statuses.map(s => s.id),
      }),
      valueFormatter: (p: any) => statusesById[Number(p.value)] || "",
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
          width: "6%",
          height: "20px",
          margin: "7px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        };
      },
    },
    { headerName: "Observações", field: "observacao", editable: true, minWidth: 260 },
    { headerName: "Dias Atraso", field: "desvioPrazoDias", minWidth: 110 },
    { headerName: "Notas Agrupadas", field: "notasFiscais", minWidth: 180 },
  ];

  const autoSizeAllColumns = () => {
    if (!gridRef.current) return;
    const columnApi = gridRef.current.columnApi;
    if (!columnApi) return;
    const allColumnIds: string[] = [];
    columnApi.getAllColumns().forEach((col: any) => allColumnIds.push(col.getId()));
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

      {/* Filtros originais */}
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
      </div>

      {/* Novo painel moderno de filtros */}
      <FiltrosCTRC
        allRows={allRows}
        unidades={unidades}
        statuses={statuses}
        onFiltrar={filtros => {
          let filtrados = [...allRows];

          if (filtros.und?.length)
            filtrados = filtrados.filter(r => filtros.und!.includes(r.unidade));

          if (filtros.status?.length)
            filtrados = filtrados.filter(r => filtros.status!.includes(String(r.statusEntregaId)));

          if (filtros.cliente?.length)
            filtrados = filtrados.filter(r => {
              const nomeCliente =
                r.clienteNome || r.cliente || r.nomeCliente || r.razaoSocialCliente || "";
              return filtros.cliente!.includes(nomeCliente);
            });

          if (filtros.destinatario?.length)
            filtrados = filtrados.filter(r => filtros.destinatario!.includes(r.destinatario));

          if (filtros.nf?.length)
            filtrados = filtrados.filter(r => filtros.nf!.includes(String(r.numeroNotaFiscal)));

          setRows(filtrados);
        }}
      />

      {/* GRID */}
      <div style={{ height: "70vh", width: "100%" }}>
        <AgGridReact
  {...({
    deltaRowDataMode: true,
    getRowId: (params: any) => params.data.id.toString(),
  } as any)}
  ref={gridRef}
  onGridReady={autoSizeAllColumns}
  theme={myTheme}
  rowData={rows}
  columnDefs={columnDefs}
  onCellValueChanged={onCellEdit}
  animateRows
  pagination
  paginationPageSize={25}
  paginationPageSizeSelector={[25, 50, 100]}
  rowHeight={34}
  headerHeight={32}
  // 👇👇 ADICIONE ISSO
  enableCellTextSelection={true}
  suppressCopyRowsToClipboard={false}
  suppressClipboardPaste={false}
  suppressMovableColumns={false}
  enableRangeSelection={true}
  ensureDomOrder={true}
  // 👆👆 ESSENCIAIS
  defaultColDef={{
    resizable: true,
    sortable: true,
    filter: false,
    floatingFilter: false,
    wrapText: false,
    autoHeight: false,
  }}
/>
      </div>
    </div>
  );
}
