import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BlindCashCount } from '../../types';
import { 
  Lock, 
  Unlock, 
  Banknote, 
  Coins, 
  CreditCard, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const CaixaCegoScreen: React.FC = () => {
  const { 
    currentCashSession, 
    addCashMovement, 
    performBlindClose, 
    reopenCashSession, 
    businessConfig, 
    formatCurrency, 
    showToast 
  } = useApp();

  // Suprimento / Sangria Modal
  const [movementModalType, setMovementModalType] = useState<'suprimento' | 'sangria' | null>(null);
  const [movementAmount, setMovementAmount] = useState<string>('');
  const [movementReason, setMovementReason] = useState<string>('');

  // Fechamento Cego Form
  const [blindForm, setBlindForm] = useState<BlindCashCount>({
    countedCash: 0,
    countedCoins: 0,
    countedDebit: 0,
    countedCredit: 0,
    countedPix: 0,
    notes: ''
  });

  // Reabertura
  const [newInitialCash, setNewInitialCash] = useState<number>(businessConfig.initialCashDefault);

  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalType) return;
    const amountNum = parseFloat(movementAmount.replace(',', '.')) || 0;
    if (amountNum <= 0) {
      showToast('Valor Inválido', 'Insira um valor maior que zero.', 'error');
      return;
    }
    if (!movementReason.trim()) {
      showToast('Motivo Obrigatório', 'Explique o motivo para o controle do caixa.', 'warning');
      return;
    }

    addCashMovement(movementModalType, amountNum, movementReason);
    setMovementModalType(null);
    setMovementAmount('');
    setMovementReason('');
  };

  const handleExecuteBlindClose = (e: React.FormEvent) => {
    e.preventDefault();
    performBlindClose(blindForm);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6">
      {/* Banner de Boas-Vindas e Explicação Acolhedora do Caixa Cego */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2537] text-white flex items-center justify-center shrink-0 shadow-md">
            <Lock className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F2537]">
                Fechamento de Caixa Cego & Movimentações
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                currentCashSession.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentCashSession.isOpen ? 'Turno Aberto' : 'Turno Fechado'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              O operador conta as notas, moedas e comprovantes da gaveta <strong>sem ver os totais do sistema</strong>. Isso elimina erros, evita tentativas de "completar troco" e garante transparência absoluta entre equipe e proprietário.
            </p>
          </div>
        </div>

        {/* Botões de Sangria / Suprimento */}
        {currentCashSession.isOpen && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setMovementModalType('suprimento');
                setMovementAmount('');
                setMovementReason('');
              }}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              <span>+ Suprimento (Troco)</span>
            </button>
            <button
              onClick={() => {
                setMovementModalType('sangria');
                setMovementAmount('');
                setMovementReason('');
              }}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>- Sangria (Retirada)</span>
            </button>
          </div>
        )}
      </div>

      {currentCashSession.isOpen ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Informações do Turno & Movimentações */}
          <div className="lg:col-span-5 space-y-4">
            {/* Resumo do Turno Atual */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Dados do Turno Atual
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Operador Responsável:</span>
                  <span className="font-bold text-slate-800">{currentCashSession.operatorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Abertura:</span>
                  <span className="font-bold text-slate-800">{currentCashSession.openedAt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Troco Inicial Declarado:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(currentCashSession.initialCash)}</span>
                </div>
              </div>
            </div>

            {/* Histórico de Sangrias e Suprimentos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Movimentações da Gaveta</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {currentCashSession.movements.length} registros
                </span>
              </h3>

              {currentCashSession.movements.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Nenhuma sangria ou suprimento lançado hoje.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {currentCashSession.movements.map((mov) => (
                    <div
                      key={mov.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        mov.type === 'suprimento'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          mov.type === 'suprimento' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                        }`}>
                          {mov.type === 'suprimento' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold truncate">{mov.reason}</div>
                          <div className="text-[10px] opacity-75">{mov.timestamp} • {mov.operatorName}</div>
                        </div>
                      </div>
                      <div className="font-black shrink-0 text-sm">
                        {mov.type === 'suprimento' ? '+' : '-'}{formatCurrency(mov.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dica do Carlos */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
              <span className="font-bold block mb-1">Como fazer a sangria de forma correta:</span>
              "Tirou R$ 30,00 da gaveta para pagar o gás ou o saco de gelo que acabou? Registre na hora como Sangria. Assim, quando bater o caixa no final, ninguém fica caçando para onde foi o dinheiro!"
            </div>
          </div>

          {/* Coluna Direita: Formulário de Fechamento Cego */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0F2537]">
                  Contagem Cega de Encerramento de Turno
                </h2>
                <p className="text-xs text-slate-500">
                  O operador preenche os valores reais contados na mão
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteBlindClose} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cédulas */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cédulas em Dinheiro (R$)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Some todas as notas na gaveta</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={blindForm.countedCash || ''}
                    onChange={e => setBlindForm(prev => ({ ...prev, countedCash: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-[#10B981]"
                  />
                </div>

                {/* Moedas */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Moedas no Baleiro / Gaveta (R$)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Some moedas de 1 real, 50, 25 centavos</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={blindForm.countedCoins || ''}
                    onChange={e => setBlindForm(prev => ({ ...prev, countedCoins: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-[#10B981]"
                  />
                </div>

                {/* Cartão Débito */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Total em Débito (Maquininha)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Tire o relatório de fechamento na máquina</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={blindForm.countedDebit || ''}
                    onChange={e => setBlindForm(prev => ({ ...prev, countedDebit: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-blue-600"
                  />
                </div>

                {/* Cartão Crédito */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Total em Crédito (Maquininha)</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Relatório de vendas a crédito na máquina</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={blindForm.countedCredit || ''}
                    onChange={e => setBlindForm(prev => ({ ...prev, countedCredit: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-purple-600"
                  />
                </div>

                {/* PIX */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Total em PIX Conferido no Extrato</span>
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">Total de comprovantes PIX do turno</p>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={blindForm.countedPix || ''}
                    onChange={e => setBlindForm(prev => ({ ...prev, countedPix: parseFloat(e.target.value) || 0 }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Observações do Operador (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={blindForm.notes}
                  onChange={e => setBlindForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ex: Tudo conferido sem nenhuma ocorrência..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0F2537] hover:bg-[#1E4B75] text-white rounded-2xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  <span>Realizar Fechamento Cego e Gerar Auditoria</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* PAINEL DE AUDITORIA DO CARLOS / CAIXA FECHADO */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#0F2537]">
                  Auditoria do Gerente / Seu Carlos
                </h2>
                <p className="text-xs text-slate-500">
                  Fechado em: {currentCashSession.closedAt} por {currentCashSession.operatorName}
                </p>
              </div>
            </div>

            {/* Botão de Reabertura */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-500 font-semibold">Troco Novo Turno:</span>
                <input
                  type="number"
                  value={newInitialCash}
                  onChange={e => setNewInitialCash(Number(e.target.value))}
                  className="w-16 font-bold text-slate-800 bg-white border border-slate-300 rounded px-1 text-center"
                />
              </div>
              <button
                onClick={() => reopenCashSession(newInitialCash)}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Iniciar Novo Turno</span>
              </button>
            </div>
          </div>

          {/* Confronto: Contado vs Esperado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dinheiro & Moedas */}
            <div className="p-5 rounded-2xl border bg-slate-50 border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  Dinheiro na Gaveta
                </span>
                <span className="text-[11px] text-slate-400">Troco + Vendas</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Esperado pelo Sistema:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(currentCashSession.systemTotalsAtClose?.cashExpected || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Contado pelo Operador:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency((currentCashSession.blindClose?.countedCash || 0) + (currentCashSession.blindClose?.countedCoins || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">Diferença:</span>
                <span className={`font-black ${
                  (currentCashSession.discrepancies?.cashDiff || 0) === 0
                    ? 'text-emerald-700'
                    : (currentCashSession.discrepancies?.cashDiff || 0) > 0
                    ? 'text-blue-700'
                    : 'text-rose-700'
                }`}>
                  {(currentCashSession.discrepancies?.cashDiff || 0) === 0 && 'Perfeito (R$ 0,00)'}
                  {(currentCashSession.discrepancies?.cashDiff || 0) > 0 && `+${formatCurrency(currentCashSession.discrepancies!.cashDiff)} (Sobrou)`}
                  {(currentCashSession.discrepancies?.cashDiff || 0) < 0 && `${formatCurrency(currentCashSession.discrepancies!.cashDiff)} (Falta)`}
                </span>
              </div>
            </div>

            {/* PIX */}
            <div className="p-5 rounded-2xl border bg-slate-50 border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  PIX
                </span>
                <span className="text-[11px] text-slate-400">Conta Bancária</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Esperado pelo Sistema:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(currentCashSession.systemTotalsAtClose?.pixExpected || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Informado pelo Operador:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(currentCashSession.blindClose?.countedPix || 0)}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">Diferença:</span>
                <span className="font-black text-emerald-700">
                  {formatCurrency(currentCashSession.discrepancies?.pixDiff || 0)}
                </span>
              </div>
            </div>

            {/* Cartões (Débito + Crédito) */}
            <div className="p-5 rounded-2xl border bg-slate-50 border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  Cartões (Maquininhas)
                </span>
                <span className="text-[11px] text-slate-400">Débito + Crédito</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Esperado pelo Sistema:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency((currentCashSession.systemTotalsAtClose?.debitExpected || 0) + (currentCashSession.systemTotalsAtClose?.creditExpected || 0))}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Relatório da Máquina:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency((currentCashSession.blindClose?.countedDebit || 0) + (currentCashSession.blindClose?.countedCredit || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-700">Diferença:</span>
                <span className="font-black text-emerald-700">
                  {formatCurrency(currentCashSession.discrepancies?.cardDiff || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Veredito Amigável do Mestre */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <span className="font-bold block">Conferência Aprovada!</span>
              Tudo foi registrado com sucesso. Os dados já foram consolidados no Livro Caixa e nos Relatórios de Vendas do Carlos.
            </div>
          </div>
        </div>
      )}

      {/* Modal de Suprimento / Sangria */}
      {movementModalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0F2537] mb-1 flex items-center gap-2">
              {movementModalType === 'suprimento' ? (
                <>
                  <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                  <span>Registrar Suprimento (Entrada de Troco)</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 text-rose-600" />
                  <span>Registrar Sangria (Retirada de Dinheiro)</span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {movementModalType === 'suprimento' 
                ? 'Adicionar moedas ou notas de reforço para troco.' 
                : 'Retirar dinheiro da gaveta para despesas rápidas de emergência.'}
            </p>

            <form onSubmit={handleRegisterMovement} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valor em Reais (R$):</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="text"
                    required
                    value={movementAmount}
                    onChange={e => setMovementAmount(e.target.value)}
                    placeholder="Ex: 50,00"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motivo / Justificativa:
                </label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  placeholder={movementModalType === 'suprimento' ? 'Ex: Troco de moedas de R$ 1,00' : 'Ex: Compra de 2 sacos de gelo na distribuidora'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMovementModalType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer ${
                    movementModalType === 'suprimento'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Salvar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
