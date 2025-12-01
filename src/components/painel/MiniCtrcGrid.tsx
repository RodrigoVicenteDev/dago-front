import {
  CtrcGrid,
  useCtrcEditing,
} from "@/components/minhaTabela";

import { useCtrcDataPanel } from "./useCtrcDataPanel";
import { useEffect } from "react";
import PanelCtrcFilters from "./PanelCtrcFilters";

export default function MiniCtrcGrid({ rows }: { rows: any[] }) {
  const ctrc = useCtrcDataPanel(rows);
  const editing = useCtrcEditing(ctrc);

  // Atualiza a linha local depois de salvar
  useEffect(() => {
    if (!editing.lastUpdatedRow) return;

    ctrc.setRows((prev: any[]) =>
      prev.map((r) =>
        r.id === editing.lastUpdatedRow.id ? editing.lastUpdatedRow : r
      )
    );
  }, [editing.lastUpdatedRow]);

  return (
    <div className="space-y-4">

      {/* 🔹 Filtros do painel */}
      <PanelCtrcFilters
        allRows={ctrc.allRows}
        unidades={ctrc.unidades}
        statuses={ctrc.statuses}
        setRows={ctrc.setRows}
      />

      {/* 🔹 Grid completa */}
      <CtrcGrid
        rows={ctrc.rows}
        setRows={ctrc.setRows}
        allRows={ctrc.allRows}
        statuses={ctrc.statuses}
        statusesById={ctrc.statusesById}
        isEsporadico={ctrc.isEsporadico}
        onCellEdit={editing.onCellEdit}  // edição salva no backend
        gridRef={ctrc.gridRef}
        autoSizeAllColumns={ctrc.autoSizeAllColumns}
        handleAbrirAgendaModal={() => {}}
      />
    </div>
  );
}
