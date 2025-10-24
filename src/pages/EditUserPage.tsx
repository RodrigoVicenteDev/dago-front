import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditUserPage() {
  const { usuario, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState(usuario?.email || "");
  const [cargo, setCargo] = useState(usuario?.cargo || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!usuario) {
    return <div className="p-6 text-center text-slate-500">Carregando...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);
    setLoading(true);

    try {
      const payload: any = {
        email,
      };

      // só envia nova senha se o campo estiver preenchido
      if (novaSenha.trim() !== "") {
        payload.novaSenha = novaSenha;
      }

      // só envia cargo se o usuário for gerente
      if (usuario.cargo.toLowerCase() === "gerente" && cargo.trim() !== "") {
        payload.cargoId = cargo; // <- pode precisar adaptar se cargoId != cargo nome
      }

      await axios.put(`${API_URL}/api/Usuario/atualizar/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMensagem("Informações atualizadas com sucesso!");
      setTimeout(() => navigate("/meu-usuario"), 1500);
    } catch (err: unknown) {
      console.error(err);
      setErro("Erro ao atualizar informações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-md rounded-2xl border border-slate-200 p-8">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Editar meu perfil
      </h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-slate-700 text-sm mb-1">E-mail</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-slate-700 text-sm mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            placeholder="Deixe em branco para não alterar"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-slate-700 text-sm mb-1">Cargo</label>
          <input
            type="text"
            className={`w-full rounded-lg border px-4 py-2 outline-none ${
              usuario.cargo.toLowerCase() === "gerente"
                ? "border-slate-300 focus:ring-2 focus:ring-emerald-400"
                : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            value={cargo}
            onChange={e => setCargo(e.target.value)}
            disabled={usuario.cargo.toLowerCase() !== "gerente"}
          />
          {usuario.cargo.toLowerCase() !== "gerente" && (
            <p className="text-xs text-slate-400 mt-1">
              Apenas usuários com cargo <b>Gerente</b> podem alterar o cargo.
            </p>
          )}
        </div>

        {erro && (
          <div className="rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-red-600 text-sm">
            {erro}
          </div>
        )}
        {mensagem && (
          <div className="rounded-lg border border-emerald-400 bg-emerald-50 px-3 py-2 text-emerald-600 text-sm">
            {mensagem}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-lg font-medium transition"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
