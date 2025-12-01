// src/components/minhaTabela/CtrcFiltersWrapper.tsx
import FiltrosCTRC from "@/components/FiltrosCTRC";

/*
  🔥 NOVO COMPORTAMENTO:
  - Não aplica filtro nenhum manualmente
  - Apenas repassa os filtros para useCtrcFilters
  - Toda lógica de filtragem está no hook
*/

interface Props {
  allRows: any[];
  unidades: string[];
  statuses: any[];
  filtrosAtuais: any;
  setFiltrosAtuais: (v: any) => void; // vem do novo useCtrcFilters
  setRows: (v: any) => void; // não é mais usado diretamente
}

export default function CtrcFiltersWrapper({
  allRows,
  unidades,
  statuses,
  filtrosAtuais,
  setFiltrosAtuais,
}: Props) {
  return (
    <FiltrosCTRC
      allRows={allRows}
      unidades={unidades}
      statuses={statuses}
      filtrosIniciais={filtrosAtuais}
      onFiltrar={(novosFiltros: any) => {
        // 🔥 Aqui fica simples:
        // repassa para o hook → ele faz tudo e salva no sessionStorage
        setFiltrosAtuais(novosFiltros);
      }}
    />
  );
}
