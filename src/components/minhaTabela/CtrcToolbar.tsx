// src/components/minhaTabela/CtrcToolbar.tsx
import { CalendarDays, RefreshCw } from "lucide-react";
import ExportExcelButton from "@/components/ExportExcelButton";

interface Props {
  periodo: { dataInicio: string; dataFim: string };
  setPeriodo: (fn: any) => void;
  loading: boolean;
  fetchGrid: () => void;
  rows: any[];
}

export default function CtrcToolbar({
  periodo,
  setPeriodo,
  loading,
  fetchGrid,
  rows,
}: Props) {
  return (
    <>
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

          <ExportExcelButton
            rows={rows}
            fileName="CTRCs.xlsx"
            label="Exportar Excel"
          />
        </div>
      </div>

      {/* Período */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="date"
          value={periodo.dataInicio}
          onChange={(e) =>
            setPeriodo((p: any) => ({ ...p, dataInicio: e.target.value }))
          }
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={periodo.dataFim}
          onChange={(e) =>
            setPeriodo((p: any) => ({ ...p, dataFim: e.target.value }))
          }
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}
