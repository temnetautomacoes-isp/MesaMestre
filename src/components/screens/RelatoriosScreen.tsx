import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Award, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Printer, 
  Share2, 
  Sparkles
} from 'lucide-react';

export const RelatoriosScreen: React.FC = () => {
  const { salesHistory, formatCurrency, businessConfig } = useApp();

  // Faturamento Total
  const totalRevenue = useMemo(() => {
    return salesHistory.reduce((sum, ord) => sum + ord.total, 0);
  }, [salesHistory]);

  // Ticket Médio
  const averageTicket = useMemo(() => {
    return salesHistory.length > 0 ? (totalRevenue / salesHistory.length) : 0;
  }, [totalRevenue, salesHistory]);

  // Totais por Forma de Pagamento
  const paymentsBreakdown = useMemo(() => {
    const acc = { pix: 0, dinheiro: 0, debito: 0, credito: 0 };
    salesHistory.forEach(ord => {
      ord.payments.forEach(p => {
        if (p.method === 'pix') acc.pix += p.amount;
        else if (p.method === 'dinheiro') acc.dinheiro += p.amount;
        else if (p.method === 'debito') acc.debito += p.amount;
        else if (p.method === 'credito') acc.credito += p.amount;
      });
    });
    return acc;
  }, [salesHistory]);

  // Economia estimada no PIX e Dinheiro (vs 3% taxa média de cartão)
  const cardSavings = useMemo(() => {
    const cashAndPix = paymentsBreakdown.pix + paymentsBreakdown.dinheiro;
    return cashAndPix * 0.03;
  }, [paymentsBreakdown]);

  // Mais Vendidos
  const topDishes = useMemo(() => {
    const counts: { [name: string]: { qty: number; revenue: number } } = {};

    salesHistory.forEach(ord => {
      ord.items.forEach(it => {
        if (!counts[it.name]) {
          counts[it.name] = { qty: 0, revenue: 0 };
        }
        counts[it.name].qty += it.quantity;
        counts[it.name].revenue += (it.price * it.quantity);
      });
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [salesHistory]);

  // Balcão vs Mesa
  const originBreakdown = useMemo(() => {
    let balcao = 0;
    let mesa = 0;
    salesHistory.forEach(ord => {
      if (ord.type === 'balcao') balcao += ord.total;
      else mesa += ord.total;
    });
    return { balcao, mesa };
  }, [salesHistory]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*Fechamento Diário - ${businessConfig.name}*\n` +
      `📅 Faturamento: ${formatCurrency(totalRevenue)}\n` +
      `👥 Vendas: ${salesHistory.length} atendimentos\n` +
      `🎫 Ticket Médio: ${formatCurrency(averageTicket)}\n` +
      `⚡ PIX: ${formatCurrency(paymentsBreakdown.pix)}\n` +
      `💵 Dinheiro: ${formatCurrency(paymentsBreakdown.dinheiro)}\n` +
      `💳 Cartões: ${formatCurrency(paymentsBreakdown.debito + paymentsBreakdown.credito)}\n` +
      `🏆 Prato Campeão: ${topDishes[0]?.name || 'Diversos'}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Header com Ações Rápidas */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2537]">
            Relatórios Simples & Direto ao Ponto
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Informações mastigadas para você tomar decisões certas sem perder horas em planilhas chatas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Enviar no Zap</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 bg-[#0F2537] hover:bg-[#1E4B75] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir Resumo Diário</span>
          </button>
        </div>
      </div>

      {/* 3 Cartões de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Faturamento do Dia</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Em {salesHistory.length} pedidos finalizados
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gasto Médio por Cliente</span>
          <div className="text-2xl font-black text-[#1E4B75] mt-1">
            {formatCurrency(averageTicket)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ticket médio por pedido atendido
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Economia em Taxas de Cartão
          </span>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            +{formatCurrency(cardSavings)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Ficou no seu bolso porque clientes pagaram no PIX e Dinheiro!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Como o Dinheiro Entrou (Formas de Pagamento) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-[#0F2537] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Como o Dinheiro Entrou (Meios de Pagamento)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Quanto entrou na conta bancária na hora vs maquininha vs gaveta física.
          </p>

          <div className="space-y-3 pt-2">
            {/* PIX */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-emerald-950">PIX (Caiu na hora no banco)</div>
                  <div className="text-[10px] text-emerald-700">Taxa 0% para o estabelecimento</div>
                </div>
              </div>
              <div className="text-sm font-black text-emerald-900">
                {formatCurrency(paymentsBreakdown.pix)}
              </div>
            </div>

            {/* Dinheiro */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-black">
                  <Banknote className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">Dinheiro em Cédulas & Moedas</div>
                  <div className="text-[10px] text-slate-500">Na gaveta física do balcão</div>
                </div>
              </div>
              <div className="text-sm font-black text-slate-900">
                {formatCurrency(paymentsBreakdown.dinheiro)}
              </div>
            </div>

            {/* Débito */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-blue-950">Cartão de Débito</div>
                  <div className="text-[10px] text-blue-700">Maquininha de cartão</div>
                </div>
              </div>
              <div className="text-sm font-black text-blue-900">
                {formatCurrency(paymentsBreakdown.debito)}
              </div>
            </div>

            {/* Crédito */}
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-purple-950">Cartão de Crédito</div>
                  <div className="text-[10px] text-purple-700">Recebimento futuro / antecipado</div>
                </div>
              </div>
              <div className="text-sm font-black text-purple-900">
                {formatCurrency(paymentsBreakdown.credito)}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna 2: Pratos Campeões de Venda */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-[#0F2537] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Pratos Mais Vendidos (Campeões do Caixa)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Os itens que mais giram e trazem dinheiro para o negócio.
          </p>

          <div className="space-y-3 pt-2">
            {topDishes.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-medium">
                Nenhuma venda registrada ainda.
              </div>
            ) : (
              topDishes.map((dish, idx) => (
                <div
                  key={dish.name}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-400 text-amber-950 shadow-xs' :
                      idx === 1 ? 'bg-slate-300 text-slate-800' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#0F2537]">{dish.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {dish.qty} {dish.qty === 1 ? 'unidade vendida' : 'unidades vendidas'}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-black text-emerald-800">
                    {formatCurrency(dish.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comparativo Balcão vs Mesas */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Balcão / Marmitas</span>
              <span className="text-base font-black text-slate-800">{formatCurrency(originBreakdown.balcao)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block font-semibold text-[10px] uppercase">Consumo no Salão / Mesas</span>
              <span className="text-base font-black text-[#1E4B75]">{formatCurrency(originBreakdown.mesa)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
