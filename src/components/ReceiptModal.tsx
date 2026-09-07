import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Share2, X, Check, Utensils } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, businessConfig, formatCurrency, showToast } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const itemsText = activeReceipt.items
      .map(it => `• ${it.quantity}x ${it.name} - ${formatCurrency(it.price * it.quantity)}`)
      .join('%0A');
    
    const text = `*COMPROVANTE DE PEDIDO #${activeReceipt.orderNumber}*%0A` +
      `*${businessConfig.name}*%0A` +
      `--------------------------------%0A` +
      `*Tipo:* ${activeReceipt.type === 'mesa' ? `Mesa ${activeReceipt.tableNumber}` : 'Balcão'}%0A` +
      `*Cliente:* ${activeReceipt.customerName || 'Cliente'}%0A` +
      `*Data/Hora:* ${activeReceipt.closedAt}%0A` +
      `--------------------------------%0A` +
      `${itemsText}%0A` +
      `--------------------------------%0A` +
      `*Subtotal:* ${formatCurrency(activeReceipt.subtotal)}%0A` +
      (activeReceipt.serviceFee > 0 ? `*Serviço (10%):* ${formatCurrency(activeReceipt.serviceFee)}%0A` : '') +
      (activeReceipt.discount > 0 ? `*Desconto:* -${formatCurrency(activeReceipt.discount)}%0A` : '') +
      `*TOTAL:* ${formatCurrency(activeReceipt.total)}%0A` +
      `--------------------------------%0A` +
      `*Pagamento:* ${activeReceipt.payments.map(p => `${p.method.toUpperCase()} ${formatCurrency(p.amount)}`).join(', ')}%0A` +
      `Obrigado pela preferência! Volte sempre!`;

    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    showToast('WhatsApp Aberto', 'Mensagem formatada com comprovante gerada.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 bg-[#0F2537] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Venda Concluída com Sucesso!</h3>
              <p className="text-xs text-slate-300">Cupom do Pedido #{activeReceipt.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prévia do Cupom Térmico (80mm) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 flex justify-center">
          <div 
            ref={receiptRef}
            className="w-full max-w-[320px] bg-white p-5 border border-dashed border-slate-300 rounded-lg shadow-sm text-slate-800 font-mono text-xs leading-relaxed"
          >
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="font-extrabold text-sm uppercase tracking-wider">{businessConfig.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{businessConfig.city} - {businessConfig.state}</div>
              <div className="text-[11px] text-slate-500">Tel: {businessConfig.phone}</div>
              <div className="mt-2 text-[10px] bg-slate-100 py-0.5 px-2 rounded uppercase font-bold text-slate-700">
                Extrato Nº {activeReceipt.orderNumber} - Não Fiscal
              </div>
            </div>

            <div className="py-2 border-b border-dashed border-slate-300 flex justify-between text-[11px]">
              <div>
                <span className="font-semibold">
                  {activeReceipt.type === 'mesa' ? `MESA ${activeReceipt.tableNumber}` : 'BALCÃO'}
                </span>
                {activeReceipt.customerName && (
                  <span className="text-slate-500"> ({activeReceipt.customerName})</span>
                )}
              </div>
              <div className="text-slate-500">{activeReceipt.closedAt}</div>
            </div>

            {/* Itens */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Item</span>
                <span>Qtd x Unit</span>
                <span>Total</span>
              </div>
              {activeReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div className="truncate max-w-[140px]">
                    <span className="font-medium">{item.name}</span>
                    {item.notes && <div className="text-[9px] text-slate-400 italic">Obs: {item.notes}</div>}
                  </div>
                  <div className="text-slate-500 shrink-0">
                    {item.quantity}x {item.price.toFixed(2)}
                  </div>
                  <div className="font-semibold text-right shrink-0">
                    {(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(activeReceipt.subtotal)}</span>
              </div>
              {activeReceipt.serviceFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Taxa Serviço (10%):</span>
                  <span>{formatCurrency(activeReceipt.serviceFee)}</span>
                </div>
              )}
              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Desconto:</span>
                  <span>-{formatCurrency(activeReceipt.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1 text-slate-900 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>{formatCurrency(activeReceipt.total)}</span>
              </div>
            </div>

            {/* Pagamentos */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="font-bold text-[10px] uppercase text-slate-500">Formas de Pagamento:</div>
              {activeReceipt.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between font-medium">
                  <span className="capitalize">{p.method}:</span>
                  <span>{formatCurrency(p.amount)}</span>
                </div>
              ))}
              {activeReceipt.payments.some(p => p.change && p.change > 0) && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Troco entregue:</span>
                  <span>
                    {formatCurrency(activeReceipt.payments.reduce((acc, p) => acc + (p.change || 0), 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="pt-3 text-center text-[10px] text-slate-500 space-y-1">
              <div>Atendido por: {activeReceipt.cashierName}</div>
              <div className="font-medium text-slate-600">Obrigado pela preferência! Volte Sempre!</div>
              <div className="text-[9px] text-slate-400">Sistema MesaMestre - Gestão Gastronômica</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveReceipt(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0F2537] hover:bg-[#1E4B75] text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Cupom</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
