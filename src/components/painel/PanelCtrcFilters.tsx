import { useState } from "react";
import FiltrosCTRC from "@/components/FiltrosCTRC";

interface Props {
  allRows: any[];
  unidades: string[];
  statuses: any[];
  setRows: (rows: any[]) => void;
}

export default function PanelCtrcFilters({
  allRows,
  unidades,
  statuses,
  setRows,
}: Props) {
  const [filtros, setFiltros] = useState<any>({});

  function normalizeCliente(r: any) {
    return (
      r.clienteNome ||
      r.cliente ||
      r.nomeCliente ||
      r.razaoSocialCliente ||
      ""
    );
  }

  function aplicarFiltros(f: any) {
    let filtrados = [...allRows];

    if (f.ctrc?.length) {
      filtrados = filtrados.filter((r) => f.ctrc.includes(r.ctrc));
    }

    if (f.und?.length) {
      filtrados = filtrados.filter((r) => f.und.includes(r.unidade));
    }

    if (f.status?.length) {
      filtrados = filtrados.filter((r) =>
        f.status.includes(String(r.statusEntregaId))
      );
    }

    if (f.cliente?.length) {
      filtrados = filtrados.filter((r) =>
        f.cliente.includes(normalizeCliente(r))
      );
    }

    if (f.destinatario?.length) {
      filtrados = filtrados.filter((r) =>
        f.destinatario.includes(r.destinatario)
      );
    }

    if (f.nf?.length) {
      filtrados = filtrados.filter((r) =>
        f.nf.includes(String(r.numeroNotaFiscal))
      );
    }

    if (f.uf?.length) {
      filtrados = filtrados.filter((r) => f.uf.includes(r.uf));
    }

    setRows(filtrados);
  }

  return (
    <FiltrosCTRC
      allRows={allRows}
      unidades={unidades}
      statuses={statuses}
      filtrosIniciais={filtros}
      onFiltrar={(novosFiltros: any) => {
        const f = { ...filtros, ...novosFiltros };
        setFiltros(f);
        aplicarFiltros(f);
      }}
    />
  );
}
