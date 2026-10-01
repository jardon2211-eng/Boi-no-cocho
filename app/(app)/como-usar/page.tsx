const PASSOS = [
  { num: "1", titulo: "Cadastre os produtos da ração", desc: "Em Formulação, cadastre milho, núcleo, silagem, torta etc. com o preço por kg e o estoque mínimo desejado." },
  { num: "2", titulo: "Registre a compra dos animais", desc: "Em Compras, preencha fornecedor, nº de animais, peso de entrada e preço. O Lote é criado automaticamente com a projeção de peso final." },
  { num: "3", titulo: "Monte a dieta do lote", desc: "Em Formulação, informe quanto de cada produto vai por animal/dia para o lote. Clique em Aprovar quando fechar a dieta." },
  { num: "4", titulo: "Acompanhe o consumo", desc: "Relatório Consumo atualiza sozinho com base nas dietas Aprovadas e mostra a evolução por ingrediente." },
  { num: "5", titulo: "Controle o estoque", desc: "Lance entradas (compra de insumo) e saídas na aba Estoque Ração. O saldo e o alerta de estoque baixo são automáticos." },
  { num: "6", titulo: "Anote a ração no cocho", desc: "Todo dia, registre os 3 tratos (manhã, meio-dia, tarde) de cada lote em Ração no Cocho — ração e volumoso separados, e se sobrou algo. Nos primeiros 15 dias o app já calcula sozinho o previsto pela fase de adaptação (% do peso vivo); depois disso, usa a dieta fixa aprovada em Formulação." },
  { num: "7", titulo: "Atualize peso e venda", desc: "Em Lotes, atualize o peso periodicamente. Ao vender, registre data, peso e preço — o lucro é calculado sozinho." },
  { num: "8", titulo: "Lance despesas extras", desc: "Frete, veterinário, mão de obra etc. entram em Despesas, vinculados ao lote ou como despesa geral." },
  { num: "9", titulo: "Veja o painel geral", desc: "Visão Geral resume tudo: bois ativos, peso médio, GMD, faturamento, lucro por animal e custo de ração." },
  { num: "10", titulo: "Exporte relatórios", desc: "Em Exportar Dados, baixe PDF ou Excel da Formulação, dos Lotes ou do Relatório Geral." },
];

export default function ComoUsarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-700 flex items-center gap-2">
        ❓ Como Usar
        <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NOVO</span>
      </h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Passo a passo do fluxo completo do Boi no Cocho.</p>

      <div className="space-y-3">
        {PASSOS.map((p) => (
          <div key={p.num} className="card flex gap-4">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-500 text-white font-bold text-sm shrink-0">
              {p.num}
            </div>
            <div>
              <p className="font-bold text-gray-800">{p.titulo}</p>
              <p className="text-sm text-gray-500 mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 bg-brand-50 border-brand-100">
        <p className="font-bold text-brand-800 mb-2">🔒 Sobre seus dados</p>
        <p className="text-sm text-gray-600">
          Seus dados ficam vinculados à sua conta (login e senha) e são visíveis só pra você.
          Nenhum outro cliente do Boi no Cocho tem acesso às suas informações.
        </p>
      </div>
    </div>
  );
}
