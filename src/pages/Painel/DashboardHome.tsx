import { useState } from "react";
import axios from "axios";

import CardContainer from "./components/CardContainer";
import CardAlerta from "./components/CardAlerta";
import EmptyState from "./components/EmptyState";


import { MiniCtrcGrid } from "@/components/painel";
import { useAuth } from "@/context/AuthContext";
import useDashboardData from "./Hooks/useDashboardData";

export default function DashboardHome() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const {
    loading,
    erro,
    ctrcsAtrasadas,
    ctrcsVaiAtrasar,
    ctrcsParadosGRU,
    ctrcsParadosUND,
  } = useDashboardData();

  const [selectedRows, setSelectedRows] = useState<any[] | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false);

  async function abrirGrid(titulo: string, listaIncompleta: any[]) {
    setSelectedTitle(titulo);
    setLoadingGrid(true);
    setSelectedRows(null);

    try {
      // garante compatibilidade com qualquer formato de CTRC dos cards
      const apenasCtrcs = listaIncompleta.map((c) =>
        c.ctrc || c.numero || c.Numero || c.NumeroCTRC || c.Ctrc
      );

      const { data } = await axios.post(
        `${API_URL}/api/ctrcs/grid-por-lista`,
        apenasCtrcs,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedRows(data); // CTRCs completos
    } catch (error) {
      console.error("Erro ao carregar CTRCs completos:", error);
      alert("Erro ao carregar dados completos dos CTRCs.");
    } finally {
      setLoadingGrid(false);
    }
  }

  function fecharGrid() {
    setSelectedRows(null);
    setSelectedTitle("");
  }

  if (erro) return <EmptyState mensagem={erro} />;
  if (loading) return <EmptyState mensagem="Carregando dados..." />;

  return (
    <div className="space-y-10">

      {/* CARDS */}
      <CardContainer>
        <CardAlerta
          titulo="Atrasadas"
          quantidade={ctrcsAtrasadas.length}
          onClick={() => abrirGrid("CTRCs Atrasadas", ctrcsAtrasadas)}
        />

        <CardAlerta
          titulo="Vai Atrasar"
          quantidade={ctrcsVaiAtrasar.length}
          onClick={() => abrirGrid("CTRCs que vão atrasar", ctrcsVaiAtrasar)}
        />

        <CardAlerta
          titulo="Parados GRU"
          quantidade={ctrcsParadosGRU.length}
          onClick={() => abrirGrid("Parados em GRU", ctrcsParadosGRU)}
        />

        <CardAlerta
          titulo="Parados UND"
          quantidade={ctrcsParadosUND.length}
          onClick={() => abrirGrid("Parados nas Unidades", ctrcsParadosUND)}
        />
      </CardContainer>

      {/* GRID DO PAINEL */}
      {loadingGrid && (
        <div className="text-center text-slate-600 py-8">
          Carregando dados completos...
        </div>
      )}

      {selectedRows && (
        <div
          className="bg-white rounded-xl p-6 shadow border border-slate-200
            animate-[fadeIn_0.4s_ease]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {selectedTitle} — {selectedRows.length} CTRCs
            </h2>

            <button
              onClick={fecharGrid}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300
                        text-slate-700 font-medium transition"
            >
              Fechar
            </button>
          </div>

          <MiniCtrcGrid rows={selectedRows} />
        </div>
      )}
    </div>
  );
}
