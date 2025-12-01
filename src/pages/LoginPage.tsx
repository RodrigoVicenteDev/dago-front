import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // ✅ descomente aqui

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const { login } = useAuth(); // ✅ agora usando o contexto
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/Auth/login`, { email, senha });

      const { token, usuario } = res.data;
      if (!token || !usuario) throw new Error("Token ou usuário ausente na resposta.");

      // ✅ salva token + usuário no AuthContext e localStorage
      login(token, usuario);

      // redireciona para o painel inicial (pode ser /usuarios ou /painel)
     navigate("/painel");
    } catch (err: any) {
      console.error(err);
      setErro(err?.response?.data?.message ?? "Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* grid decorativa */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.03)_1px)] [background-size:24px_24px]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo / título */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">DG</span>
            </div>
            <div>
              <h1 className="text-white text-2xl font-bold leading-tight">Acesso ao Painel</h1>
              <p className="text-slate-300 text-sm">Entre com suas credenciais</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-200 text-sm mb-1" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-200 text-sm mb-1" htmlFor="senha">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 pr-12 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="••••••••"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(s => !s)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-300 hover:text-white"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <span className="text-sm">Ocultar</span>
                    ) : (
                      <span className="text-sm">Mostrar</span>
                    )}
                  </button>
                </div>
              </div>

              {erro && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-red-200 text-sm">
                  {erro}
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
                Entrar
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <p className="mt-4 text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/redefinir-senha")}
                  className="text-emerald-400 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </p>
              <span className="opacity-60">v1.0.0</span>
            </div>
          </div>

          {/* Rodapé */}
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Dago. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
