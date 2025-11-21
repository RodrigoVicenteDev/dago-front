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
import AgendaModal from "@/components/AgendaModal";
import ExportExcelButton from "@/components/ExportExcelButton";

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
  const { token, usuario } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [allRows, setAllRows] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<StatusEntrega[]>([]);
  const [statusesById, setStatusesById] = useState<Record<number, string>>({});
  const [dirty, setDirty] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [gridInicializado, setGridInicializado] = useState(false);

  const [periodo, setPeriodo] = useState({ dataInicio: "", dataFim: "" });
  const [unidades, setUnidades] = useState<string[]>([]);
  const [filtroUnd, setFiltroUnd] = useState<string>("");

  // 🔸 NOVO: filtros persistentes
  const [filtrosAtuais, setFiltrosAtuais] = useState<any>({});

  const [agendaModalVisible, setAgendaModalVisible] = useState(false);
  const [agendaCTRCId, setAgendaCTRCId] = useState<number | null>(null);
  const [agendaDataAtual, setAgendaDataAtual] = useState<string | null>(null);

  const ESPORADICO_ID = 3573;

  const isEsporadico = usuario?.clientes?.some(c => Number(c.id) === ESPORADICO_ID);

  const handleAbrirAgendaModal = (id: number, data: string | null) => {
    setAgendaCTRCId(id);
    setAgendaDataAtual(data);
    setAgendaModalVisible(true);
  };

  const handleSalvarAgenda = ({ ctrcId, tipoAgendaId, dataAgenda }: any) => {
    setRows(prev => prev.map(r => (r.id === ctrcId ? { ...r, dataAgenda, tipoAgendaId } : r)));
    setAllRows(prev => prev.map(r => (r.id === ctrcId ? { ...r, dataAgenda, tipoAgendaId } : r)));
  };

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
    return d.toLocaleDateString("pt-BR");
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

      const unds = Array.from(new Set(data.map((r: any) => r.unidade)))
        .filter(Boolean)
        .sort();
      setUnidades(unds);

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

      setRows(data);

      setTimeout(() => autoSizeAllColumns(), 300);
    } catch (err) {
      console.error("Erro ao carregar grid:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGrid();
  }, []);

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
          tipoOcorrenciaId:
            (dto.DescricaoOcorrenciaAtendimento ??
            dto.descricaoOcorrenciaAtendimento ??
            dto.ultimaDescricaoOcorrenciaAtendimento)
              ? 1
              : null,
        };
        console.log(payload);
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

  const onCellEdit = (params: any) => {
    const gridApi = gridRef.current?.api;
    const { id } = params.data;
    const field = params.colDef.field as string;
    let value = params.newValue ?? params.value ?? params.data?.[field] ?? null;

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

    if (gridApi) {
      const node = gridApi.getRowNode(id);
      if (node) {
        node.setDataValue(field, value);
      }
    }

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
    ...(isEsporadico ? [{ headerName: "Cliente", field: "cliente", minWidth: 220 }] : []),
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
      headerName: "Agenda",
      field: "dataAgenda",
      minWidth: 150,
      cellRenderer: (p: any) => {
        const { dataAgenda, id } = p.data;

        // Formata data pura "YYYY-MM-DD" sem criar Date (evita cair 1 dia)
        const formatAgenda = (val: any) => {
          if (!val) return "-";
          if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [y, m, d] = val.split("-");
            return `${d}/${m}/${y}`;
          }
          // fallback para casos com hora/ISO
          try {
            return new Date(val).toLocaleDateString("pt-BR");
          } catch {
            return String(val);
          }
        };

        return (
          <div className="flex items-center justify-between gap-2">
            <span>{formatAgenda(dataAgenda)}</span>
            <button
              onClick={() => handleAbrirAgendaModal(id, dataAgenda)}
              className="text-emerald-500 hover:text-emerald-700"
              title="Agendar / Reagendar"
            >
              <CalendarDays size={16} />
            </button>
          </div>
        );
      },
    },

    {
      headerName: "Data Entrega",
      field: "dataEntregaRealizada",
      editable: true,
      minWidth: 130,
      cellEditorSelector: () => ({
        component: "agDateCellEditor",
        params: {
          min: "2000-01-01",
          max: "2099-12-31",
        },
      }),
      cellRenderer: (p: any) => {
        if (!p.value) return "";
        const d = new Date(p.value);
        if (isNaN(d.getTime())) return p.value;
        return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
      },
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
          width: "4%",
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

  // 🔸 reaplica filtros salvos ao carregar
  useEffect(() => {
    const saved = localStorage.getItem("filtrosCTRC");
    if (saved && allRows.length > 0) {
      const filtros = JSON.parse(saved);
      setFiltrosAtuais(filtros);

      let filtrados = [...allRows];
      if (filtros.und?.length) filtrados = filtrados.filter(r => filtros.und.includes(r.unidade));
      if (filtros.status?.length)
        filtrados = filtrados.filter(r => filtros.status.includes(String(r.statusEntregaId)));
      if (filtros.cliente?.length)
        filtrados = filtrados.filter(r => {
          const nomeCliente =
            r.clienteNome || r.cliente || r.nomeCliente || r.razaoSocialCliente || "";
          return filtros.cliente.includes(nomeCliente);
        });
      if (filtros.destinatario?.length)
        filtrados = filtrados.filter(r => filtros.destinatario.includes(r.destinatario));
      if (filtros.nf?.length)
        filtrados = filtrados.filter(r => filtros.nf.includes(String(r.numeroNotaFiscal)));

      setRows(filtrados);
    }
  }, [allRows]);

  return (
    <div className="max-w-[97vw] mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-6">
      <div className="flex items-center justify-start mb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <CalendarDays className="text-emerald-500" /> Minha Tabela de CTRCs
        </h1>
        <div className="flex gap-2 ml-auto">
        <button
          onClick={fetchGrid}
          disabled={loading}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Carregando..." : "Atualizar"}
        </button>
        <ExportExcelButton rows={rows} fileName="CTRCs.xlsx" label="Exportar Excel" />
        </div>
        
      </div>

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

      {/* Novo painel de filtros com persistência */}
      <FiltrosCTRC
        allRows={allRows}
        unidades={unidades}
        statuses={statuses}
        onFiltrar={filtros => {
          let filtrados = [...allRows];

          if (filtros.und?.length)
            filtrados = filtrados.filter(r => filtros.und.includes(r.unidade));

          if (filtros.status?.length)
            filtrados = filtrados.filter(r => filtros.status.includes(String(r.statusEntregaId)));

          if (filtros.cliente?.length)
            filtrados = filtrados.filter(r => {
              const nomeCliente =
                r.clienteNome || r.cliente || r.nomeCliente || r.razaoSocialCliente || "";
              return filtros.cliente.includes(nomeCliente);
            });

          if (filtros.destinatario?.length)
            filtrados = filtrados.filter(r => filtros.destinatario.includes(r.destinatario));

          if (filtros.nf?.length)
            filtrados = filtrados.filter(r => filtros.nf.includes(String(r.numeroNotaFiscal)));

          if (filtros.uf?.length) filtrados = filtrados.filter(r => filtros.uf!.includes(r.uf));

          setRows(filtrados);
          setFiltrosAtuais(filtros);
          localStorage.setItem("filtrosCTRC", JSON.stringify(filtros)); // 🔸 salva filtros
        }}
      />

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
          enableCellTextSelection={true}
          suppressCopyRowsToClipboard={false}
          suppressClipboardPaste={false}
          suppressMovableColumns={false}
          enableRangeSelection={true}
          ensureDomOrder={true}
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
      <AgendaModal
        visible={agendaModalVisible}
        onClose={() => setAgendaModalVisible(false)}
        ctrcId={agendaCTRCId}
        onSave={handleSalvarAgenda}
      />
    </div>
  );
}
