// src/components/ExportExcelButton.tsx
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ExportExcelButtonProps {
  rows: any[];
  fileName?: string;
  label?: string;
  className?: string;
}

export default function ExportExcelButton({
  rows,
  fileName = "export.xlsx",
  label = "Exportar Excel",
  className = "",
}: ExportExcelButtonProps) {
  const handleExport = () => {
    if (!rows || rows.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }

    // cria sheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

    // gera buffer
    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // baixa arquivo
    const blob = new Blob([buffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className={
        className ||
        "flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
      }
    >
      📤 {label}
    </button>
  );
}
