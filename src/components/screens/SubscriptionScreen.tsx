import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  AlertCircle,
  HelpCircle,
  Zap,
  Building2,
  Lock
} from 'lucide-react';

export const SubscriptionScreen: React.FC = () => {
  const { currentCompany, subscription, refreshCompanyData } = useAuth();
  const { showToast } = useApp();
  const [showPlansModal, setShowPlansModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'inicial' | 'essencial' | 'gestao'>(subscription?.plan || 'inicial');

  const plans = [
    {
      id: 'inicial' as const,
      name: 'Plano Inicial',
      price: 'R$ 59,90',
      period: '/mês',
      description: 'Perfeito para marmitarias, lanchonetes e pequenos bares iniciando o controle digital.',
      badge: 'Mais Popular',
      features: [
        'PDV Balcão & Venda Rápida',
        'Gestão de até 15 Mesas',
        'Controle de Caixa Cego com Sangria/Suprimento',
        'Cardápio Digital Interativo',
        'Até 2 Usuários Simultâneos',
        'Suporte por WhatsApp'
      ]
    },
    {
      id: 'essencial' as const,
      name: 'Plano Essencial',
      price: 'R$ 99,90',
      period: '/mês',
      description: 'Ideal para restaurantes e botecos em crescimento que precisam de controle de insumos e perdas.',
      badge: 'Recomendado',
      features: [
        'Tudo do Plano Inicial',
        'Mesas e Comandas Ilimitadas',
        'Estoque Completo com Alerta de Reposição',
        'Ficha Técnica com Cálculo Automático de Custo',
        'Controle de Perdas e Desperdício',
        'Até 5 Usuários Simultâneos (Garçom, Cozinha, Caixa)'
      ]
    },
    {
      id: 'gestao' as const,
      name: 'Plano Gestão Total',
      price: 'R$ 149,90',
      period: '/mês',
      description: 'Para estabelecimentos consolidados que exigem relatórios de DRE, Dicas do Mestre e controle financeiro completo.',
      badge: 'Mais Completo',
      features: [
        'Tudo do Plano Essencial',
        'Livro Caixa & DRE Financeiro',
        'Relatórios de Lucratividade & Curva ABC',
        'Dicas do Mestre com Auditoria Operacional',
        'Usuários e Garçons Ilimitados',
        'Atendimento Prioritário VIP'
      ]
    }
  ];

  // Cálculo de dias de teste restantes
  const calculateDaysRemaining = () => {
    if (!subscription?.trialEndsAt) return 0;
    const end = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const daysLeft = calculateDaysRemaining();

  const handlePlanSelect = (planId: 'inicial' | 'essencial' | 'gestao') => {
    setSelectedPlan(planId);
    showToast(
      'Plano Selecionado',
      `Você selecionou o plano ${planId.toUpperCase()}. O checkout seguro do Mercado Pago estará disponível em breve!`
    );
    setShowPlansModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Banner de Status */}
      <div className="bg-gradient-to-r from-[#0F2537] to-[#1E4B75] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#1E4B75] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {subscription?.status === 'trial' && 'Período de Teste Grátis (7 Dias)'}
                {subscription?.status === 'active' && 'Assinatura Ativa'}
                {subscription?.status === 'past_due' && 'Pagamento Pendente'}
                {subscription?.status === 'suspended' && 'Conta Suspensa'}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {currentCompany?.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Plano Atual: <span className="text-emerald-400 capitalize">{subscription?.plan || 'Inicial'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {subscription?.status === 'trial' && (
                <>Seu período de avaliação gratuita está ativo. Você tem <strong>{daysLeft} dias restantes</strong> para aproveitar todos os recursos.</>
              )}
              {subscription?.status === 'active' && (
                <>Sua assinatura está em dia! Todos os módulos do seu restaurante estão liberados.</>
              )}
              {subscription?.status === 'past_due' && (
                <>Houve uma pendência na renovação da assinatura. Por favor, regularize para manter o acesso contínuo.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPlansModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Ver e Mudar de Plano</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Planos do MesaMestre */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Escolha o plano ideal para a sua operação</h2>
          <p className="text-xs text-slate-500">Sem taxa de instalação, sem fidelidade e com suporte humanizado em português.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((p) => {
            const isCurrent = subscription?.plan === p.id;
            return (
              <div 
                key={p.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between relative shadow-sm ${
                  isCurrent 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {p.badge && (
                  <span className={`absolute -top-3 right-6 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full text-white ${
                    p.id === 'essencial' ? 'bg-emerald-600' : 'bg-[#1E4B75]'
                  }`}>
                    {p.badge}
                  </span>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 my-4 pb-4 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-500 font-medium">{p.period}</span>
                  </div>

                  <ul className="space-y-2.5 my-6">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handlePlanSelect(p.id)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-[#1E4B75] hover:bg-[#153655] text-white shadow-md'
                    }`}
                  >
                    {isCurrent ? 'Plano Atual' : 'Escolher este Plano'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção de Informações de Faturamento & Integração Mercado Pago */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Formas de Pagamento</h4>
            <p className="text-xs text-slate-500 mt-0.5">Pix com ativação instantânea ou Cartão de Crédito via Mercado Pago.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Segurança & Privacidade</h4>
            <p className="text-xs text-slate-500 mt-0.5">Dados criptografados e isolamento de banco de dados exclusivo por restaurante.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Dúvidas sobre o plano?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Fale diretamente com nossa equipe de especialistas pelo WhatsApp de suporte.</p>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação / Ver Planos */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-slate-900">Troca de Plano do MesaMestre</h3>
              </div>
              <button 
                onClick={() => setShowPlansModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você pode alterar o plano do seu restaurante a qualquer momento. A cobrança é proporcional e você mantém todo o seu histórico de vendas, produtos e clientes intactos.
            </p>

            <div className="space-y-2">
              {plans.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handlePlanSelect(p.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedPlan === p.id 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                    <p className="text-[11px] text-slate-500">{p.price} {p.period}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Selecionar</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowPlansModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
