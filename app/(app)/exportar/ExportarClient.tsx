"use client";

function baixarCSV(nomeArquivo: string, linhas: (string | number)[][]) {
  const csv = linhas
    .map((linha) =>
      linha
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomeArquivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function imprimirPDF(titulo: string, linhas: (string | number)[][]) {
  const janela = window.open("", "_blank");
  if (!janela) return;
  const [cabecalho, ...corpo] = linhas;
  janela.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
          h1 { color: #2e4c2e; font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
          th { background: #4c7a3e; color: white; }
          tr:nth-child(even) { background: #f7f7f5; }
        </style>
      </head>
      <body>
        <h1>🐂 Boi no Cocho — ${titulo}</h1>
        <p style="color:#888; font-size:12px;">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
        <table>
          <thead><tr>${cabecalho.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>${corpo.map((linha) => `<tr>${linha.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </body>
    </html>
  `);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 300);
}

export function ExportCard({
  icon, titulo, descricao, corFundo, linhas, nomeArquivo,
}: {
  icon: string;
  titulo: string;
  descricao: string;
  corFundo: string;
  linhas: (string | number)[][];
  nomeArquivo: string;
}) {
  const semDados = linhas.length <= 1;
  return (
    <div className="card overflow-hidden p-0">
      <div className={`${corFundo} px-5 py-4`}>
        <p className="font-bold text-gray-800">{icon} {titulo}</p>
        <p className="text-sm text-gray-600 mt-0.5">{descricao}</p>
      </div>
      <div className="px-5 py-4 flex gap-2">
        <button
          disabled={semDados}
          onClick={() => imprimirPDF(titulo, linhas)}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-lg"
        >
          📄 Exportar PDF
        </button>
        <button
          disabled={semDados}
          onClick={() => baixarCSV(nomeArquivo, linhas)}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-lg"
        >
          📊 Exportar Excel
        </button>
      </div>
      {semDados && <p className="px-5 pb-3 text-xs text-gray-400">Sem dados ainda para exportar.</p>}
    </div>
  );
}
