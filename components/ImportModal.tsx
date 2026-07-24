"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Download, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

export type ImportColuna = {
  key: string;
  label: string;
  obrigatoria?: boolean;
  tipo?: "number" | "string";
};

export type ImportModalProps = {
  titulo: string;
  descricao: string;
  colunas: ImportColuna[];
  abas?: { key: string; label: string; colunas: ImportColuna[] }[];
  templateNome: string;
  templateExemplo: Record<string, string | number>[];
  templateExemploAbas?: Record<string, Record<string, string | number>[]>;
  onImportar: (rows: Record<string, unknown>[], extra?: Record<string, Record<string, unknown>[]>) => Promise<{ ok: number; erros: string[] }>;
  onClose: () => void;
};

type Estado = "idle" | "preview" | "importando" | "done";

export function ImportModal({
  titulo,
  descricao,
  colunas,
  abas,
  templateNome,
  templateExemplo,
  templateExemploAbas,
  onImportar,
  onClose,
}: ImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>("idle");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [extraAbas, setExtraAbas] = useState<Record<string, Record<string, unknown>[]>>({});
  const [erros, setErros] = useState<string[]>([]);
  const [resultado, setResultado] = useState<{ ok: number; erros: string[] } | null>(null);

  function baixarTemplate() {
    const wb = XLSX.utils.book_new();

    if (abas && templateExemploAbas) {
      // Template com múltiplas abas (produtos)
      for (const aba of abas) {
        const dados = templateExemploAbas[aba.key] ?? [];
        const ws = XLSX.utils.json_to_sheet(dados.length > 0 ? dados : [Object.fromEntries(aba.colunas.map((c) => [c.key, ""]))]);
        XLSX.utils.book_append_sheet(wb, ws, aba.label);
      }
    } else {
      // Template simples (ingredientes)
      const ws = XLSX.utils.json_to_sheet(templateExemplo.length > 0 ? templateExemplo : [Object.fromEntries(colunas.map((c) => [c.key, ""]))]);
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
    }

    XLSX.writeFile(wb, templateNome);
  }

  function lerArquivo(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });

        const parsedErros: string[] = [];

        if (abas) {
          // Múltiplas abas
          const parsedExtra: Record<string, Record<string, unknown>[]> = {};
          const mainAba = abas[0];
          const mainSheet = wb.Sheets[mainAba.label] ?? wb.Sheets[wb.SheetNames[0]];
          const mainRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(mainSheet ?? {});

          mainRows.forEach((row, i) => {
            mainAba.colunas.filter((c) => c.obrigatoria).forEach((col) => {
              if (!row[col.key] && row[col.key] !== 0) {
                parsedErros.push(`Aba "${mainAba.label}", linha ${i + 2}: campo "${col.label}" em falta.`);
              }
            });
          });

          for (let ai = 1; ai < abas.length; ai++) {
            const aba = abas[ai];
            const sheet = wb.Sheets[aba.label] ?? wb.Sheets[wb.SheetNames[ai]];
            const abaRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet ?? {});
            abaRows.forEach((row, i) => {
              aba.colunas.filter((c) => c.obrigatoria).forEach((col) => {
                if (!row[col.key] && row[col.key] !== 0) {
                  parsedErros.push(`Aba "${aba.label}", linha ${i + 2}: campo "${col.label}" em falta.`);
                }
              });
            });
            parsedExtra[aba.key] = abaRows;
          }

          setRows(mainRows);
          setExtraAbas(parsedExtra);
        } else {
          // Aba única
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          parsed.forEach((row, i) => {
            colunas.filter((c) => c.obrigatoria).forEach((col) => {
              if (!row[col.key] && row[col.key] !== 0) {
                parsedErros.push(`Linha ${i + 2}: campo "${col.label}" em falta.`);
              }
            });
          });

          setRows(parsed);
        }

        setErros(parsedErros);
        setEstado("preview");
      } catch {
        setErros(["Não foi possível ler o ficheiro. Certifica-te que é um .xlsx válido."]);
        setEstado("preview");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function confirmar() {
    setEstado("importando");
    try {
      const res = await onImportar(rows, extraAbas);
      setResultado(res);
      setEstado("done");
    } catch {
      setResultado({ ok: 0, erros: ["Erro ao importar. Tenta novamente."] });
      setEstado("done");
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">{titulo}</h2>
            <p className="mt-0.5 text-xs text-muted">{descricao}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-[#f4f5f7] hover:text-ink"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Idle */}
        {estado === "idle" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={baixarTemplate}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line bg-[#f8f8f9] px-4 py-3 text-left transition hover:bg-[#f4f5f7]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blueberry-soft text-blueberry">
                <Download className="size-4" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">Baixar modelo Excel</span>
                <span className="block text-xs text-muted">Preenche e envia de volta</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-strawberry/40 bg-strawberry-soft/30 px-4 py-3 text-left transition hover:bg-strawberry-soft/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-strawberry-soft text-strawberry">
                <Upload className="size-4" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">Enviar ficheiro Excel</span>
                <span className="block text-xs text-muted">Formato .xlsx</span>
              </span>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) lerArquivo(file);
              }}
            />
          </div>
        )}

        {/* Preview */}
        {estado === "preview" && (
          <div className="space-y-3">
            {erros.length > 0 ? (
              <div className="rounded-2xl bg-strawberry-soft/50 p-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-strawberry">
                  <AlertTriangle className="size-4" strokeWidth={1.75} />
                  {erros.length} problema(s) encontrado(s)
                </div>
                <ul className="space-y-0.5 pl-6">
                  {erros.slice(0, 5).map((e, i) => (
                    <li key={i} className="text-xs text-strawberry">{e}</li>
                  ))}
                  {erros.length > 5 && (
                    <li className="text-xs text-strawberry">…e mais {erros.length - 5}</li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-mint-soft/50 p-3 text-sm font-semibold text-mint">
                <CheckCircle2 className="size-4" strokeWidth={1.75} />
                {rows.length} {rows.length === 1 ? "registo" : "registos"} prontos para importar
                {Object.keys(extraAbas).length > 0 && abas && (
                  <span className="ml-1 font-normal text-muted">
                    · {abas.slice(1).map((a) => `${extraAbas[a.key]?.length ?? 0} ${a.label.toLowerCase()}`).join(", ")}
                  </span>
                )}
              </div>
            )}

            {/* Preview da tabela */}
            {rows.length > 0 && erros.length === 0 && (
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-xs">
                  <thead className="bg-[#f8f8f9]">
                    <tr>
                      {(abas ? abas[0].colunas : colunas).map((c) => (
                        <th key={c.key} className="px-3 py-2 text-left font-semibold text-muted">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {(abas ? abas[0].colunas : colunas).map((c) => (
                          <td key={c.key} className="px-3 py-2 text-ink">
                            {String(row[c.key] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && (
                  <p className="px-3 py-2 text-xs text-muted">…e mais {rows.length - 5}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setEstado("idle"); setRows([]); setErros([]); }}
                className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-muted transition hover:bg-[#f4f5f7]"
              >
                Voltar
              </button>
              {erros.length === 0 && rows.length > 0 && (
                <button
                  type="button"
                  onClick={confirmar}
                  className="flex-1 rounded-full bg-strawberry py-2.5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110"
                >
                  Importar {rows.length} {rows.length === 1 ? "registo" : "registos"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Importando */}
        {estado === "importando" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="size-8 animate-spin text-strawberry" strokeWidth={1.75} />
            <p className="text-sm font-medium text-ink">A importar…</p>
            <p className="text-xs text-muted">Por favor aguarda</p>
          </div>
        )}

        {/* Done */}
        {estado === "done" && resultado && (
          <div className="space-y-3">
            {resultado.ok > 0 && (
              <div className="flex items-center gap-2 rounded-2xl bg-mint-soft/50 p-3 text-sm font-semibold text-mint">
                <CheckCircle2 className="size-4" strokeWidth={1.75} />
                {resultado.ok} {resultado.ok === 1 ? "registo importado" : "registos importados"} com sucesso
              </div>
            )}
            {resultado.erros.length > 0 && (
              <div className="rounded-2xl bg-strawberry-soft/50 p-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-strawberry">
                  <AlertTriangle className="size-4" strokeWidth={1.75} />
                  {resultado.erros.length} erro(s)
                </div>
                <ul className="space-y-0.5 pl-6">
                  {resultado.erros.slice(0, 5).map((e, i) => (
                    <li key={i} className="text-xs text-strawberry">{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-strawberry py-2.5 text-sm font-semibold text-white shadow-sm shadow-strawberry/30 transition hover:brightness-110"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
