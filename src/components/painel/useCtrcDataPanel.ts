// src/components/painel/useCtrcDataPanel.ts
import { useEffect, useState, useRef } from "react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useAuth } from "@/context/AuthContext";

ModuleRegistry.registerModules([AllCommunityModule]);

export function useCtrcDataPanel(initialRows: any[]) {
  const { usuario } = useAuth();

  const [allRows, setAllRows] = useState<any[]>(initialRows);
  const [rows, setRows] = useState<any[]>(initialRows);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [statusesById, setStatusesById] = useState<Record<number, string>>({});
  const [loading] = useState(false);

  const gridRef = useRef<any>(null);

  // Regra esporádico (igual à MinhaTabelaPage)
  const ESPORADICO_ID = 3573;
  const isEsporadico = usuario?.clientes?.some(
    (c) => Number(c.id) === ESPORADICO_ID
  );

  // UND únicas
  const unidades = Array.from(new Set(initialRows.map((r) => r.unidade)))
    .filter(Boolean)
    .sort();

  // Auto-size colunas
  const autoSizeAllColumns = () => {
    if (!gridRef.current) return;
    const colApi = gridRef.current.columnApi;
    if (!colApi) return;

    const allIds: string[] = [];
    colApi.getAllColumns().forEach((col: any) => allIds.push(col.getId()));
    colApi.autoSizeColumns(allIds);
  };

  // Atualiza grid quando os dados mudarem
  useEffect(() => {
    setAllRows(initialRows);
    setRows(initialRows);

    setTimeout(() => autoSizeAllColumns(), 300);
  }, [initialRows]);

  // Status — usa fallback porque o painel não tem lookups
  useEffect(() => {
    const fallbackStatuses = [
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

    setStatuses(fallbackStatuses);
    setStatusesById(
      fallbackStatuses.reduce((acc, s) => {
        acc[s.id] = s.nome;
        return acc;
      }, {} as Record<number, string>)
    );
  }, []);

  return {
    allRows,
    rows,
    setRows,
    statuses,
    statusesById,
    unidades,
    loading,
    isEsporadico,
    gridRef,
    autoSizeAllColumns,
  };
}
