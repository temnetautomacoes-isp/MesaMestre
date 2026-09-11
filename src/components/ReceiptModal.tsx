import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Share2, X, Check, Copy, FileText, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, businessConfig, formatCurrency, showToast } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [copied, setCopied] = useState(false);

  if (!activeReceipt) return null;

  const printSettings = businessConfig.printSettings;
  const showLogo = (printSettings?.showLogo ?? true) && !!businessConfig.logoUrl;
  const showName = printSettings?.showName ?? true;
  const showLegalName = (printSettings?.showLegalName ?? false) && !!businessConfig.legalName;
  const showCnpj = (printSettings?.showCnpj ?? true) && !!businessConfig.cnpj;
  const showIe = (printSettings?.showIe ?? false) && !!businessConfig.ie;
  const showPhone = (printSettings?.showPhone ?? true) && !!businessConfig.phone;
  const showAddress = (printSettings?.showAddress ?? true) && (!!businessConfig.address || !!businessConfig.neighborhood);
  const showCityState = (printSettings?.showCityState ?? true) && (!!businessConfig.city || !!businessConfig.state);
  const showCep = (printSettings?.showCep ?? false) && !!businessConfig.cep;
  const showFooterMessage = printSettings?.showFooterMessage ?? true;

  const handlePrint = () => {
    window.print();
  };

  const generateReceiptText = () => {
    const itemsText = activeReceipt.items
      .map(it => `• ${it.quantity}x ${it.name}${it.notes ? ` (${it.notes})` : ''} - ${formatCurrency(it.price * it.quantity)}`)
      .join('\n');

    const headerLines: string[] = [];
    if (showName) headerLines.push(businessConfig.name);
    if (showLegalName) headerLines.push(businessConfig.legalName!);
    if (showCnpj) headerLines.push(`CNPJ: ${businessConfig.cnpj}`);
    if (showIe) headerLines.push(`IE: ${businessConfig.ie}`);
    if (showPhone) headerLines.push(`Tel/Whats: ${businessConfig.phone}`);
    if (showAddress) headerLines.push(`${businessConfig.address || ''}${businessConfig.neighborhood ? `, ${businessConfig.neighborhood}` : ''}`);
    if (showCityState) headerLines.push(`${businessConfig.city || ''} - ${businessConfig.state || ''}${showCep && businessConfig.cep ? ` | CEP: ${businessConfig.cep}` : ''}`);
    
    const headerStr = headerLines.length > 0 ? headerLines.join('\n') + '\n' : '';
    const footerStr = showFooterMessage && businessConfig.footerMessage 
      ? businessConfig.footerMessage 
      : 'Obrigado pela preferência! Volte sempre!';

    return `================================\n` +
      headerStr +
      `================================\n` +
      `CUPOM NÃO FISCAL - PEDIDO #${activeReceipt.orderNumber}\n` +
      `Tipo: ${activeReceipt.type === 'mesa' ? `Mesa ${activeReceipt.tableNumber}` : 'Balcão'}\n` +
      `Cliente: ${activeReceipt.customerName || 'Consumidor Final'}\n` +
      `Data/Hora: ${activeReceipt.closedAt}\n` +
      `Atendente: ${activeReceipt.cashierName}\n` +
      `--------------------------------\n` +
      `ITENS DO PEDIDO:\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      `Subtotal: ${formatCurrency(activeReceipt.subtotal)}\n` +
      (activeReceipt.serviceFee > 0 ? `Taxa Serviço (10%): ${formatCurrency(activeReceipt.serviceFee)}\n` : '') +
      (activeReceipt.discount > 0 ? `Desconto: -${formatCurrency(activeReceipt.discount)}\n` : '') +
      `TOTAL: ${formatCurrency(activeReceipt.total)}\n` +
      `--------------------------------\n` +
      `PAGAMENTO:\n` +
      `${activeReceipt.payments.map(p => `• ${p.method.toUpperCase()}: ${formatCurrency(p.amount)}`).join('\n')}\n` +
      `================================\n` +
      `${footerStr}\n` +
      `MesaMestre - Gestão Gastronômica`;
  };

  const handleWhatsApp = () => {
    const rawText = generateReceiptText();
    const encoded = encodeURIComponent(rawText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    showToast('WhatsApp Aberto', 'Mensagem do cupom pronta para envio.');
  };

  const handleCopy = () => {
    const rawText = generateReceiptText();
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    showToast('Copiado!', 'Texto do comprovante copiado para a área de transferência.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="px-5 py-4 bg-[#0F2537] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">Venda Concluída com Sucesso!</h3>
              <p className="text-xs text-slate-300">Cupom do Pedido #{activeReceipt.orderNumber}</p>
            </div>
          </div>
          
          <button
            onClick={() => setActiveReceipt(null)}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Formato (80mm vs 58mm) */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="font-medium flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Formato de Impressão:</span>
          </span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                paperWidth === '80mm'
                  ? 'bg-[#1E4B75] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80mm (Padrão)
            </button>
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition cursor-pointer ${
                paperWidth === '58mm'
                  ? 'bg-[#1E4B75] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              58mm (Compacto)
            </button>
          </div>
        </div>

        {/* Área de Visualização do Cupom Térmico */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center items-start">
          <div 
            id="printable-receipt"
            ref={receiptRef}
            style={{ width: paperWidth === '80mm' ? '320px' : '260px' }}
            className="w-full bg-[#fdfdfd] p-5 border border-slate-300 rounded-xl shadow-md text-slate-900 font-mono text-xs leading-relaxed transition-all relative"
          >
            {/* Top Cut Serrated Line */}
            <div className="text-center text-slate-300 font-mono text-[9px] tracking-widest select-none -mt-2 mb-2">
              - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            </div>

            {/* Cabeçalho do Estabelecimento */}
            <div className="text-center pb-2.5 border-b border-dashed border-slate-400 space-y-1">
              {/* Logo no topo da nota */}
              {showLogo && (
                <div className="flex justify-center pb-1">
                  <img
                    src={businessConfig.logoUrl}
                    alt="Logo da Empresa"
                    className="max-h-14 max-w-[120px] object-contain"
                  />
                </div>
              )}

              {/* Nome Fantasia */}
              {showName && (
                <div className="font-extrabold text-sm uppercase tracking-wide text-black">
                  {businessConfig.name}
                </div>
              )}

              {/* Razão Social */}
              {showLegalName && (
                <div className="text-[10px] text-slate-700 font-medium">
                  {businessConfig.legalName}
                </div>
              )}

              {/* Documentos Fiscais */}
              {(showCnpj || showIe) && (
                <div className="text-[10px] text-slate-700">
                  {showCnpj && <span>CNPJ: {businessConfig.cnpj}</span>}
                  {showCnpj && showIe && <span> | </span>}
                  {showIe && <span>IE: {businessConfig.ie}</span>}
                </div>
              )}

              {/* Endereço & Bairro */}
              {showAddress && (
                <div className="text-[10.5px] text-slate-700">
                  {businessConfig.address}
                  {businessConfig.neighborhood ? `, ${businessConfig.neighborhood}` : ''}
                </div>
              )}

              {/* Cidade, Estado e CEP */}
              {(showCityState || showCep) && (
                <div className="text-[10.5px] text-slate-700">
                  {showCityState && <span>{businessConfig.city} - {businessConfig.state}</span>}
                  {showCityState && showCep && <span> - </span>}
                  {showCep && <span>CEP: {businessConfig.cep}</span>}
                </div>
              )}

              {/* Telefone / WhatsApp */}
              {showPhone && (
                <div className="text-[10.5px] text-slate-700">
                  Tel/Whats: {businessConfig.phone}
                </div>
              )}

              {/* Badge Extrato */}
              <div className="mt-2 text-[9.5px] bg-slate-200/80 py-0.5 px-2 rounded uppercase font-bold text-slate-800 inline-block border border-slate-300">
                Extrato Nº {activeReceipt.orderNumber} • Cupom Não Fiscal
              </div>
            </div>

            {/* Dados do Pedido e Atendimento */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10.5px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>{activeReceipt.type === 'mesa' ? `MESA ${activeReceipt.tableNumber}` : 'BALCÃO / VIAGEM'}</span>
                <span>{activeReceipt.closedAt}</span>
              </div>
              {activeReceipt.customerName && (
                <div className="text-slate-700">
                  <span className="font-semibold">Cliente:</span> {activeReceipt.customerName}
                </div>
              )}
              <div className="text-slate-600 text-[10px]">
                <span>Atendente: {activeReceipt.cashierName}</span>
              </div>
            </div>

            {/* Cabeçalho da Tabela de Itens */}
            <div className="py-2 border-b border-dashed border-slate-400">
              <div className="flex justify-between text-[9.5px] font-bold uppercase text-slate-700 pb-1 border-b border-slate-200">
                <span className="w-8">Qtd</span>
                <span className="flex-1 px-1">Descrição</span>
                <span className="w-14 text-right">Unit</span>
                <span className="w-14 text-right">Total</span>
              </div>

              {/* Lista de Itens */}
              <div className="space-y-1.5 pt-1.5">
                {activeReceipt.items.map((item, idx) => (
                  <div key={idx} className="text-[10.5px]">
                    <div className="flex justify-between items-start">
                      <span className="w-8 font-semibold shrink-0">{item.quantity}x</span>
                      <span className="flex-1 px-1 font-medium truncate">{item.name}</span>
                      <span className="w-14 text-right text-slate-600 shrink-0">{item.price.toFixed(2)}</span>
                      <span className="w-14 text-right font-bold text-black shrink-0">
                        {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="text-[9px] text-slate-500 pl-8 italic">
                        Obs: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totais do Cupom */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal Itens:</span>
                <span>{formatCurrency(activeReceipt.subtotal)}</span>
              </div>

              {activeReceipt.serviceFee > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Taxa de Serviço (10%):</span>
                  <span>{formatCurrency(activeReceipt.serviceFee)}</span>
                </div>
              )}

              {activeReceipt.discount > 0 && (
                <div className="flex justify-between text-rose-700 font-semibold">
                  <span>Desconto Concedido:</span>
                  <span>-{formatCurrency(activeReceipt.discount)}</span>
                </div>
              )}

              {/* Linha Total Destacada */}
              <div className="flex justify-between text-sm font-black pt-1.5 text-black border-t-2 border-slate-800 mt-1">
                <span>VALOR TOTAL:</span>
                <span>{formatCurrency(activeReceipt.total)}</span>
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10.5px]">
              <div className="font-bold text-[9.5px] uppercase text-slate-700">
                Formas de Pagamento Recebidas:
              </div>
              {activeReceipt.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between font-semibold">
                  <span className="capitalize">• {p.method}:</span>
                  <span>{formatCurrency(p.amount)}</span>
                </div>
              ))}
              {activeReceipt.payments.some(p => p.change && p.change > 0) && (
                <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1">
                  <span>Troco Entregue:</span>
                  <span>
                    {formatCurrency(activeReceipt.payments.reduce((acc, p) => acc + (p.change || 0), 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Rodapé e Mensagem */}
            <div className="pt-3 text-center space-y-1.5 text-[10px] text-slate-600">
              {showFooterMessage && (
                <div className="font-bold text-slate-800 leading-snug">
                  {businessConfig.footerMessage || 'Obrigado pela preferência! Volte Sempre!'}
                </div>
              )}
              <div className="text-[9px] text-slate-500">
                Sistema MesaMestre • Gestão Gastronômica
              </div>
            </div>

            {/* Bottom Cut Serrated Line */}
            <div className="text-center text-slate-300 font-mono text-[9px] tracking-widest select-none mt-3 -mb-2">
              - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            </div>
          </div>
        </div>

        {/* Barra de Ações Inferior */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => setActiveReceipt(null)}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
              title="Copiar texto da notinha"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F2537] hover:bg-[#1E4B75] text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cupom</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
