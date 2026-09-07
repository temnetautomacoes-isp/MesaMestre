import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Ingredient, WasteLog } from '../../types';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  TrendingDown, 
  Truck, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Search, 
  X,
  Sparkles
} from 'lucide-react';

export const EstoqueScreen: React.FC = () => {
  const { 
    ingredients, 
    restockIngredient, 
    addIngredient, 
    wasteLogs, 
    registerWaste, 
    formatCurrency, 
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'todos' | 'alerta'>('todos');

  // Modals
  const [restockModalItem, setRestockModalItem] = useState<Ingredient | null>(null);
  const [restockQty, setRestockQty] = useState<string>('');
  const [restockTotalCost, setRestockTotalCost] = useState<string>('');

  const [isNewIngModalOpen, setIsNewIngModalOpen] = useState<boolean>(false);
  const [newIngName, setNewIngName] = useState<string>('');
  const [newIngUnit, setNewIngUnit] = useState<'kg' | 'g' | 'l' | 'ml' | 'un'>('kg');
  const [newIngCost, setNewIngCost] = useState<string>('');
  const [newIngCurrent, setNewIngCurrent] = useState<string>('');
  const [newIngMin, setNewIngMin] = useState<string>('');
  const [newIngSupplier, setNewIngSupplier] = useState<string>('');

  // Perda Modal
  const [isWasteModalOpen, setIsWasteModalOpen] = useState<boolean>(false);
  const [wasteItemName, setWasteItemName] = useState<string>('');
  const [wasteQty, setWasteQty] = useState<string>('');
  const [wasteUnit, setWasteUnit] = useState<string>('kg');
  const [wasteReason, setWasteReason] = useState<'queimou' | 'estragou_validade' | 'derramou_quebrou' | 'sobra_limpeza'>('queimou');
  const [wasteNotes, setWasteNotes] = useState<string>('');

  const filteredIngredients = ingredients.filter(ing => {
    const matchSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (ing.supplier || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchAlert = filterMode === 'todos' || ing.currentStock <= ing.minimumStock;
    return matchSearch && matchAlert;
  });

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minimumStock).length;
  const totalWasteMonth = wasteLogs.reduce((sum, w) => sum + w.estimatedCost, 0);

  const handleExecuteRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    const qty = parseFloat(restockQty.replace(',', '.')) || 0;
    const cost = restockTotalCost ? parseFloat(restockTotalCost.replace(',', '.')) : undefined;

    if (qty <= 0) {
      showToast('Quantidade Inválida', 'Digite uma quantidade maior que zero.', 'error');
      return;
    }

    restockIngredient(restockModalItem.id, qty, cost);
    setRestockModalItem(null);
    setRestockQty('');
    setRestockTotalCost('');
  };

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const unitCost = parseFloat(newIngCost.replace(',', '.')) || 0;
    const current = parseFloat(newIngCurrent.replace(',', '.')) || 0;
    const min = parseFloat(newIngMin.replace(',', '.')) || 0;

    addIngredient({
      name: newIngName,
      unit: newIngUnit,
      packageCost: unitCost,
      packageQuantity: 1,
      unitCost,
      currentStock: current,
      minimumStock: min,
      supplier: newIngSupplier,
      lastRestockedDate: 'Hoje'
    });

    setIsNewIngModalOpen(false);
    setNewIngName('');
    setNewIngCost('');
    setNewIngCurrent('');
    setNewIngMin('');
    setNewIngSupplier('');
  };

  const handleCreateWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(wasteQty.replace(',', '.')) || 0;
    if (qty <= 0) return;

    // Achar custo estimado
    const matchedIng = ingredients.find(i => i.name.toLowerCase().includes(wasteItemName.toLowerCase()));
    const estCost = matchedIng ? (matchedIng.unitCost * qty) : (qty * 10);

    registerWaste({
      itemName: wasteItemName,
      quantity: qty,
      unit: wasteUnit,
      estimatedCost: estCost,
      reason: wasteReason,
      notes: wasteNotes,
      registeredBy: 'Equipe'
    });

    setIsWasteModalOpen(false);
    setWasteItemName('');
    setWasteQty('');
    setWasteNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Header com Resumo */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2537]">
              Controle de Estoque & Alerta de Reposição
            </h1>
            {lowStockCount > 0 && (
              <span className="text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowStockCount} para comprar hoje!</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Baixa automática pelas vendas do PDV e avisos claros antes que o produto acabe no meio do movimento.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsWasteModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Flame className="w-4 h-4 text-rose-600" />
            <span>Registrar Perda / Queima</span>
          </button>
          <button
            onClick={() => setIsNewIngModalOpen(true)}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Insumo</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('todos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterMode === 'todos'
                ? 'bg-[#1E4B75] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos os Insumos ({ingredients.length})
          </button>
          <button
            onClick={() => setFilterMode('alerta')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'alerta'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Comprar Hoje ({lowStockCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou fornecedor..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:border-[#1E4B75]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tabela de Insumos */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Insumo / Fornecedor</th>
                  <th className="py-3 px-3">Estoque Atual</th>
                  <th className="py-3 px-3">Mínimo</th>
                  <th className="py-3 px-3">Custo Unitário</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIngredients.map((item) => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-400">{item.supplier || 'Sem fornecedor definido'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-black text-slate-900 text-sm">
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {item.minimumStock} {item.unit}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {formatCurrency(item.unitCost)} / {item.unit}
                      </td>
                      <td className="py-3 px-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Comprar Hoje!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Estoque Seguro
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockQty('');
                            setRestockTotalCost('');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Repor</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coluna Direita: Registro de Perdas & Desperdício */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Desperdício & Perdas
                </h3>
              </div>
              <span className="text-xs font-black text-rose-700">
                Total: {formatCurrency(totalWasteMonth)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Comida queimada na panela ou garrafa quebrada são prejuízos diretos no bolso. Registrar ajuda a equipe a ter mais cuidado.
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {wasteLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Nenhuma perda registrada. Ótimo trabalho da cozinha!
                </div>
              ) : (
                wasteLogs.map((w) => (
                  <div key={w.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">{w.itemName}</span>
                      <span className="font-black text-rose-700">{formatCurrency(w.estimatedCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{w.quantity} {w.unit} • Motivo: <strong className="capitalize">{w.reason.replace('_', ' ')}</strong></span>
                      <span>{w.date}</span>
                    </div>
                    {w.notes && (
                      <p className="text-[10px] italic text-slate-600">"{w.notes}"</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dica do Carlos */}
          <div className="bg-[#1E4B75] text-white rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Dica do Mestre: Fazer a Feira com Lista</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "Antes de ir ao Ceasa ou ligar para a distribuidora, olhe a aba 'Comprar Hoje'. Você compra apenas o que realmente precisa para os próximos 3 dias e o dinheiro fica no seu caixa em vez de estragar na geladeira!"
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Reposição / Entrada de Estoque */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F2537] mb-1">
              Dar Entrada: {restockModalItem.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Estoque atual: {restockModalItem.currentStock} {restockModalItem.unit}
            </p>

            <form onSubmit={handleExecuteRestock} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantidade Recebida ({restockModalItem.unit}):
                </label>
                <input
                  type="text"
                  required
                  value={restockQty}
                  onChange={e => setRestockQty(e.target.value)}
                  placeholder={`Ex: 10 (${restockModalItem.unit})`}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:bg-white focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Valor Total Pago na Nota/Fatura (Opcional):
                </label>
                <input
                  type="text"
                  value={restockTotalCost}
                  onChange={e => setRestockTotalCost(e.target.value)}
                  placeholder="Ex: 390,00 (recalcula custo unitário automaticamente)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  Confirmar Entrada no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cadastrar Insumo */}
      {isNewIngModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F2537] mb-1">
              Novo Insumo / Ingrediente
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cadastre carne, legume, óleo, embalagem ou produto final.
            </p>

            <form onSubmit={handleCreateIngredient} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Insumo:</label>
                <input
                  type="text"
                  required
                  value={newIngName}
                  onChange={e => setNewIngName(e.target.value)}
                  placeholder="Ex: Alcatra Bovina Limpa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unidade de Medida:</label>
                  <select
                    value={newIngUnit}
                    onChange={e => setNewIngUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="l">Litro (l)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="un">Unidade (un)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Custo Médio Unitário (R$):</label>
                  <input
                    type="text"
                    required
                    value={newIngCost}
                    onChange={e => setNewIngCost(e.target.value)}
                    placeholder="Ex: 38,50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estoque Inicial:</label>
                  <input
                    type="text"
                    value={newIngCurrent}
                    onChange={e => setNewIngCurrent(e.target.value)}
                    placeholder="Ex: 15"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estoque Mínimo (Alerta):</label>
                  <input
                    type="text"
                    value={newIngMin}
                    onChange={e => setNewIngMin(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fornecedor Habitual:</label>
                <input
                  type="text"
                  value={newIngSupplier}
                  onChange={e => setNewIngSupplier(e.target.value)}
                  placeholder="Ex: Frigorífico Boi Gordo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewIngModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Registro de Perda */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F2537] mb-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              <span>Registrar Perda / Queima de Insumo</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe o que foi perdido para dar baixa no estoque e calcular o custo.
            </p>

            <form onSubmit={handleCreateWaste} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Qual insumo foi perdido?</label>
                <select
                  value={wasteItemName}
                  onChange={e => setWasteItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                >
                  <option value="">Selecione o insumo...</option>
                  {ingredients.map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantidade:</label>
                  <input
                    type="text"
                    required
                    value={wasteQty}
                    onChange={e => setWasteQty(e.target.value)}
                    placeholder="Ex: 1.5"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Motivo Principal:</label>
                  <select
                    value={wasteReason}
                    onChange={e => setWasteReason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                  >
                    <option value="queimou">Queimou na Panela/Fritadeira</option>
                    <option value="estragou_validade">Estragou / Passou da Validade</option>
                    <option value="derramou_quebrou">Derramou / Quebrou</option>
                    <option value="sobra_limpeza">Sobra Excessiva / Desperdício</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observação do que aconteceu:</label>
                <input
                  type="text"
                  value={wasteNotes}
                  onChange={e => setWasteNotes(e.target.value)}
                  placeholder="Ex: Fritadeira aqueceu demais na troca de óleo..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  Registrar Perda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
