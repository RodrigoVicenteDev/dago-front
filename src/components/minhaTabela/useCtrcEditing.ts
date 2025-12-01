// src/components/minhaTabela/useCtrcEditing.ts
import { useEffect, useState } from "react";
import axios from "axios";

export function useCtrcEditing(ctrc: any) {
  const { API_URL, token } = {
    API_URL: import.meta.env.VITE_API_URL,
    token: ctrc?.usuario?.token ?? undefined,
  };

  const [dirty, setDirty] = useState<Record<number, any>>({});

  // 🔥 Autosave idêntico ao original (debounce 2s)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const ids = Object.keys(dirty);
      if (!ids.length) return;

      for (const id of ids) {
        const dto = dirty[Number(id)];
        const dataEntrega =
          dto.DataEntregaRealizada ??
          dto.dataEntregaRealizada ??
          null;

        let dataISO = null;
        if (dataEntrega) {
          const d = new Date(dataEntrega);
          if (!isNaN(d.getTime())) dataISO = d.toISOString();
        }

        const payload = {
          DataEntregaRealizada: dataISO,
          StatusEntregaId: dto.StatusEntregaId ?? null,
          Observacao: dto.Observacao ?? null,
          DescricaoOcorrenciaAtendimento:
            dto.DescricaoOcorrenciaAtendimento ??
            dto.ultimaDescricaoOcorrenciaAtendimento ??
            null,
          tipoOcorrenciaId:
            dto.DescricaoOcorrenciaAtendimento ||
            dto.ultimaDescricaoOcorrenciaAtendimento
              ? 1
              : null,
        };

        try {
          await axios.put(`${API_URL}/api/ctrcs/${id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.error(`❌ Erro ao salvar CTRC ${id}`, err);
        }
      }

      setDirty({});
    }, 2000);

    return () => clearTimeout(timeout);
  }, [dirty]);

  // 🔧 Edição de células (onCellValueChanged)
  const onCellEdit = (params: any) => {
    const { id } = params.data;
    const field = params.colDef.field as string;
    let value =
      params.newValue ?? params.value ?? params.data?.[field] ?? null;

    if (field === "statusEntregaId") {
      const asNumber = Number(value);
      if (!isNaN(asNumber)) value = asNumber;
    }

    if (field === "dataEntregaRealizada" && value) {
      let parsed: Date | null = null;

      if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [dia, mes, ano] = value.split("/").map(Number);
        parsed = new Date(ano, mes - 1, dia);
      } else parsed = new Date(value);

      if (parsed && !isNaN(parsed.getTime())) value = parsed.toISOString();
      else value = null;
    }

    const fieldMap: Record<string, string> = {
      dataEntregaRealizada: "DataEntregaRealizada",
      statusEntregaId: "StatusEntregaId",
      observacao: "Observacao",
      descricaoOcorrenciaAtendimento: "DescricaoOcorrenciaAtendimento",
      ultimaDescricaoOcorrenciaAtendimento:
        "DescricaoOcorrenciaAtendimento",
    };

    const backendField = fieldMap[field] || field;

    // Atualiza dirty
    setDirty((prev) => {
      const updated = {
        ...(prev[id] || {}),
        [backendField]: value,
      };
      return { ...prev, [id]: updated };
    });

    // Mantém grid sincronizada
    ctrc.setRows((prev: any[]) =>
      prev.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
    ctrc.setAllRows((prev: any[]) =>
      prev.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  return {
    onCellEdit,
    dirty,
  };
}
