import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { 
  Plus, 
  Search, 
  Eye, 
  Utensils, 
  Tag, 
  PauseCircle, 
  PlayCircle, 
  QrCode, 
  TrendingUp, 
  Edit3, 
  Trash2, 
  X, 
  Check,
  Smartphone
} from 'lucide-react';

export const CardapioScreen: React.FC = () => {
  const { 
    menuItems, 
    categories, 
    addMenuItem, 
    updateMenuItem, 
    toggleMenuItemActive, 
    ingredients, 
    businessConfig, 
    formatCurrency, 
    showToast 
  } = useApp();

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>(categories[0]?.id || 'cat-marmitas');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formCost, setFormCost] = useState<string>('');
  const [formUnit, setFormUnit] = useState<string>('prato');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formLinkedStockId, setFormLinkedStockId] = useState<string>('');

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = selectedCat === 'all' || item.categoryId === selectedCat;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCat, search]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(categories[0]?.id || 'cat-marmitas');
    setFormPrice('');
    setFormCost('');
    setFormUnit('prato');
    setFormDesc('');
    setFormLinkedStockId('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.categoryId);
    setFormPrice(item.price.toString());
    setFormCost(item.costPrice.toString());
    setFormUnit(item.unit);
    setFormDesc(item.description);
    setFormLinkedStockId(item.linkedStockId || '');
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice.replace(',', '.')) || 0;
    const costNum = parseFloat(formCost.replace(',', '.')) || (priceNum * 0.35);

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: formName,
        categoryId: formCategory,
        price: priceNum,
        costPrice: costNum,
        unit: formUnit,
        description: formDesc,
        linkedStockId: formLinkedStockId || undefined,
        stockTracked: !!formLinkedStockId
      });
    } else {
      addMenuItem({
        name: formName,
        categoryId: formCategory,
        price: priceNum,
        costPrice: costNum,
        unit: formUnit,
        description: formDesc,
        isActive: true,
        linkedStockId: formLinkedStockId || undefined,
        stockTracked: !!formLinkedStockId
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Header com Ações */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F2537]">Cardápio Digital & Preços</h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
              {menuItems.length} cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gerencie itens, preços, margem de contribuição e pause pratos esgotados com 1 toque.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCustomerPreviewOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-slate-600" />
            <span>Ver como o Cliente Vê</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Prato ou Bebida</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Categorias */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-[#1E4B75] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas as Categorias ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-[#1E4B75] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar prato ou ingrediente..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:border-[#1E4B75]"
          />
        </div>
      </div>

      {/* Grade de Itens do Cardápio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const cat = categories.find(c => c.id === item.categoryId);
          const marginPercent = item.price > 0 ? (((item.price - item.costPrice) / item.price) * 100).toFixed(0) : 0;
          const grossProfit = Math.max(0, item.price - item.costPrice);

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                item.isActive 
                  ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' 
                  : 'bg-slate-50/80 border-dashed border-slate-300 opacity-75'
              }`}
            >
              <div>
                {/* Topo: Categoria + Status Pausado */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {cat?.name || 'Geral'} • {item.unit}
                  </span>

                  <button
                    onClick={() => toggleMenuItemActive(item.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                      item.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-amber-100 hover:text-amber-800'
                        : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                    }`}
                    title={item.isActive ? 'Clique para pausar este item hoje' : 'Clique para reativar no cardápio'}
                  >
                    {item.isActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Disponível</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3 h-3" />
                        <span>Esgotado Hoje</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="font-extrabold text-sm text-[#0F2537] leading-snug">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              {/* Indicadores Financeiros da Ficha Técnica */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-xs py-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Venda</span>
                    <span className="font-black text-slate-900">{formatCurrency(item.price)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Custo</span>
                    <span className="font-bold text-slate-600">{formatCurrency(item.costPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Margem</span>
                    <span className="font-black text-emerald-700">{marginPercent}%</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Sobra no bolso: <strong className="text-emerald-700 font-black">{formatCurrency(grossProfit)}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Editar preço ou dados"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Adicionar / Editar Prato */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F2537]">
                {editingItem ? 'Editar Prato / Bebida' : 'Cadastrar Novo Item no Cardápio'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Item no Cardápio:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Marmitex Bife a Cavalo Especial"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unidade:</label>
                  <select
                    value={formUnit}
                    onChange={e => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                  >
                    <option value="prato">Prato</option>
                    <option value="marmita">Marmita</option>
                    <option value="porção">Porção</option>
                    <option value="garrafa">Garrafa</option>
                    <option value="lata">Lata</option>
                    <option value="copo">Copo / Dose</option>
                    <option value="fatia">Fatia / Pedaço</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preço de Venda (R$):</label>
                  <input
                    type="text"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="Ex: 28,00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:bg-white focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Custo Estimado (R$):</label>
                  <input
                    type="text"
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    placeholder="Ex: 9,80"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Apetitosa:</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Ex: Acompanha arroz, feijão caseiro soltinho, farofa de bacon e salada fresca."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Vincular ao Estoque (Para baixar cerveja/refrigerante automaticamente):
                </label>
                <select
                  value={formLinkedStockId}
                  onChange={e => setFormLinkedStockId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
                >
                  <option value="">Não vincular (prato feito na cozinha)</option>
                  {ingredients.filter(i => i.unit === 'un').map(i => (
                    <option key={i.id} value={i.id}>{i.name} (Atual: {i.currentStock} un)</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  Salvar no Cardápio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Prévia Cardápio Celular do Cliente */}
      {isCustomerPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[40px] p-4 shadow-2xl border-4 border-slate-700 max-w-sm w-full">
            {/* Notch do celular */}
            <div className="w-32 h-4 bg-slate-800 mx-auto rounded-full mb-3" />
            
            {/* Tela do Celular */}
            <div className="bg-[#F8FAFC] rounded-3xl overflow-hidden h-[540px] flex flex-col">
              {/* Header do Cardápio Web */}
              <div className="bg-[#0F2537] text-white p-4 text-center">
                <h4 className="font-extrabold text-sm tracking-tight">{businessConfig.name}</h4>
                <p className="text-[11px] text-emerald-400 mt-0.5">Cardápio Digital Oficial</p>
              </div>

              {/* Lista para o Cliente */}
              <div className="p-3 overflow-y-auto flex-1 space-y-2.5">
                {menuItems.filter(i => i.isActive).map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs text-[#0F2537]">{item.name}</div>
                      <div className="font-black text-xs text-emerald-700">{formatCurrency(item.price)}</div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* Botão Fechar Prévia */}
              <div className="p-3 bg-white border-t border-slate-200 text-center">
                <button
                  onClick={() => setIsCustomerPreviewOpen(false)}
                  className="w-full py-2 bg-[#0F2537] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar Prévia do Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
