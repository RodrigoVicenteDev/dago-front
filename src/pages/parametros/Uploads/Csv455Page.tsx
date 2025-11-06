import { useEffect, useState } from "react";
import axios from "axios";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function Csv455Page() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [praca, setPraca] = useState("");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [mostrarToast, setMostrarToast] = useState(false);
  const [errosImportacao, setErrosImportacao] = useState<any[]>([]);

  useEffect(() => {
    if (mensagem) {
      setMostrarToast(true);
      const timer = setTimeout(() => {
        setMostrarToast(false);
        setMensagem(null);
      }, 3000); // ⏱️ Toast some após 3 segundos
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo) {
      setErro("Selecione um arquivo CSV para continuar.");
      return;
    }

    setErro(null);
    setLoading(true);
    setMensagem(null);

    try {
      const formData = new FormData();
      formData.append("Arquivo", arquivo);
      if (praca) formData.append("Praca", praca);

      const res = await axios.post(`${API_URL}/api/importacoes/ctrc/preview`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPreview(res.data.preview);
      setPreviewToken(res.data.token);
      setMensagem("Pré-visualização carregada com sucesso!");
    } catch (err: any) {
      console.error(err);
      setErro(err.response?.data?.message ?? "Erro ao processar o arquivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmar() {
    if (!previewToken) return;
    setLoading(true);
    setMensagem(null);
    try {
      const res = await axios.post(
        `${API_URL}/api/importacoes/ctrc/confirmar/${previewToken}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 🧹 limpa imediatamente
      setPreview([]);
      setPreviewToken(null);
      setArquivo(null);
      setPraca("");
      setErro(null);
      // 📝 salva os erros (se existirem)
      setErrosImportacao(res.data.erros || []);
      // ⏱️ mostra o toast com leve atraso
      setTimeout(() => {
        setMensagem(
          `✅ ${res.data.inseridos} registros inseridos, ${res.data.totalErros} com erro.`,
        );
      }, 500); // meio segundo depois
    } catch (err: any) {
      console.error(err);
      setErro(err.response?.data?.message ?? "Erro ao confirmar importação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow-md border border-slate-200 p-8">
      {mostrarToast && (
        <div className="fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-md shadow-lg animate-fadeIn z-50">
          {mensagem}
        </div>
      )}
      {/* ✅ Loading overlay */}
      <LoadingOverlay visible={loading} />

      <h1 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <FileSpreadsheet className="text-emerald-500" /> Importar CTRCs via CSV
      </h1>

      {/* Upload */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={e => setArquivo(e.target.files?.[0] ?? null)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Praça (ex: GRU)"
            value={praca}
            onChange={e => setPraca(e.target.value.toUpperCase())}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-40"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-4 py-2 transition"
          >
            <Upload size={18} /> {loading ? "Enviando..." : "Enviar CSV"}
          </button>
        </div>
      </form>

      {/* Mensagens */}
      {erro && (
        <p className="mt-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="mt-4 text-sm text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-md p-2">
          {mensagem}
        </p>
      )}

      {/* Pré-visualização */}
      {preview.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Pré-visualização</h2>
          <table className="min-w-full text-sm border border-slate-200 table-auto">
            <thead className="bg-slate-100">
              <tr>
                {Object.keys(preview[0]).map(col => (
                  <th key={col} className="p-2 border-b text-left text-slate-600 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {Object.values(row).map((val, j) => (
                    <td
                      key={j}
                      className="p-2 border-b border-slate-100 text-slate-700 whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis"
                      title={String(val)} // 👈 tooltip com valor completo
                    >
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleConfirmar}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 transition"
            >
              <CheckCircle size={18} /> Confirmar Importação
            </button>
            {errosImportacao.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-red-600 mb-3">
                  Erros encontrados ({errosImportacao.length})
                </h2>

                <table className="w-full text-sm border border-slate-200 table-auto">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="p-2 border-b text-left">Linha</th>
                      <th className="p-2 border-b text-left">CTRC</th>
                      <th className="p-2 border-b text-left">Erro</th>
                      <th className="p-2 border-b text-left">Severidade</th>
                      <th className="p-2 border-b text-left">Cliente Remetente</th>
                      <th className="p-2 border-b text-left">Cliente Destinatário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errosImportacao.map((e, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-red-50 transition ${
                          e.severidade === "Critico" ? "bg-red-100" : "bg-yellow-50"
                        }`}
                      >
                        <td className="p-2 border-b">{e.linha}</td>
                        <td className="p-2 border-b">{e.ctrc}</td>
                        <td className="p-2 border-b text-red-700">{e.erro}</td>
                        <td className="p-2 border-b">{e.severidade}</td>
                        <td className="p-2 border-b">{e.payload?.clienteRemetente}</td>
                        <td className="p-2 border-b">{e.payload?.clienteDestinatario || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function setMostrarToast(arg0: boolean) {
  throw new Error("Function not implemented.");
}
