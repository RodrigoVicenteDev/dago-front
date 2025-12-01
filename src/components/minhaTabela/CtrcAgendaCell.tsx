// src/components/minhaTabela/CtrcAgendaCell.tsx
import { CalendarDays } from "lucide-react";

export default function CtrcAgendaCell({ data, onOpen }: any) {
  const formatAgenda = (val: any) => {
    if (!val) return "-";

    // Formato YYYY-MM-DD puro
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split("-");
      return `${d}/${m}/${y}`;
    }

    try {
      return new Date(val).toLocaleDateString("pt-BR");
    } catch {
      return String(val);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span>{formatAgenda(data)}</span>

      <button
        onClick={onOpen}
        className="text-emerald-500 hover:text-emerald-700"
        title="Agendar / Reagendar"
      >
        <CalendarDays size={16} />
      </button>
    </div>
  );
}
