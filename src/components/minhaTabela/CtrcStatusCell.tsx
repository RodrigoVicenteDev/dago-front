// src/components/minhaTabela/CtrcStatusCell.tsx

interface Props {
  value: number;
  statusesById: Record<number, string>;
}

export default function CtrcStatusCell({ value, statusesById }: Props) {
  const nome = statusesById[Number(value)];

  const getStatusColor = (nome: string) => {
    const map: Record<string, string> = {
      "ENTREGUE NO PRAZO": "#22c55e",
      ATRASADA: "#f97316",
      "ENTREGUE COM ATRASO": "#ef4444",
      "AG. AGENDA": "#eab308",
      "ENTR. AGENDADA": "#a855f7",
      OCORRENCIA: "#facc15",
      CANCELADA: "#6b7280",
      REAGENDAR: "#dc2626",
      "NO PRAZO": "#22c55e",
      "PENDENTE BAIXA": "#0ea5e9",
      HOJE: "#22c55e",
    };
    return map[nome?.toUpperCase()] || "#94a3b8";
  };

  const color = nome ? getStatusColor(nome) : "#94a3b8";

  return (
    <div
      style={{
        backgroundColor: color,
        color: "white",
        fontWeight: 600,
        textAlign: "center",
        fontSize: "12px",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "20px",
        margin: "7px 0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}
    >
      {nome}
    </div>
  );
}
