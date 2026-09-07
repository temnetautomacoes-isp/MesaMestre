import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem, OrderItem, PaymentRecord } from '../../types';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Users, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Check, 
  Receipt, 
  ChefHat, 
  Clock, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const PdvScreen: React.FC = () => {
  const { 
    menuItems, 
    categories, 
    businessConfig, 
    formatCurrency, 
    finalizeQuickSale, 
    addItemToTable, 
    tableOrders, 
    showToast 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Destination: 'balcao' or tableNumber (1 to tableCount)
  const [orderDestination, setOrderDestination] = useState<'balcao' | number>('balcao');
  const [customerName, setCustomerName] = useState<string>('');
  
  // Current Cart for Balcão
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  
  // Notes / Options Modal
  const [activeItemForModal, setActiveItemForModal] = useState<MenuItem | null>(null);
  const [itemNote, setItemNote] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Bill split
  const [splitCount, setSplitCount] = useState<number>(1);

  // Payment Drawer
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'debito' | 'credito'>('pix');
  const [receivedCashAmount, setReceivedCashAmount] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Filtered menu items
  const filteredProducts = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch && item.isActive;
    });
  }, [menuItems, selectedCategory, searchTerm]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const splitValue = useMemo(() => {
    return splitCount > 0 ? (total / splitCount) : total;
  }, [total, splitCount]);

  const cashChange = useMemo(() => {
    const received = parseFloat(receivedCashAmount.replace(',', '.')) || 0;
    return Math.max(0, received - total);
  }, [receivedCashAmount, total]);

  // Handlers
  const handleItemClick = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      setActiveItemForModal(item);
      setItemNote('');
      setSelectedOption(item.options[0].items[0]?.name || '');
      return;
    }

    addToCartOrTable(item, 1, '');
  };

  const addToCartOrTable = (item: MenuItem, qty: number, note: string, optionStr?: string) => {
    if (orderDestination === 'balcao') {
      const existingIdx = cartItems.findIndex(
        it => it.menuItemId === item.id && (it.notes || '') === (note || '') && (it.selectedOptions?.[0] || '') === (optionStr || '')
      );

      if (existingIdx >= 0) {
        setCartItems(prev => {
          const next = [...prev];
          next[existingIdx].quantity += qty;
          return next;
        });
      } else {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newIt: OrderItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty,
          notes: note || undefined,
          selectedOptions: optionStr ? [optionStr] : undefined,
          addedAt: timeStr,
          status: 'enviado_cozinha'
        };
        setCartItems(prev => [...prev, newIt]);
      }
      showToast('Item no Balcão', `+${qty}x ${item.name}`);
    } else {
      // Direct to table
      addItemToTable(orderDestination, item, qty, note, optionStr ? [optionStr] : undefined);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(it => {
      if (it.id === id) {
        const nextQty = it.quantity + delta;
        return nextQty > 0 ? { ...it, quantity: nextQty } : null;
      }
      return it;
    }).filter(Boolean) as OrderItem[]);
  };

  const removeCartItem = (id: string) => {
    setCartItems(prev => prev.filter(it => it.id !== id));
  };

  const handleFinishQuickSale = () => {
    if (cartItems.length === 0) {
      showToast('Pedido Vazio', 'Adicione pelo menos um item ao pedido.', 'warning');
      return;
    }

    const receivedNum = parseFloat(receivedCashAmount.replace(',', '.')) || total;

    const payments: PaymentRecord[] = [
      {
        method: paymentMethod,
        amount: total,
        receivedAmount: paymentMethod === 'dinheiro' ? receivedNum : total,
        change: paymentMethod === 'dinheiro' ? cashChange : 0,
      }
    ];

    finalizeQuickSale(cartItems, payments, customerName, discountAmount);

    // Reset state
    setCartItems([]);
    setCustomerName('');
    setIsCheckoutOpen(false);
    setReceivedCashAmount('');
    setDiscountAmount(0);
    setSplitCount(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Coluna Principal: Cardápio & Seleção Rápida */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Barra de Destino (Balcão vs Mesa) & Busca */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Seletor Balcão / Mesa */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lançar para:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setOrderDestination('balcao')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    orderDestination === 'balcao'
                      ? 'bg-[#0F2537] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Balcão Rápido
                </button>
                <select
                  value={orderDestination === 'balcao' ? '' : orderDestination}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrderDestination(val ? Number(val) : 'balcao');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer outline-hidden ${
                    orderDestination !== 'balcao'
                      ? 'bg-[#10B981] text-white font-extrabold shadow-sm'
                      : 'text-slate-600 bg-transparent'
                  }`}
                >
                  <option value="" className="text-slate-800">Escolher Mesa...</option>
                  {Array.from({ length: businessConfig.tableCount }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num} className="text-slate-800">
                      Mesa {num} {tableOrders[num] ? `(Ocupada - ${tableOrders[num]?.customerName})` : '(Livre)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar prato, bebida ou porção..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] outline-hidden"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Categorias Rápidas em Pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1E4B75] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos os Itens ({menuItems.filter(i => i.isActive).length})
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = menuItems.filter(i => i.categoryId === cat.id && i.isActive).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E4B75] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grade de Produtos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {filteredProducts.map((product) => {
              return (
                <button
                  key={product.id}
                  onClick={() => handleItemClick(product)}
                  className="bg-white border border-slate-200 hover:border-[#10B981] hover:shadow-md active:scale-98 rounded-2xl p-3 text-left transition-all flex flex-col justify-between h-36 relative group cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.unit}
                      </span>
                      {product.prepTimeMinutes && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {product.prepTimeMinutes}m
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xs text-[#0F2537] mt-1 leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-700">
                      {formatCurrency(product.price)}
                    </span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-[#10B981] group-hover:text-white flex items-center justify-center transition">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Comanda do Balcão / Mesa Ativa */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)]">
          {/* Cabeçalho da Comanda */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F2537] text-white flex items-center justify-center font-black text-xs">
                  {orderDestination === 'balcao' ? <ShoppingBag className="w-4 h-4" /> : `#${orderDestination}`}
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#0F2537]">
                    {orderDestination === 'balcao' ? 'Venda Balcão Rápido' : `Mesa ${orderDestination}`}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {orderDestination === 'balcao' ? 'Pedido para levar ou consumo no balcão' : 'Lançamento direto na comanda'}
                  </p>
                </div>
              </div>

              {orderDestination === 'balcao' && cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold p-1 cursor-pointer"
                  title="Limpar pedido"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Nome do Cliente (Opcional) */}
            {orderDestination === 'balcao' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Nome do cliente (opcional para chamar no balcão)"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Lista de Itens do Pedido */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {orderDestination === 'balcao' ? (
              cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">Nenhum item selecionado</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                    Clique nos pratos e bebidas ao lado para adicionar ao pedido.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#0F2537] truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{formatCurrency(item.price)} cada</span>
                        {item.notes && <span className="italic text-amber-700 font-medium">({item.notes})</span>}
                        {item.selectedOptions && <span className="text-blue-700 font-medium">({item.selectedOptions.join(', ')})</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="w-6 h-6 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center ml-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              // Mostra os itens já gravados na mesa selecionada
              <div className="space-y-2">
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                  Itens clicados ao lado entram direto na <strong>Mesa {orderDestination}</strong>!
                </div>
                {tableOrders[orderDestination]?.items.map((it) => (
                  <div key={it.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{it.name}</div>
                      <div className="text-[10px] text-slate-500">{it.quantity}x {formatCurrency(it.price)}</div>
                    </div>
                    <div className="font-black text-emerald-700">
                      {formatCurrency(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé de Fechamento / Divisão de Conta */}
          {orderDestination === 'balcao' && (
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 rounded-b-2xl space-y-3">
              {/* Divisor de Conta Rápido */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dividir Conta:</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSplitCount(num)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition cursor-pointer ${
                        splitCount === num
                          ? 'bg-[#1E4B75] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {splitCount > 1 && (
                <div className="flex justify-between items-center text-xs bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
                  <span>Por pessoa ({splitCount}x):</span>
                  <span>{formatCurrency(splitValue)}</span>
                </div>
              )}

              {/* Subtotal & Total */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#0F2537] pt-1 border-t border-slate-200">
                  <span>Total a Pagar:</span>
                  <span className="text-emerald-700">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Botão de Pagamento */}
              <button
                disabled={cartItems.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  cartItems.length > 0
                    ? 'bg-[#10B981] hover:bg-[#0ea571] text-white shadow-emerald-900/20 active:scale-98'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cobrar / Finalizar Pedido</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Observação / Opcional do Item */}
      {activeItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="font-bold text-base text-[#0F2537] mb-1">
              Personalizar: {activeItemForModal.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina o ponto da carne, acompanhamentos ou observações da cozinha.
            </p>

            {activeItemForModal.options?.map((opt, oIdx) => (
              <div key={oIdx} className="mb-4">
                <label className="text-xs font-bold text-slate-700 block mb-2">{opt.title}:</label>
                <div className="grid grid-cols-2 gap-2">
                  {opt.items.map((it, itIdx) => (
                    <button
                      key={itIdx}
                      type="button"
                      onClick={() => setSelectedOption(it.name)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer ${
                        selectedOption === it.name
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {it.name}
                      {it.additionalPrice > 0 && ` (+${formatCurrency(it.additionalPrice)})`}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Observação para a Cozinha (Dona Bete):
              </label>
              <input
                type="text"
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
                placeholder="Ex: Sem cebola, bem caprichado no feijão..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveItemForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCartOrTable(activeItemForModal, 1, itemNote, selectedOption);
                  setActiveItemForModal(null);
                }}
                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-bold shadow transition cursor-pointer"
              >
                Adicionar ao Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cobrança / Pagamento Ágil */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#0F2537]">Finalizar Cobrança</h3>
                <p className="text-xs text-slate-500">Escolha a forma de pagamento do cliente</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total a Pagar</span>
                <span className="text-xl font-black text-emerald-700">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Formas de Pagamento em Botões Grandes */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div>PIX Instantâneo</div>
                  <div className="text-[10px] text-emerald-700 font-medium">0% de taxa</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('dinheiro')}
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'dinheiro'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div className="text-left">
                  <div>Dinheiro / Moedas</div>
                  <div className="text-[10px] text-slate-500 font-medium">Calcula troco</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('debito')}
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'debito'
                    ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div>Cartão Débito</div>
                  <div className="text-[10px] text-slate-500 font-medium">Maquininha</div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('credito')}
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === 'credito'
                    ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div>Cartão Crédito</div>
                  <div className="text-[10px] text-slate-500 font-medium">À vista</div>
                </div>
              </button>
            </div>

            {/* Painel Específico para Dinheiro (Troco) */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Valor Recebido do Cliente:</label>
                  <span className="text-xs font-bold text-emerald-800">
                    Troco: {formatCurrency(cashChange)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="text"
                    value={receivedCashAmount}
                    onChange={e => setReceivedCashAmount(e.target.value)}
                    placeholder={total.toFixed(2)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-800 outline-hidden"
                  />
                </div>
                {/* Botões de Cédulas Rápidas */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[20, 50, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReceivedCashAmount(val.toString())}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      R$ {val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReceivedCashAmount(total.toFixed(2))}
                    className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold cursor-pointer ml-auto"
                  >
                    Exato ({formatCurrency(total)})
                  </button>
                </div>
              </div>
            )}

            {/* Painel Específico para PIX */}
            {paymentMethod === 'pix' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-4 text-center">
                <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl shadow-xs border border-emerald-200 flex items-center justify-center">
                  {/* Mock QR Code visual */}
                  <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <QrCode className="w-16 h-16 text-emerald-400" />
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-950 mt-2">Chave PIX: {businessConfig.phone}</div>
                <p className="text-[11px] text-emerald-800">
                  Mostre a tela ou a plaquinha para o cliente escanear e confirme o recebimento.
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleFinishQuickSale}
                className="px-6 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Recebimento e Emitir Cupom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
