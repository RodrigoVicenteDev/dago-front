import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface Cargo {
  id: number;
  nome: string;
}

export default function EditUserPage() {
  const { usuario, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState(usuario?.email || "");
  const [cargoId, setCargoId] = useState<number | "">(usuario?.cargoId || "");
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState(""); // CONFIRMAÇÃO

  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isGerente = usuario?.cargo?.toLowerCase() === "gerente";

  // 🔥 LOOKUP de cargos
  useEffect(() => {
    if (!isGerente) return;

    axios
      .get(`${API_URL}/api/Cargo/listar`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCargos(res.data))
      .catch(() => console.error("Erro ao carregar cargos"));
  }, []);

  // 🟢 Avatar com iniciais
  const getAvatarLetters = () => {
    if (!usuario?.nome) return "US";
    const parts = usuario.nome.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (!usuario) {
    return <div className="p-6 text-center text-slate-500">Carregando...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    // 🔐 Validar confirmação de senha
    if (novaSenha.trim() !== "" && novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = { email };

      if (novaSenha.trim() !== "") payload.novaSenha = novaSenha;

      // enviar cargo apenas se gerente
      if (isGerente && cargoId !== "") {
        payload.cargoId = Number(cargoId);
      }

      await axios.put(`${API_URL}/api/Usuario/atualizar/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensagem("Informações atualizadas com sucesso!");
      setTimeout(() => navigate("/meu-usuario"), 1500);
    } catch {
      setErro("Erro ao atualizar informações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-md rounded-2xl border border-slate-200 p-8">

      {/* Avatar */}
      <div className="w-full flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold shadow-md">
          {getAvatarLetters()}
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
        Editar meu perfil
      </h1>

      <form onSubmit={handleSave} className="space-y-4">

        {/* E-mail */}
        <div>
          <label className="block text-slate-700 text-sm mb-1">E-mail</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Nova senha */}
        <div>
          <label className="block text-slate-700 text-sm mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            placeholder="Deixe em branco para não alterar"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>

        {/* Confirmar senha */}
        <div>
          <label className="block text-slate-700 text-sm mb-1">
            Confirmar nova senha
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            placeholder="Repita a nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>

        {/* Cargo via lookup */}
        <div>
          <label className="block text-slate-700 text-sm mb-1">Cargo</label>

          {isGerente ? (
            <select
              value={cargoId}
              onChange={(e) => setCargoId(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
            >
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={usuario.cargo}
              className="w-full rounded-lg border border-slate-200 bg-slate-100 text-slate-400 px-4 py-2 cursor-not-allowed"
              disabled
            />
          )}

          {!isGerente && (
            <p className="text-xs text-slate-400 mt-1">
              Apenas usuários com cargo <b>Gerente</b> podem alterar o cargo.
            </p>
          )}
        </div>

        {/* Mensagens */}
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

        {/* Botão */}
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
