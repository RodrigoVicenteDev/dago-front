// src/pages/Painel/components/CardContainer.tsx
export default function CardContainer({ children }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {children}
    </div>
  );
}
