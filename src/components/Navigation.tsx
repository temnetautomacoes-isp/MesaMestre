import React, { useState } from 'react';
import { useApp, ScreenId } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  ShoppingBag, 
  LayoutGrid, 
  Lock, 
  Utensils, 
  Calculator, 
  Package, 
  Wallet, 
  BarChart3, 
  Sparkles, 
  Settings, 
  LogOut, 
  AlertCircle,
  ChefHat,
  Cloud,
  CreditCard,
  ShieldCheck,
  ChevronDown,
  Building2,
  Zap
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    activeScreen, 
    setActiveScreen, 
    currentEnvironment,
    setCurrentEnvironment,
    businessConfig,
    currentCashSession,
    ingredients,
    formatCurrency
  } = useApp();

  const { 
    user, 
    profile, 
    currentCompany, 
    userCompanies, 
    subscription, 
    isSuperAdmin, 
    switchCompany, 
    signOut 
  } = useAuth();

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minimumStock).length;

  // Dias restantes de trial
  const calculateDaysRemaining = () => {
    if (!subscription?.trialEndsAt) return 0;
    const end = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };
  const daysLeft = calculateDaysRemaining();

  // 1. Abas do Ambiente "Caixa PDV" (Frente de Caixa & Salão)
  const pdvNavItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'pdv', label: 'PDV Balcão', icon: ShoppingBag },
    { id: 'mesas', label: 'Mesas & Salão', icon: LayoutGrid },
    { 
      id: 'caixa', 
      label: 'Caixa Cego', 
      icon: Lock, 
      badge: currentCashSession.isOpen ? 'Aberto' : 'Fechado',
      badgeColor: currentCashSession.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
    },
    { id: 'cardapio', label: 'Cardápio', icon: Utensils },
  ];

  // 2. Abas do Ambiente "Painel Administrador" (Gestão, Relatórios e Configurações)
  const adminNavItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'financeiro', label: 'Livro Caixa', icon: Wallet },
    { 
      id: 'estoque', 
      label: 'Estoque & Perdas', 
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} reposição` : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'ficha_tecnica', label: 'Ficha Técnica', icon: Calculator },
    { id: 'cardapio', label: 'Cardápio', icon: Utensils },
    { id: 'dicas', label: 'Dicas do Mestre', icon: Sparkles },
    { id: 'subscription', label: 'Minha Assinatura', icon: CreditCard, badge: subscription?.status === 'trial' ? `${daysLeft}d grátis` : undefined, badgeColor: 'bg-emerald-600' },
    { id: 'onboarding', label: 'Ajustes', icon: Settings },
  ];

  if (isSuperAdmin) {
    adminNavItems.push({
      id: 'admin',
      label: 'Super Admin',
      icon: ShieldCheck,
      badge: 'SaaS',
      badgeColor: 'bg-cyan-600'
    });
  }

  // Define as abas exibidas com base no ambiente ativo
  const navItems = currentEnvironment === 'pdv' ? pdvNavItems : adminNavItems;

  return (
    <header className="sticky top-0 z-30 bg-[#0F2537] text-white border-b border-[#1E4B75] shadow-md">
      
      {/* Banner de Aviso para Pagamento Pendente (past_due) */}
      {subscription?.status === 'past_due' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Aviso: Pagamento da assinatura pendente. Regularize seu plano para evitar a suspensão do acesso.</span>
            <button 
              onClick={() => setActiveScreen('subscription')}
              className="ml-auto underline hover:text-white font-extrabold cursor-pointer"
            >
              Verificar Plano
            </button>
          </div>
        </div>
      )}

      {/* Barra Superior de Identidade, Empresa & Operador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Logo & Seletor de Restaurante */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setActiveScreen('hub')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0E7490] flex items-center justify-center shadow-inner hover:scale-105 transition cursor-pointer"
            title="Ir para o Portal de Escolha de Ambiente"
          >
            <ChefHat className="w-6 h-6 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveScreen('hub')}
                className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1 hover:text-emerald-300 transition cursor-pointer"
                title="Ir para o Portal Inicial"
              >
                Mesa<span className="text-[#10B981]">Mestre</span>
              </button>

              {/* Status do Plano SaaS */}
              <button 
                onClick={() => setActiveScreen('subscription')}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase cursor-pointer transition ${
                  subscription?.status === 'trial' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                  subscription?.status === 'active' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                  'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
                title="Ver status da assinatura"
              >
                {subscription?.status === 'trial' ? `Trial • ${daysLeft} dias` : subscription?.plan || 'Ativo'}
              </button>
            </div>

            {/* Dropdown de Restaurantes se houver mais de uma empresa ou for Super Admin */}
            <div className="relative">
              {userCompanies.length > 1 || isSuperAdmin ? (
                <button
                  onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                  className="flex items-center gap-1 text-xs text-slate-300 font-medium hover:text-white transition cursor-pointer"
                >
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[180px] sm:max-w-xs">{currentCompany?.name || businessConfig.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              ) : (
                <p className="text-xs text-slate-300 font-medium truncate max-w-[220px] sm:max-w-xs">
                  {currentCompany?.name || businessConfig.name}
                </p>
              )}

              {/* Menu de Empresas */}
              {showCompanyMenu && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#0B1A28] border border-[#1E4B75] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 block">
                    Alternar Restaurante
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                    {userCompanies.map(comp => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          switchCompany(comp.id);
                          setShowCompanyMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                          currentCompany?.id === comp.id
                            ? 'bg-[#1E4B75] text-white font-bold'
                            : 'text-slate-300 hover:bg-[#132A40] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{comp.name}</span>
                        {currentCompany?.id === comp.id && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Caixa + Alertas + Alternar Ambiente / Início + Usuário / Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Botão de Alternar Ambiente (PDV <-> Admin) */}
          {currentEnvironment === 'pdv' ? (
            <button
              onClick={() => {
                setCurrentEnvironment('admin');
                setActiveScreen('relatorios');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E4B75]/70 hover:bg-[#1E4B75] text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer"
              title="Ir para o Painel Administrador"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Painel Admin</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentEnvironment('pdv');
                setActiveScreen('pdv');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
              title="Ir para o Caixa PDV"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Caixa PDV</span>
            </button>
          )}

          {/* Botão Início (Retornar ao Hub) */}
          <button
            onClick={() => setActiveScreen('hub')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B1A28] hover:bg-[#132A40] text-slate-300 hover:text-white border border-[#1E4B75] text-xs font-semibold transition cursor-pointer"
            title="Voltar para a tela inicial de seleção"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Início</span>
          </button>

          {/* Status Caixa */}
          <button 
            onClick={() => setActiveScreen('caixa')}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentCashSession.isOpen 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80' 
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80'
            }`}
            title="Clique para gerenciar o Caixa Cego, Suprimento e Sangria"
          >
            <span className={`w-2 h-2 rounded-full ${currentCashSession.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>{currentCashSession.isOpen ? `Caixa Aberto (${formatCurrency(currentCashSession.initialCash)})` : 'Caixa Fechado'}</span>
          </button>

          {/* Status Nuvem / Supabase */}
          <div 
            className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 cursor-default"
            title="Conectado e sincronizado com o Supabase Realtime"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Nuvem Online</span>
          </div>

          {/* Alerta de Estoque */}
          {lowStockCount > 0 && (
            <button 
              onClick={() => setActiveScreen('estoque')}
              className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80 flex items-center gap-1.5 cursor-pointer transition-all"
              title="Itens precisando de reposição urgente!"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{lowStockCount} reposições</span>
              <span className="sm:hidden">{lowStockCount}</span>
            </button>
          )}

          {/* Operador / Turno */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1E4B75]">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[11px] text-emerald-400 font-medium">{currentUser.tag}</div>
              </div>
              <button 
                onClick={() => setActiveScreen('login')}
                className="flex items-center gap-1.5 bg-[#1E4B75] hover:bg-[#255e94] text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                title="Trocar operador de turno"
              >
                <div className={`w-5 h-5 rounded-full ${currentUser.avatarColor} text-white text-[10px] font-bold flex items-center justify-center`}>
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">Turno</span>
              </button>
            </div>
          )}

          {/* Botão Sair da Conta SaaS */}
          {user && (
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition cursor-pointer"
              title="Sair da conta SaaS"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* Barra de Navegação dos Módulos */}
      <nav className="bg-[#0B1A28] border-t border-[#16334D] px-2 sm:px-6 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`relative px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#1E4B75] text-white shadow-sm font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-[#132A40]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#10B981]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full text-white font-bold ${item.badgeColor || 'bg-blue-600'}`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#10B981] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
