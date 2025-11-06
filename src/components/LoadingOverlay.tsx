export default function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="flex flex-col items-center">
        {/* 🔄 Spinner animado */}
        <svg
          className="animate-spin h-8 w-8 text-emerald-500 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>

        {/* 💬 Texto traduzido */}
        <p className="text-slate-700 text-sm font-medium">
          Carregando importação...
        </p>
      </div>
    </div>
  );
}
