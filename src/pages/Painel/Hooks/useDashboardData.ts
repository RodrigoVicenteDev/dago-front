// src/pages/Painel/hooks/useDashboardData.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { PainelAvisosDTO } from "@/types/PainelAvisosDTO";
import { useAuth } from "@/context/AuthContext";

export default function useDashboardData() {
  const { token, usuario } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [avisos, setAvisos] = useState<PainelAvisosDTO>({
    ctrcsParadosGRU: [],
    ctrcsParadosUND: [],
    ctrcsAtrasadas: [],
    ctrcsVaiAtrasar: [],
  });

  // 🔥 ID fixo do cliente esporádico
  const ESPORADICO_ID = 3573;

  // 🔥 Saber se usuário é "esporádico"
  const isEsporadico =
    usuario?.clientes?.some((c) => Number(c.id) === ESPORADICO_ID) ?? false;

  // 🔥 Clientes que o usuário normal pode ver
  const meusClientesIds =
    usuario?.clientes?.map((c) => Number(c.id)) ?? [];

  // ============================================================
  // 🔥 FUNÇÃO DE FILTRAGEM (final e limpa)
  // ============================================================
  function aplicarRegras(lista: any[], cfg: any, isEsp: boolean) {
    const cargo = usuario?.cargo?.toLowerCase();
    const gerente = cargo === "gerente";

    if (gerente) return lista;

    if (isEsp) {
      return lista.filter((r) => {
        const clienteId = Number(r.clienteId);
        const unidadeId = Number(r.unidadeId);
        const destinatario = (r.destinatario || "").toUpperCase();

        // PARADOS (não possuem destinatário)
        if ("quantidade" in r) {
          return (
            !cfg.clientesExcluidos.includes(clienteId) &&
            !cfg.unidadesExcluidas.includes(unidadeId)
          );
        }

        // ATRASADAS / VAI ATRASAR (possuem destinatário)
        return (
          !cfg.clientesExcluidos.includes(clienteId) &&
          !cfg.unidadesExcluidas.includes(unidadeId) &&
          !cfg.destinatariosExcluidos.includes(destinatario)
        );
      });
    }

    // Usuário normal
    return lista.filter((r) =>
      meusClientesIds.includes(Number(r.clienteId))
    );
  }

  // ============================================================
  // 🔥 USE EFFECT FINAL
  // ============================================================
  useEffect(() => {
    if (!usuario) return;

    async function load() {
      try {
        setLoading(true);

        const res = await axios.get(`${API_URL}/api/painel/avisos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cfgRes = await axios.get(
          `${API_URL}/api/configuracoes-esporadico`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Suporta retorno em array ou objeto
        const cfgRaw = Array.isArray(cfgRes.data)
          ? cfgRes.data[0] ?? {}
          : cfgRes.data ?? {};

        const cfg = {
          clientesExcluidos: cfgRaw.clientesExcluidos ?? [],
          unidadesExcluidas: cfgRaw.unidadesExcluidas ?? [],
          destinatariosExcluidos: (cfgRaw.destinatariosExcluidos ?? []).map(
            (d: any) => String(d).toUpperCase()
          ),
        };

        const dados = res.data;

        // 🔥 Aplica regras finais
        const filtrado: PainelAvisosDTO = {
          ctrcsParadosGRU: aplicarRegras(
            dados.ctrcsParadosGRU,
            cfg,
            isEsporadico
          ),
          ctrcsParadosUND: aplicarRegras(
            dados.ctrcsParadosUND,
            cfg,
            isEsporadico
          ),
          ctrcsAtrasadas: aplicarRegras(
            dados.ctrcsAtrasadas,
            cfg,
            isEsporadico
          ),
          ctrcsVaiAtrasar: aplicarRegras(
            dados.ctrcsVaiAtrasar,
            cfg,
            isEsporadico
          ),
        };

        setAvisos(filtrado);
      } catch (err) {
        setErro("Erro ao carregar dados do painel.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [usuario, isEsporadico, API_URL, token]);

  // ============================================================
  // 🔥 RETORNO FINAL DO HOOK
  // ============================================================
  return {
    loading,
    erro,
    ...avisos,
  };
}
