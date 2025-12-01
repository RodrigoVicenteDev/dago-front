// src/components/minhaTabela/useCtrcFilters.ts
import { useEffect, useState } from "react";

/*
  🔥 NOVA LÓGICA:
  - dashboard → só aplica filtro CTRC
  - filtros normais → salvos em filtrosNormais
  - filtros só aplicam quando allRows estão disponíveis
  - cliente normalizado
*/

export function useCtrcFilters(ctrc: any) {
  const [filtrosAtuais, setFiltrosAtuais] = useState<any>({});

  // Aux: normaliza o nome do cliente
  function normalizeCliente(r: any) {
    return (
      r.clienteNome ||
      r.cliente ||
      r.nomeCliente ||
      r.razaoSocialCliente ||
      ""
    );
  }

  // Aux: aplica os filtros aos dados
  function aplicarFiltros(filtros: any) {
    let filtrados = [...ctrc.allRows];

    if (filtros.ctrc?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.ctrc.includes(r.ctrc)
      );

    if (filtros.und?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.und.includes(r.unidade)
      );

    if (filtros.status?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.status.includes(String(r.statusEntregaId))
      );

    if (filtros.cliente?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.cliente.includes(normalizeCliente(r))
      );

    if (filtros.destinatario?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.destinatario.includes(r.destinatario)
      );

    if (filtros.nf?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.nf.includes(String(r.numeroNotaFiscal))
      );

    if (filtros.uf?.length)
      filtrados = filtrados.filter((r: any) =>
        filtros.uf.includes(r.uf)
      );

    ctrc.setRows(filtrados);
  }

  // MAIN EFFECT — aplica filtros quando grid carregar
  useEffect(() => {
    // grid ainda não carregou → não aplicar nada
    if (ctrc.allRows.length === 0) return;

    const url = new URLSearchParams(window.location.search);
    const fromDashboard = url.get("fromDashboard") === "1";

    // DASHBOARD → aplica somente filtro CTRC
    if (fromDashboard) {
      const raw = sessionStorage.getItem("filtroDashboardCtrcs");
      if (raw) {
        const lista = JSON.parse(raw);

        const filtros = { ctrc: lista };
        setFiltrosAtuais(filtros);

        aplicarFiltros(filtros);
      }
      return;
    }

    // FILTROS NORMAIS
    const raw = sessionStorage.getItem("filtrosNormais");

    if (raw) {
      const filtros = JSON.parse(raw);
      setFiltrosAtuais(filtros);
      aplicarFiltros(filtros);
    } else {
      // sem filtros → mostra tudo
      setFiltrosAtuais({});
      ctrc.setRows(ctrc.allRows);
    }
  }, [ctrc.allRows]);

  // Atualiza filtros normais (chamado pelo wrapper)
  function atualizarFiltrosNormais(novosFiltros: any) {
    const final = { ...filtrosAtuais, ...novosFiltros };

    setFiltrosAtuais(final);
    sessionStorage.setItem("filtrosNormais", JSON.stringify(final));

    aplicarFiltros(final);
  }

  return {
    filtrosAtuais,
    setFiltrosAtuais: atualizarFiltrosNormais,
  };
}
