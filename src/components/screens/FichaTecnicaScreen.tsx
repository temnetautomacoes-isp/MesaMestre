import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Recipe, RecipeItem } from '../../types';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Percent,
  Save
} from 'lucide-react';

export const FichaTecnicaScreen: React.FC = () => {
  const { menuItems, ingredients, recipes, updateRecipe, formatCurrency, showToast } = useApp();

  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(menuItems[0]?.id || '');
  
  // Active recipe for the selected menu item
  const existingRecipe = recipes.find(r => r.menuItemId === selectedMenuItemId);
  const selectedProduct = menuItems.find(m => m.id === selectedMenuItemId);

  // Local editing state
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeItem[]>(
    existingRecipe?.ingredients || []
  );
  const [wastePercent, setWastePercent] = useState<number>(existingRecipe?.wasteAllowancePercent || 10);
  const [laborEstimate, setLaborEstimate] = useState<number>(existingRecipe?.laborCostEstimate || 1.80);
  const [suggestedMarkup, setSuggestedMarkup] = useState<number>(existingRecipe?.suggestedMarkup || 2.8);

  // Sync state when product selector changes
  const handleSelectProduct = (prodId: string) => {
    setSelectedMenuItemId(prodId);
    const rec = recipes.find(r => r.menuItemId === prodId);
    if (rec) {
      setRecipeIngredients(rec.ingredients);
      setWastePercent(rec.wasteAllowancePercent);
      setLaborEstimate(rec.laborCostEstimate);
      setSuggestedMarkup(rec.suggestedMarkup);
    } else {
      // Default template
      setRecipeIngredients([]);
      setWastePercent(8);
      setLaborEstimate(1.50);
      setSuggestedMarkup(2.8);
    }
  };

  // Ingredient calculations
  const rawIngredientsCost = useMemo(() => {
    return recipeIngredients.reduce((sum, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return sum + (ing ? (ing.unitCost * item.quantityNeeded) : 0);
    }, 0);
  }, [recipeIngredients, ingredients]);

  const wasteCost = rawIngredientsCost * (wastePercent / 100);
  const totalCostPerPortion = rawIngredientsCost + wasteCost + laborEstimate;
  const currentSalePrice = selectedProduct?.price || 0;
  const grossProfit = Math.max(0, currentSalePrice - totalCostPerPortion);
  const grossMarginPercent = currentSalePrice > 0 ? ((grossProfit / currentSalePrice) * 100) : 0;
  const suggestedPriceByMarkup = totalCostPerPortion * suggestedMarkup;

  const handleAddIngredientRow = () => {
    const available = ingredients.find(ing => !recipeIngredients.some(ri => ri.ingredientId === ing.id));
    if (!available) {
      showToast('Aviso', 'Todos os insumos cadastrados já estão nesta ficha.', 'info');
      return;
    }
    setRecipeIngredients(prev => [...prev, { ingredientId: available.id, quantityNeeded: 0.1 }]);
  };

  const handleUpdateIngredientRow = (idx: number, ingredientId: string, quantityNeeded: number) => {
    setRecipeIngredients(prev => {
      const next = [...prev];
      next[idx] = { ingredientId, quantityNeeded };
      return next;
    });
  };

  const handleRemoveIngredientRow = (idx: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRecipe = () => {
    if (!selectedMenuItemId) return;

    const recipe: Recipe = {
      id: existingRecipe?.id || `rec-${Date.now()}`,
      menuItemId: selectedMenuItemId,
      ingredients: recipeIngredients,
      wasteAllowancePercent: wastePercent,
      laborCostEstimate: laborEstimate,
      suggestedMarkup
    };

    updateRecipe(recipe);
    showToast('Ficha Técnica Salva!', `Custo do prato atualizado para ${formatCurrency(totalCostPerPortion)}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ficha Técnica Descomplicada & CMV</span>
          </div>
          <h1 className="text-2xl font-black text-[#0F2537]">
            Saiba exatamente quanto custa cada prato
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Chega de chutar o preço do cardápio! Cadastre os insumos e descubra se o prato está dando lucro de verdade ou queimando seu dinheiro.
          </p>
        </div>

        {/* Seletor de Prato */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0 min-w-[260px]">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Escolher Prato / Marmita:
          </label>
          <select
            value={selectedMenuItemId}
            onChange={e => handleSelectProduct(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 outline-hidden focus:border-[#10B981]"
          >
            {menuItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} ({formatCurrency(item.price)})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Composição de Insumos */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#0F2537]">
                Ingredientes do Prato ({recipeIngredients.length})
              </h2>
              <p className="text-xs text-slate-400">
                Quanto de cada ingrediente vai em 1 porção
              </p>
            </div>
            <button
              onClick={handleAddIngredientRow}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Insumo</span>
            </button>
          </div>

          {recipeIngredients.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              Nenhum ingrediente adicionado à ficha técnica ainda.
              <div className="mt-2">
                <button
                  onClick={handleAddIngredientRow}
                  className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Adicionar Primeiro Insumo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recipeIngredients.map((item, idx) => {
                const ing = ingredients.find(i => i.id === item.ingredientId);
                const subCost = ing ? ing.unitCost * item.quantityNeeded : 0;

                return (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-6">
                      <select
                        value={item.ingredientId}
                        onChange={e => handleUpdateIngredientRow(idx, e.target.value, item.quantityNeeded)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                      >
                        {ingredients.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({formatCurrency(i.unitCost)} / {i.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantityNeeded}
                        onChange={e => handleUpdateIngredientRow(idx, item.ingredientId, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-center text-slate-800 outline-hidden"
                      />
                      <span className="text-[11px] font-bold text-slate-500 shrink-0">
                        {ing?.unit || 'un'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 text-right">
                      <span className="text-xs font-black text-emerald-800">
                        {formatCurrency(subCost)}
                      </span>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ajustes Adicionais: Perda & Mão de Obra */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Perda no Preparo / Cocção (%):
              </label>
              <p className="text-[10px] text-slate-400 mb-1.5">Apara de carne, casca de legumes, etc.</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={wastePercent}
                  onChange={e => setWastePercent(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-800 outline-hidden"
                />
                <span className="text-xs font-bold text-slate-600">% (+{formatCurrency(wasteCost)})</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Gás, Óleo & Embalagem por Porção (R$):
              </label>
              <p className="text-[10px] text-slate-400 mb-1.5">Custo indireto médio de produção</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={laborEstimate}
                  onChange={e => setLaborEstimate(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveRecipe}
              className="w-full py-3 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Ficha Técnica e Atualizar Custo do Prato</span>
            </button>
          </div>
        </div>

        {/* Coluna Direita: Semáforo de Lucro & Análise de Margem */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Resumo Financeiro do Prato */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Diagnóstico de Lucro
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-black ${
                grossMarginPercent >= 60
                  ? 'bg-emerald-100 text-emerald-800'
                  : grossMarginPercent >= 40
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {grossMarginPercent >= 60 && '🟢 Lucro Excelente'}
                {grossMarginPercent >= 40 && grossMarginPercent < 60 && '🟡 Lucro Médio'}
                {grossMarginPercent < 40 && '🔴 Perigo de Prejuízo'}
              </span>
            </div>

            {/* Números Principais */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Custo dos Ingredientes:</span>
                <span className="font-bold text-slate-800">{formatCurrency(rawIngredientsCost)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Perdas + Gás + Embalagem:</span>
                <span className="font-bold text-slate-800">{formatCurrency(wasteCost + laborEstimate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 text-sm font-black text-rose-700">
                <span>Custo Total por Porção (CMV):</span>
                <span>{formatCurrency(totalCostPerPortion)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 text-sm font-black text-slate-900">
                <span>Preço de Venda no Cardápio:</span>
                <span>{formatCurrency(currentSalePrice)}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-black text-emerald-700 bg-emerald-50 px-3 rounded-xl border border-emerald-200">
                <span>Sobra Limpa no Bolso:</span>
                <span>{formatCurrency(grossProfit)} ({grossMarginPercent.toFixed(0)}%)</span>
              </div>
            </div>

            {/* Markup Sugerido */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center font-bold text-slate-700">
                <span>Preço Recomendado (Markup {suggestedMarkup}x):</span>
                <span className="text-blue-900 font-black">{formatCurrency(suggestedPriceByMarkup)}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Restaurantes e marmitarias saudáveis costumam multiplicar o custo dos insumos por 2.8x a 3.2x para pagar aluguel, luz e ter lucro limpo.
              </p>
            </div>
          </div>

          {/* Dica do Seu Carlos */}
          <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Dica do Mestre sobre Precificação</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "Seu Carlos, nunca tenha medo de cobrar o preço justo. Cliente bom volta pelo sabor, pela porção farta e pelo atendimento carinhoso, não por R$ 2,00 a menos que te deixam sem dinheiro para pagar o fornecedor na segunda-feira!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
