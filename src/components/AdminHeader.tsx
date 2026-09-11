import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Home,
  ShoppingBag,
  Cloud,
  AlertCircle,
  BarChart3,
  Wallet,
  Package,
  Calculator,
  Utensils,
  Sparkles,
  CreditCard,
  Settings,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeScreen,
    setActiveScreen,
    setCurrentEnvironment,
    currentCashSession,
    ingredients,
    formatCurrency,
    businessConfig
  } = useApp();

  const { subscription, currentCompany } = useAuth();

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minimumStock).length;

  const screenTitles: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
    relatorios: { title: 'Relatórios & Métricas', subtitle: 'Desempenho de vendas e faturamento', icon: BarChart3 },
    financeiro: { title: 'Livro Caixa & Finanças', subtitle: 'Fluxo de caixa, entradas e saídas', icon: Wallet },
    estoque: { title: 'Estoque & Perdas', subtitle: 'Controle de insumos e reposição', icon: Package },
    ficha_tecnica: { title: 'Ficha Técnica & CMV', subtitle: 'Custos de produção e margens de lucro', icon: Calculator },
    cardapio: { title: 'Cardápio Digital', subtitle: 'Gestão de categorias e itens do cardápio', icon: Utensils },
    dicas: { title: 'Dicas do Mestre', subtitle: 'Recomendações estratégicas para o seu restaurante', icon: Sparkles },
    subscription: { title: 'Minha Assinatura', subtitle: 'Gerencie seu plano e recursos', icon: CreditCard },
    onboarding: { title: 'Ajustes da Empresa', subtitle: 'Configurações de mesas, taxas e contatos', icon: Settings },
    admin: { title: 'Super Admin', subtitle: 'Gestão global da plataforma SaaS', icon: ShieldCheck }
  };

  const currentInfo = screenTitles[activeScreen] || {
    title: 'Painel Administrador',
    subtitle: 'Gestão integrada do restaurante',
    icon: Settings
  };

  const ScreenIcon = currentInfo.icon;

  return (
    <header className="sticky top-0 z-30 bg-[#0F2537] text-white border-b border-[#1E4B75] shadow-md">
      {/* Banner de Aviso para Pagamento Pendente (past_due) */}
      {subscription?.status === 'past_due' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Aviso: Pagamento da assinatura pendente. Regularize seu plano para evitar a suspensão.</span>
            <button
              onClick={() => setActiveScreen('subscription')}
              className="ml-auto underline hover:text-white font-extrabold cursor-pointer"
            >
              Verificar Plano
            </button>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Botão Hamburger (mobile) + Título da Tela Ativa */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-[#0B1A28] hover:bg-[#132A40] text-slate-300 hover:text-white border border-[#1E4B75] lg:hidden transition cursor-pointer"
            title="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex w-9 h-9 rounded-xl bg-[#1E4B75] items-center justify-center text-emerald-400">
              <ScreenIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight flex items-center gap-2">
                <span>{currentInfo.title}</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block leading-none mt-0.5">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Status Caixa + Nuvem + Alerta Estoque + Ir ao PDV */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Status Caixa */}
          <button
            type="button"
            onClick={() => {
              setCurrentEnvironment('pdv');
              setActiveScreen('caixa');
            }}
            className={`text-xs px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              currentCashSession.isOpen
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80'
            }`}
            title="Clique para gerenciar o Caixa Cego"
          >
            <span className={`w-2 h-2 rounded-full ${currentCashSession.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="hidden sm:inline">
              {currentCashSession.isOpen ? `Caixa Aberto (${formatCurrency(currentCashSession.initialCash)})` : 'Caixa Fechado'}
            </span>
            <span className="sm:hidden">
              {currentCashSession.isOpen ? 'Caixa Aberto' : 'Fechado'}
            </span>
          </button>

          {/* Nuvem Online */}
          <div
            className="text-xs px-2.5 py-1.5 rounded-xl font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 hidden md:flex items-center gap-1.5 cursor-default"
            title="Conectado e sincronizado com a Nuvem Realtime"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nuvem</span>
          </div>

          {/* Alerta de Estoque */}
          {lowStockCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveScreen('estoque')}
              className="text-xs px-2.5 py-1.5 rounded-xl font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80 flex items-center gap-1.5 cursor-pointer transition"
              title="Itens com estoque baixo precisando de reposição"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{lowStockCount}</span>
            </button>
          )}

          {/* Botão Ir ao PDV */}
          <button
            type="button"
            onClick={() => {
              setCurrentEnvironment('pdv');
              setActiveScreen('pdv');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-900/30"
            title="Ir para o Caixa PDV"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Ir ao PDV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
