import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (novaSenha !== confirmar) {
      setErro("As senhas novas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(API_URL, {
        senhaAtual,
        novaSenha,
      });
      setMensagem("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmar("");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setErro(err?.response?.data?.message || "Erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-center text-white text-2xl font-semibold mb-1">Redefinir senha</h2>
        <p className="text-center text-slate-400 text-sm mb-6">
          Insira sua senha atual e a nova senha desejada
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-200 text-sm mb-1">Senha atual</label>
            <input
              type="password"
              value={senhaAtual}
              onChange={e => setSenhaAtual(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-slate-200 text-sm mb-1">Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="Nova senha"
            />
          </div>

          <div>
            <label className="block text-slate-200 text-sm mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="Repita a nova senha"
            />
          </div>

          {erro && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-200 text-sm">
              {erro}
            </div>
          )}
          {mensagem && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 text-sm">
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading && (
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            Alterar senha
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          <a
            onClick={() => navigate("/login")}
            className="cursor-pointer text-emerald-400 hover:underline"
          >
            Voltar ao login
          </a>
        </p>
      </div>
    </div>
  );
}
