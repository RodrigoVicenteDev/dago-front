// src/components/minhaTabela/CtrcGrid.tsx
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  iconSetQuartzLight,
} from "ag-grid-community";
import CtrcStatusCell from "./CtrcStatusCell";
import CtrcAgendaCell from "./CtrcAgendaCell";

// Mantém mesmo tema do original
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

interface Props {
  rows: any[];
  setRows: any;
  allRows: any[];
  statuses: any[];
  statusesById: Record<number, string>;
  gridRef: any;
  isEsporadico: boolean;
  onCellEdit: any;
  autoSizeAllColumns: any;
  handleAbrirAgendaModal: (id: number, data: string | null) => void;
}

export default function CtrcGrid({
  rows,
  statuses,
  statusesById,
  gridRef,
  isEsporadico,
  onCellEdit,
  autoSizeAllColumns,
  handleAbrirAgendaModal,
}: Props) {
  // Função do original
  const formatDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  // 🔥 ColumnDefs idênticos ao original
  const columnDefs: any[] = [
    { headerName: "CTRC", field: "ctrc", minWidth: 130 },

    {
      headerName: "Emissão",
      field: "dataEmissao",
      minWidth: 130,
      valueFormatter: (p: any) => formatDate(p.value),
    },

    // Cliente só aparece para esporádico
    ...(isEsporadico
      ? [{ headerName: "Cliente", field: "cliente", minWidth: 220 }]
      : []),

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

    // AGENDA
    {
      headerName: "Agenda",
      field: "dataAgenda",
      minWidth: 150,
      cellRenderer: (p: any) => (
        <CtrcAgendaCell
          data={p.data.dataAgenda}
          onOpen={() => handleAbrirAgendaModal(p.data.id, p.data.dataAgenda)}
        />
      ),
    },

    // DATA ENTREGA
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
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v).toISOString();

        return v;
      },
      cellClass: "whitespace-nowrap",
    },

    // STATUS
    {
      headerName: "Status",
      field: "statusEntregaId",
      minWidth: 160,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: () => ({
        values: statuses.map((s: any) => s.id),
      }),
      valueFormatter: (p: any) => statusesById[Number(p.value)] || "",
      cellRenderer: (p: any) => (
        <CtrcStatusCell value={p.value} statusesById={statusesById} />
      ),
    },

    { headerName: "Observações", field: "observacao", editable: true, minWidth: 260 },
    { headerName: "Dias Atraso", field: "desvioPrazoDias", minWidth: 110 },
    { headerName: "Notas Agrupadas", field: "notasFiscais", minWidth: 180 },
  ];

  return (
    <div style={{ height: "70vh", width: "100%" }}>
      <AgGridReact
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
  );
}
