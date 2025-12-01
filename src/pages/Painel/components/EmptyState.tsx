// src/pages/Painel/components/EmptyState.tsx
export default function EmptyState({ mensagem }: { mensagem: string }) {
  return (
    <div className="p-6 text-center text-slate-500 border rounded-xl bg-slate-50">
      {mensagem}
    </div>
  );
}
