import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TableStatus, OrderItem, PaymentRecord } from '../../types';
import { 
  Users, 
  Clock, 
  Plus, 
  ArrowRightLeft, 
  Receipt, 
  CheckCircle2, 
  Utensils, 
  QrCode, 
  Banknote, 
  CreditCard, 
  Trash2, 
  X,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const MesasScreen: React.FC = () => {
  const { 
    businessConfig, 
    tableStatuses, 
    tableOrders, 
    openTable, 
    addItemToTable, 
    removeItemFromTable, 
    setTableStatus, 
    transferTable, 
    closeTableOrder, 
    menuItems, 
    formatCurrency, 
    showToast 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'todos' | TableStatus>('todos');
  
  // Table Modal
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  // Quick Add Item inside Modal
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemNote, setItemNote] = useState<string>('');

  // Transfer Modal
  const [transferTargetTable, setTransferTargetTable] = useState<number | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);

  // Close Bill Checkout
  const [isClosingBill, setIsClosingBill] = useState<boolean>(false);
  const [includeService, setIncludeService] = useState<boolean>(businessConfig.serviceChargePercentage > 0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'debito' | 'credito'>('pix');
  const [receivedCashAmount, setReceivedCashAmount] = useState<string>('');
  const [splitCount, setSplitCount] = useState<number>(1);

  const tablesList = useMemo(() => {
    return Array.from({ length: businessConfig.tableCount }, (_, i) => i + 1);
  }, [businessConfig.tableCount]);

  const filteredTables = useMemo(() => {
    return tablesList.filter(num => {
      const status = tableStatuses[num] || 'livre';
      if (statusFilter === 'todos') return true;
      return status === statusFilter;
    });
  }, [tablesList, tableStatuses, statusFilter]);

  // Active table data
  const currentOrder = selectedTable !== null ? tableOrders[selectedTable] : null;

  const currentSubtotal = useMemo(() => {
    if (!currentOrder) return 0;
    return currentOrder.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  }, [currentOrder]);

  const serviceFee = useMemo(() => {
    if (!includeService) return 0;
    return currentSubtotal * (businessConfig.serviceChargePercentage / 100);
  }, [includeService, currentSubtotal, businessConfig.serviceChargePercentage]);

  const billTotal = useMemo(() => {
    return Math.max(0, currentSubtotal - discountAmount + serviceFee);
  }, [currentSubtotal, discountAmount, serviceFee]);

  const splitValue = useMemo(() => {
    return splitCount > 0 ? (billTotal / splitCount) : billTotal;
  }, [billTotal, splitCount]);

  const cashChange = useMemo(() => {
    const received = parseFloat(receivedCashAmount.replace(',', '.')) || 0;
    return Math.max(0, received - billTotal);
  }, [receivedCashAmount, billTotal]);

  const handleOpenTableClick = (tableNumber: number) => {
    if (!tableOrders[tableNumber]) {
      openTable(tableNumber, `Mesa ${tableNumber}`, 2);
    }
    setSelectedTable(tableNumber);
    setIsClosingBill(false);
  };

  const handleAddItemToCurrentTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !selectedProductId) return;

    const prod = menuItems.find(m => m.id === selectedProductId);
    if (!prod) return;

    addItemToTable(selectedTable, prod, itemQuantity, itemNote);
    setSelectedProductId('');
    setItemQuantity(1);
    setItemNote('');
  };

  const handleConfirmCloseBill = () => {
    if (!selectedTable) return;

    const receivedNum = parseFloat(receivedCashAmount.replace(',', '.')) || billTotal;

    const payments: PaymentRecord[] = [
      {
        method: paymentMethod,
        amount: billTotal,
        receivedAmount: paymentMethod === 'dinheiro' ? receivedNum : billTotal,
        change: paymentMethod === 'dinheiro' ? cashChange : 0,
      }
    ];

    closeTableOrder(selectedTable, payments, discountAmount, includeService);
    setSelectedTable(null);
    setIsClosingBill(false);
  };

  const handleExecuteTransfer = () => {
    if (selectedTable && transferTargetTable) {
      transferTable(selectedTable, transferTargetTable);
      setIsTransferOpen(false);
      setSelectedTable(transferTargetTable);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Barra de Filtros de Status do Salão */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0F2537] flex items-center gap-2">
            <span>Visão do Salão em Tempo Real</span>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {businessConfig.tableCount} mesas
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o tempo de permanência, pedidos em preparo e fechamento de conta.
          </p>
        </div>

        {/* Pílulas de Filtro */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-[#1E4B75] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({tablesList.length})
          </button>
          <button
            onClick={() => setStatusFilter('ocupada')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'ocupada'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Ocupadas ({tablesList.filter(t => tableStatuses[t] === 'ocupada').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('pedindo_conta')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pedindo_conta'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Pedindo Conta ({tablesList.filter(t => tableStatuses[t] === 'pedindo_conta').length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('livre')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'livre'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Livres ({tablesList.filter(t => (tableStatuses[t] || 'livre') === 'livre').length})</span>
          </button>
        </div>
      </div>

      {/* Grade de Mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredTables.map((tableNumber) => {
          const status = tableStatuses[tableNumber] || 'livre';
          const order = tableOrders[tableNumber];
          const hasOrder = !!order && order.items.length > 0;
          const orderTotal = hasOrder ? order.items.reduce((s, it) => s + (it.price * it.quantity), 0) : 0;

          const statusColors = {
            livre: 'bg-white border-slate-200 hover:border-emerald-400 text-slate-700',
            ocupada: 'bg-blue-50/70 border-blue-300 hover:border-blue-500 text-blue-950 shadow-xs',
            pedindo_conta: 'bg-amber-50/80 border-amber-400 hover:border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-400/20',
            reservada: 'bg-purple-50/70 border-purple-300 text-purple-950'
          };

          const badgeStyles = {
            livre: 'bg-slate-100 text-slate-600',
            ocupada: 'bg-blue-600 text-white font-bold',
            pedindo_conta: 'bg-amber-500 text-white font-black animate-pulse',
            reservada: 'bg-purple-600 text-white font-bold'
          };

          return (
            <div
              key={tableNumber}
              onClick={() => handleOpenTableClick(tableNumber)}
              className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 relative group hover:shadow-md ${statusColors[status]}`}
            >
              {/* Topo do Card */}
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xl font-black tracking-tight text-[#0F2537]">
                    Mesa {tableNumber}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyles[status]}`}>
                    {status === 'pedindo_conta' ? 'Pediu Conta' : status}
                  </span>
                </div>

                {order ? (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {order.customerName || `Cliente Mesa ${tableNumber}`}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        {order.peopleCount}p
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {order.openedAt}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-medium pt-1">
                    Mesa livre e higienizada
                  </div>
                )}
              </div>

              {/* Centro / Itens */}
              {hasOrder && (
                <div className="text-[11px] text-slate-600 line-clamp-1 italic bg-white/70 py-1 px-2 rounded-lg border border-slate-200/60">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}: {order.items[0]?.name}
                </div>
              )}

              {/* Rodapé do Card */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                  <span className="text-sm font-black text-emerald-800">
                    {formatCurrency(orderTotal)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {status === 'ocupada' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableStatus(tableNumber, 'pedindo_conta');
                        showToast('Pedindo Conta', `Mesa ${tableNumber} sinalizou para fechar a conta!`);
                      }}
                      className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition"
                      title="Marcar como Pedindo Conta"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTableClick(tableNumber);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0F2537] hover:bg-[#1E4B75] text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Comanda</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes da Comanda da Mesa */}
      {selectedTable !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F2537] text-white font-black text-base flex items-center justify-center">
                  #{selectedTable}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F2537]">
                    Comanda - Mesa {selectedTable}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentOrder?.customerName || 'Cliente'} • Aberta às {currentOrder?.openedAt || '12:00'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTransferOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Mover cliente para outra mesa livre"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transferir</span>
                </button>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo: Lista de Pedidos & Adicionar Rápido */}
            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              {/* Formulário de Adicionar Item Rápido */}
              <form onSubmit={handleAddItemToCurrentTable} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">Lançar Novo Item na Comanda:</span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <select
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
                    >
                      <option value="">Selecione o Prato ou Bebida...</option>
                      {menuItems.filter(m => m.isActive).map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {formatCurrency(m.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={e => setItemQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-center text-slate-800 outline-hidden"
                      title="Quantidade"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <button
                      type="submit"
                      disabled={!selectedProductId}
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        selectedProductId
                          ? 'bg-[#10B981] hover:bg-[#0ea571] text-white shadow-sm'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>

                {selectedProductId && (
                  <div>
                    <input
                      type="text"
                      value={itemNote}
                      onChange={e => setItemNote(e.target.value)}
                      placeholder="Observação (opcional: sem gelo, mal passado, etc.)"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden"
                    />
                  </div>
                )}
              </form>

              {/* Lista dos Itens Já Pedidos */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Itens Consumidos ({currentOrder?.items.length || 0}):
                </span>

                {(!currentOrder || currentOrder.items.length === 0) ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    Nenhum pedido lançado nesta comanda ainda.
                  </div>
                ) : (
                  currentOrder.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#0F2537]">{it.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{it.quantity}x {formatCurrency(it.price)}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400">{it.addedAt}</span>
                          {it.notes && <span className="italic text-amber-700">({it.notes})</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-emerald-800">
                          {formatCurrency(it.price * it.quantity)}
                        </span>
                        <button
                          onClick={() => removeItemFromTable(selectedTable, it.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          title="Cancelar item da comanda"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rodapé / Fechamento de Conta */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Subtotal da Mesa:</span>
                <span className="font-bold text-slate-800">{formatCurrency(currentSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Total Acumulado</span>
                  <span className="text-xl font-black text-emerald-800">
                    {formatCurrency(currentSubtotal + (includeService ? currentSubtotal * 0.1 : 0))}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTableStatus(selectedTable, 'pedindo_conta');
                      showToast('Status Atualizado', `Mesa ${selectedTable} marcada como Pedindo Conta.`);
                    }}
                    className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition border border-amber-200 cursor-pointer"
                  >
                    Imprimir Parcial
                  </button>
                  <button
                    disabled={!currentOrder || currentOrder.items.length === 0}
                    onClick={() => setIsClosingBill(true)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer ${
                      currentOrder && currentOrder.items.length > 0
                        ? 'bg-[#10B981] hover:bg-[#0ea571] text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Fechar Conta da Mesa</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fechamento de Conta da Mesa */}
      {isClosingBill && selectedTable !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#0F2537]">
                  Fechar Mesa {selectedTable}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentOrder?.customerName || 'Cliente'} • {currentOrder?.items.length} itens
                </p>
              </div>
              <button
                onClick={() => setIsClosingBill(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Detalhes & Taxa de Serviço */}
            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(currentSubtotal)}</span>
              </div>

              {businessConfig.serviceChargePercentage > 0 && (
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Taxa de Serviço ({businessConfig.serviceChargePercentage}%):</span>
                  <button
                    type="button"
                    onClick={() => setIncludeService(!includeService)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      includeService ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {includeService ? `+${formatCurrency(serviceFee)} (Inclusa)` : 'Isenta (R$ 0)'}
                  </button>
                </div>
              )}

              {/* Divisor de Conta */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Dividir entre:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setSplitCount(n)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition cursor-pointer ${
                        splitCount === n
                          ? 'bg-[#1E4B75] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {splitCount > 1 && (
                <div className="flex justify-between items-center bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
                  <span>Por pessoa ({splitCount}x):</span>
                  <span>{formatCurrency(splitValue)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-[#0F2537] pt-2 border-t border-slate-200">
                <span>TOTAL A COBRAR:</span>
                <span className="text-emerald-700">{formatCurrency(billTotal)}</span>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="grid grid-cols-2 gap-2 my-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>PIX (0%)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro')}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'dinheiro'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Dinheiro</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('debito')}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'debito'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Débito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credito')}
                className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                  paymentMethod === 'credito'
                    ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Crédito</span>
              </button>
            </div>

            {/* Dinheiro / Troco */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Valor entregue:</span>
                  <span className="text-emerald-800">Troco: {formatCurrency(cashChange)}</span>
                </div>
                <input
                  type="text"
                  value={receivedCashAmount}
                  onChange={e => setReceivedCashAmount(e.target.value)}
                  placeholder={billTotal.toFixed(2)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-hidden"
                />
              </div>
            )}

            {/* Botões Finais */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClosingBill(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseBill}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar e Liberar Mesa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Transferência de Mesa */}
      {isTransferOpen && selectedTable !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F2537] mb-1">
              Transferir Mesa {selectedTable}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Escolha para qual mesa livre deseja transferir o cliente e a comanda:
            </p>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {tablesList.map((num) => {
                const isFree = (tableStatuses[num] || 'livre') === 'livre';
                const isSelected = transferTargetTable === num;
                return (
                  <button
                    key={num}
                    disabled={!isFree || num === selectedTable}
                    onClick={() => setTransferTargetTable(num)}
                    className={`h-12 rounded-xl border text-xs font-black transition flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : isFree && num !== selectedTable
                        ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 cursor-pointer'
                        : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <span>Mesa {num}</span>
                    <span className="text-[9px] font-normal">{isFree ? 'Livre' : 'Ocupada'}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={!transferTargetTable}
                onClick={handleExecuteTransfer}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  transferTargetTable
                    ? 'bg-[#1E4B75] hover:bg-[#163857] text-white shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
