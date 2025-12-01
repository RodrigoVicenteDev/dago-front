// src/pages/MinhaTabelaPage.tsx
import AgendaModal from "@/components/AgendaModal";
import {
  useCtrcData,
  useCtrcEditing,
  useCtrcFilters,
  CtrcToolbar,
  CtrcGrid,
  CtrcFiltersWrapper,
} from "@/components/minhaTabela";

export default function MinhaTabelaPage() {
  const ctrc = useCtrcData();
  const editing = useCtrcEditing(ctrc);
  const filters = useCtrcFilters(ctrc);

  return (
    <div className="max-w-[97vw] mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-6">
      {/* Topo da página */}
      <CtrcToolbar
        periodo={ctrc.periodo}
        setPeriodo={ctrc.setPeriodo}
        loading={ctrc.loading}
        fetchGrid={ctrc.fetchGrid}
        rows={ctrc.rows}
      />

      {/* Filtros */}
      <CtrcFiltersWrapper
        allRows={ctrc.allRows}
        unidades={ctrc.unidades}
        statuses={ctrc.statuses}
        filtrosAtuais={filters.filtrosAtuais}
        setFiltrosAtuais={filters.setFiltrosAtuais}
        setRows={ctrc.setRows}
      />

      {/* Tabela */}
      <CtrcGrid
        rows={ctrc.rows}
        setRows={ctrc.setRows}
        allRows={ctrc.allRows}
        statuses={ctrc.statuses}
        statusesById={ctrc.statusesById}
        gridRef={ctrc.gridRef}
        isEsporadico={ctrc.isEsporadico}
        onCellEdit={editing.onCellEdit}
        autoSizeAllColumns={ctrc.autoSizeAllColumns}
        handleAbrirAgendaModal={ctrc.handleAbrirAgendaModal}
      />

      {/* Modal Agenda */}
      {ctrc.agendaModalVisible && (
        <AgendaModal
          visible={ctrc.agendaModalVisible}
          onClose={() => ctrc.setAgendaModalVisible(false)}
          ctrcId={ctrc.agendaCTRCId}
          dataAtual={ctrc.agendaDataAtual}
          onSave={ctrc.handleSalvarAgenda}
        />
      )}
    </div>
  );
}
