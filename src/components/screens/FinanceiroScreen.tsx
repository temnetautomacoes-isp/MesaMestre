import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialEntry, FinancialCategory } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Trash2,
  X 
} from 'lucide-react';

export const FinanceiroScreen: React.FC = () => {
  const { 
    financialEntries, 
    addFinancialEntry, 
    toggleFinancialStatus, 
    deleteFinancialEntry,
    salesHistory, 
    formatCurrency, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'a_pagar' | 'pagas' | 'todas'>('a_pagar');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formDueDate, setFormDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<FinancialCategory>('fornecedor_alimentos');
  const [formSupplier, setFormSupplier] = useState<string>('');

  // Cálculos Financeiros
  const totalSalesRevenue = useMemo(() => {
    return salesHistory.reduce((sum, ord) => sum + ord.total, 0);
  }, [salesHistory]);

  const totalExpensesPaid = useMemo(() => {
    return financialEntries
      .filter(e => e.type === 'despesa' && e.status === 'pago')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financialEntries]);

  const totalPendingExpenses = useMemo(() => {
    return financialEntries
      .filter(e => e.type === 'despesa' && e.status === 'pendente')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [financialEntries]);

  const netBalance = totalSalesRevenue - totalExpensesPaid;

  const filteredExpenses = useMemo(() => {
    return financialEntries.filter(exp => {
      if (exp.type !== 'despesa') return false;
      const matchStatus = activeTab === 'todas' || 
                         (activeTab === 'a_pagar' && exp.status === 'pendente') ||
                         (activeTab === 'pagas' && exp.status === 'pago');
      const matchCat = selectedCategory === 'todas' || exp.category === selectedCategory;
      return matchStatus && matchCat;
    });
  }, [financialEntries, activeTab, selectedCategory]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount.replace(',', '.')) || 0;
    if (amountNum <= 0) {
      showToast('Valor Inválido', 'Digite o valor da despesa.', 'error');
      return;
    }

    addFinancialEntry({
      description: formDescription,
      amount: amountNum,
      dueDate: formDueDate,
      category: formCategory,
      type: 'despesa',
      status: 'pendente',
      supplierOrCustomer: formSupplier
    });

    setIsAddModalOpen(false);
    setFormDescription('');
    setFormAmount('');
    setFormSupplier('');
  };

  const categoryLabels: Record<FinancialCategory, string> = {
    fornecedor_alimentos: 'Insumos & Carnes',
    fornecedor_bebidas: 'Bebidas & Distribuidora',
    energia_agua: 'Energia & Água',
    gas_cozinha: 'Gás de Cozinha',
    aluguel: 'Aluguel do Ponto',
    funcionarios: 'Equipe / Diárias',
    impostos_taxas: 'Impostos & Taxas',
    manutencao: 'Manutenção & Reparos',
    vendas_diarias: 'Vendas Diárias',
    outros: 'Outros'
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Cards de Resumo Financeiro no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Entradas / Vendas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Entradas Totais (Vendas)
            </span>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {formatCurrency(totalSalesRevenue)}
            </div>
            <span className="text-[11px] text-slate-500">{salesHistory.length} vendas registradas</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Despesas Pagas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Saídas Pagas
            </span>
            <div className="text-xl font-black text-rose-700 mt-1">
              {formatCurrency(totalExpensesPaid)}
            </div>
            <span className="text-[11px] text-slate-500">Boletos e contas quitadas</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* A Pagar / Pendente */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Boletos a Pagar
            </span>
            <div className="text-xl font-black text-amber-800 mt-1">
              {formatCurrency(totalPendingExpenses)}
            </div>
            <span className="text-[11px] text-slate-500">
              {financialEntries.filter(e => e.type === 'despesa' && e.status === 'pendente').length} contas pendentes
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Lucro Limpo Estimado */}
        <div className="bg-[#0F2537] text-white p-5 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Saldo Líquido
            </span>
            <div className="text-xl font-black text-white mt-1">
              {formatCurrency(netBalance)}
            </div>
            <span className="text-[11px] text-slate-300">Lucro real em caixa</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-[#10B981] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header com Ações */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0F2537]">
            Contas a Pagar & Livro Caixa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle simples para nunca mais esquecer o vencimento de um boleto ou pagar juros desnecessários.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Conta / Despesa</span>
        </button>
      </div>

      {/* Filtros por Status e Categoria */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('a_pagar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'a_pagar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A Pagar ({financialEntries.filter(e => e.type === 'despesa' && e.status === 'pendente').length})
          </button>
          <button
            onClick={() => setActiveTab('pagas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'pagas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pagas / Quitadas ({financialEntries.filter(e => e.type === 'despesa' && e.status === 'pago').length})
          </button>
          <button
            onClick={() => setActiveTab('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'todas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas as Despesas ({financialEntries.filter(e => e.type === 'despesa').length})
          </button>
        </div>

        {/* Categoria */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtrar por:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="todas">Todas as Categorias</option>
            <option value="fornecedor_alimentos">Insumos & Carnes</option>
            <option value="fornecedor_bebidas">Bebidas & Distribuidora</option>
            <option value="energia_agua">Energia & Água</option>
            <option value="gas_cozinha">Gás de Cozinha</option>
            <option value="aluguel">Aluguel do Ponto</option>
            <option value="funcionarios">Equipe / Diárias</option>
            <option value="impostos_taxas">Impostos & Taxas</option>
            <option value="manutencao">Manutenção</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            Nenhuma despesa encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((exp) => {
              const isPending = exp.status === 'pendente';

              return (
                <div
                  key={exp.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isPending ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#0F2537]">{exp.description}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {categoryLabels[exp.category] || exp.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>Favorecido: <strong className="text-slate-600">{exp.supplierOrCustomer || 'Não informado'}</strong></span>
                        <span>•</span>
                        <span>Vencimento: <strong className="text-slate-700">{exp.dueDate}</strong></span>
                        {exp.paidDate && <span>(Pago em {exp.paidDate})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Valor</span>
                      <span className="text-base font-black text-rose-700">
                        {formatCurrency(exp.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFinancialStatus(exp.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isPending 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isPending ? 'Dar Baixa (Pagar)' : 'Reabrir'}</span>
                      </button>

                      <button
                        onClick={() => deleteFinancialEntry(exp.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Adicionar Conta */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F2537]">
                Nova Despesa / Conta a Pagar
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição da Conta:</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Ex: Boleto Açougue Central (Carne da semana)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valor (R$):</label>
                  <input
                    type="text"
                    required
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    placeholder="Ex: 450,00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:bg-white focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Data de Vencimento:</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={e => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Categoria:</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
                >
                  <option value="fornecedor_alimentos">Insumos & Carnes</option>
                  <option value="fornecedor_bebidas">Bebidas & Distribuidora</option>
                  <option value="energia_agua">Energia & Água</option>
                  <option value="gas_cozinha">Gás de Cozinha</option>
                  <option value="aluguel">Aluguel do Ponto</option>
                  <option value="funcionarios">Equipe / Diárias</option>
                  <option value="impostos_taxas">Impostos / Taxas</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Favorecido / Fornecedor:</label>
                <input
                  type="text"
                  value={formSupplier}
                  onChange={e => setFormSupplier(e.target.value)}
                  placeholder="Ex: Frigorífico Boi Gordo Ltda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white"
                />
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
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
