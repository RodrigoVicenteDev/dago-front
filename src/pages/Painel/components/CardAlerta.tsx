// src/pages/Painel/components/CardAlerta.tsx
import { ArrowRight } from "lucide-react";

export default function CardAlerta({
  titulo,
  quantidade,
  cor = "text-slate-700",
  onClick,
}: {
  titulo: string;
  quantidade: number;
  cor?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left bg-white border border-slate-200 rounded-xl 
        p-5 shadow-sm hover:shadow-md transition 
        flex flex-col gap-1 group
      "
    >
      <span className="text-slate-500 text-xs tracking-wide uppercase">
        {titulo}
      </span>

      <span className={`text-3xl font-semibold ${cor}`}>
        {quantidade}
      </span>

      <div className="flex items-center gap-1 text-slate-400 text-sm mt-2 group-hover:text-emerald-600">
        Ver detalhes <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
      </div>
    </button>
  );
}
