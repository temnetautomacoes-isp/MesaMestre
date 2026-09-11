import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  AlertCircle,
  BarChart3,
  Wallet,
  Package,
  Calculator,
  Utensils,
  Sparkles,
  CreditCard,
  Settings,
  ShieldCheck
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeScreen,
    setActiveScreen
  } = useApp();

  const { subscription } = useAuth();

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

        {/* Lado Direito Limpo (Sem botões extras de PDV/Caixa/Nuvem/Alerta no Painel Admin) */}
      </div>
    </header>
  );
};
