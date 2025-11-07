import { useEffect, useState } from "react";
import Select from "react-select";

type StatusEntrega = { id: number; nome: string };

interface Props {
  allRows: any[];
  unidades: string[];
  statuses: StatusEntrega[];
  onFiltrar: (filtros: {
    und?: string[];
    status?: string[];
    cliente?: string[];
    destinatario?: string[];
    nf?: string[];
  }) => void;
}

export default function FiltrosCTRC({
  allRows,
  unidades,
  statuses,
  onFiltrar,
}: Props) {
  const [filtroUnd, setFiltroUnd] = useState<string[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string[]>([]);
  const [filtroCliente, setFiltroCliente] = useState<string[]>([]);
  const [filtroDestinatario, setFiltroDestinatario] = useState<string[]>([]);
  const [filtroNF, setFiltroNF] = useState<string[]>([]);

  // 📋 listas únicas com fallback automático
  const clientes = Array.from(
    new Set(
      allRows.map(
        (r) =>
          r.clienteNome || r.cliente || r.nomeCliente || r.razaoSocialCliente || ""
      )
    )
  ).filter(Boolean);

  const destinatarios = Array.from(
    new Set(allRows.map((r) => r.destinatario))
  ).filter(Boolean);

  const nfs = Array.from(
    new Set(allRows.map((r) => r.numeroNotaFiscal))
  ).filter(Boolean);

  // 🔁 dispara callback sempre que filtros mudam
  useEffect(() => {
    onFiltrar({
      und: filtroUnd.length ? filtroUnd : undefined,
      status: filtroStatus,
      cliente: filtroCliente,
      destinatario: filtroDestinatario,
      nf: filtroNF,
    });
  }, [filtroUnd, filtroStatus, filtroCliente, filtroDestinatario, filtroNF]);

  // 🎨 estilos globais dos selects
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderColor: "#cbd5e1",
      minHeight: "38px",
      boxShadow: "none",
      "&:hover": { borderColor: "#94a3b8" },
    }),
    menuPortal: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#e2e8f0",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#0f172a",
      fontWeight: 500,
    }),
  };

  const limparFiltros = () => {
    setFiltroUnd([]);
    setFiltroStatus([]);
    setFiltroCliente([]);
    setFiltroDestinatario([]);
    setFiltroNF([]);
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
      {/* UND */}
      <div className="flex flex-col text-xs min-w-[200px]">
        <label className="text-slate-600 mb-1 font-medium">Unidade</label>
        <Select
          isMulti
          value={filtroUnd.map((v) => ({ value: v, label: v }))}
          onChange={(opts) => setFiltroUnd(opts.map((o) => o.value))}
          options={unidades.map((u) => ({ value: u, label: u }))}
          placeholder="Selecione unidades..."
          closeMenuOnSelect={false}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* STATUS */}
      <div className="flex flex-col text-xs min-w-[220px]">
        <label className="text-slate-600 mb-1 font-medium">Status</label>
        <Select
          isMulti
          value={filtroStatus.map((v) => ({
            value: v,
            label: statuses.find((s) => s.id === Number(v))?.nome || v,
          }))}
          onChange={(opts) => setFiltroStatus(opts.map((o) => o.value))}
          options={statuses.map((s) => ({ value: String(s.id), label: s.nome }))}
          placeholder="Selecione status..."
          closeMenuOnSelect={false}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* CLIENTE */}
      <div className="flex flex-col text-xs min-w-[220px]">
        <label className="text-slate-600 mb-1 font-medium">Cliente</label>
        <Select
          isMulti
          value={filtroCliente.map((v) => ({ value: v, label: v }))}
          onChange={(opts) => setFiltroCliente(opts.map((o) => o.value))}
          options={clientes.map((c) => ({ value: c, label: c }))}
          placeholder="Selecione cliente..."
          closeMenuOnSelect={false}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* DESTINATÁRIO */}
      <div className="flex flex-col text-xs min-w-[220px]">
        <label className="text-slate-600 mb-1 font-medium">Destinatário</label>
        <Select
          isMulti
          value={filtroDestinatario.map((v) => ({ value: v, label: v }))}
          onChange={(opts) => setFiltroDestinatario(opts.map((o) => o.value))}
          options={destinatarios.map((d) => ({ value: d, label: d }))}
          placeholder="Selecione destinatário..."
          closeMenuOnSelect={false}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* NF */}
      <div className="flex flex-col text-xs min-w-[220px]">
        <label className="text-slate-600 mb-1 font-medium">Nota Fiscal</label>
        <Select
          isMulti
          value={filtroNF.map((v) => ({ value: v, label: v }))}
          onChange={(opts) => setFiltroNF(opts.map((o) => o.value))}
          options={nfs.map((n) => ({ value: n, label: n }))}
          placeholder="Selecione NF..."
          closeMenuOnSelect={false}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </div>

      {/* LIMPAR */}
      <button
        onClick={limparFiltros}
        className="ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm border border-slate-300 font-medium"
      >
        Limpar
      </button>
    </div>
  );
}
