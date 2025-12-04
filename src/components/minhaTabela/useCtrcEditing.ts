// src/components/minhaTabela/useCtrcEditing.ts
import { useEffect, useState } from "react";
import axios from "axios";

export default function useCtrcEditing(ctrc: any) {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = ctrc;
  const [dirty, setDirty] = useState<Record<number, any>>({});

  // ============================
  // 🔥 TESTE 1: FieldMap correto
  // ============================
  const fieldMap: Record<string, string> = {
    ultimaDescricaoOcorrenciaAtendimento: "DescricaoOcorrenciaAtendimento",
    descricaoOcorrenciaAtendimento: "DescricaoOcorrenciaAtendimento",
    observacao: "Observacao",
    statusEntregaId: "StatusEntregaId",
    dataEntregaRealizada: "DataEntregaRealizada",
  };

  // =====================================================
  // 🔥 TESTE 2: Verificar se o onCellEdit está disparando
  // =====================================================
  const onCellEdit = (params: any) => {
    console.log("🔥 TESTE 2 → onCellEdit DISPAROU!", {
      field: params.colDef?.field,
      newValue: params.newValue,
      oldValue: params.oldValue,
      row: params.data,
    });

    const { data, colDef, newValue } = params;
    const field = colDef.field;
    const backendField = fieldMap[field] || field;

    // 🛠️ Atualiza a linha na tabela
    ctrc.setRows((prev: any[]) =>
      prev.map(r => (r.id === data.id ? { ...r, [field]: newValue } : r)),
    );

    // ================================
    // 🔥 TESTE 3: Atualização do dirty
    // ================================
    setDirty(prev => {
      const updated = {
        ...(prev[data.id] || {}),
        [backendField]: newValue,
      };

      console.log("📌 DIRTY ATUALIZADO PARA ID", data.id, updated);

      return {
        ...prev,
        [data.id]: updated,
      };
    });
  };

  // =====================================================
  // 🔎 TESTE 4: Monitorar estado completo de dirty
  // =====================================================
  useEffect(() => {
    console.log("🧿 DIRTY STATE COMPLETO:", dirty);
  }, [dirty]);

  // =====================================================
  // ⏳ AUTOSAVE — salva após 2 segundos sem digitar
  // =====================================================
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const ids = Object.keys(dirty);

      console.log("⏳ AUTOSAVE → IDs modificados:", ids);

      if (ids.length === 0) return;

      for (const id of ids) {
        const dto = dirty[id];

        console.log("🚀 AUTOSAVE PREPARANDO PUT PARA", id, "DTO:", dto);

        // Monta payload
        const dataEntrega =
          dto.DataEntregaRealizada ?? dto.dataEntregaRealizada ?? dto.dataEntrega ?? null;

        let dataISO = null;
        if (dataEntrega) {
          const d = new Date(dataEntrega);
          if (!isNaN(d.getTime())) {
            dataISO = d.toISOString();
          }
        }
        const payload: any = {
          DataEntregaRealizada: dataISO,
          StatusEntregaId: dto.StatusEntregaId ?? dto.statusEntregaId ?? null,
          Observacao: dto.Observacao ?? dto.observacao ?? null,
          DescricaoOcorrenciaAtendimento:
            dto.DescricaoOcorrenciaAtendimento ??
            dto.descricaoOcorrenciaAtendimento ??
            dto.ultimaDescricaoOcorrenciaAtendimento ??
            null,
          tipoOcorrenciaId:
            (dto.DescricaoOcorrenciaAtendimento ??
            dto.descricaoOcorrenciaAtendimento ??
            dto.ultimaDescricaoOcorrenciaAtendimento)
              ? 1
              : null,
        };

        console.log("📤 AUTOSAVE ENVIANDO PAYLOAD:", payload);

        try {
          await axios.put(`${API_URL}/api/ctrcs/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log(`✅ AUTOSAVE → CTRC ${id} SALVO COM SUCESSO!`);
        } catch (err) {
          console.log(`❌ AUTOSAVE ERRO AO SALVAR CTRC ${id}:`, err);
        }
      }

      // Limpamos o dirty após salvar
      console.log("🧽 AUTOSAVE → limpando estado dirty");
      setDirty({});
    }, 2000);

    return () => clearTimeout(timeout);
  }, [dirty]);

  return {
    onCellEdit,
  };
}
