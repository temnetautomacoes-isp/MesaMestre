import React, { useState } from 'react';
import { useApp, ScreenId } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Wallet,
  Package,
  Calculator,
  Utensils,
  Sparkles,
  CreditCard,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Home,
  LogOut,
  ChevronDown,
  Building2,
  ChefHat,
  X,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

/**
 * Extrai até 2 iniciais do nome do restaurante
 */
const getCompanyInitials = (name: string): string => {
  if (!name) return 'MM';
  const cleanName = name.trim().replace(/^(o|a|os|as|do|da|dos|das|de)\s+/i, '');
  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    activeScreen,
    setActiveScreen,
    setCurrentEnvironment,
    businessConfig,
    ingredients,
    currentUser
  } = useApp();

  const {
    user,
    currentCompany,
    userCompanies,
    subscription,
    isSuperAdmin,
    switchCompany,
    signOut
  } = useAuth();

  const [showCompanyMenu, setShowCompanyMenu] = useState(false);

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minimumStock).length;

  const calculateDaysRemaining = () => {
    if (!subscription?.trialEndsAt) return 0;
    const end = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };
  const daysLeft = calculateDaysRemaining();

  const navItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'financeiro', label: 'Livro Caixa', icon: Wallet },
    {
      id: 'estoque',
      label: 'Estoque & Perdas',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'ficha_tecnica', label: 'Ficha Técnica', icon: Calculator },
    { id: 'cardapio', label: 'Cardápio', icon: Utensils },
    { id: 'dicas', label: 'Dicas do Mestre', icon: Sparkles },
    {
      id: 'subscription',
      label: 'Minha Assinatura',
      icon: CreditCard,
      badge: subscription?.status === 'trial' ? `${daysLeft}d` : undefined,
      badgeColor: 'bg-emerald-600'
    },
    { id: 'onboarding', label: 'Ajustes', icon: Settings },
  ];

  if (isSuperAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Super Admin',
      icon: ShieldCheck,
      badge: 'SaaS',
      badgeColor: 'bg-cyan-600'
    });
  }

  const handleNavClick = (screenId: ScreenId) => {
    setActiveScreen(screenId);
    setIsMobileOpen(false);
  };

  const handleGoToPdv = () => {
    setCurrentEnvironment('pdv');
    setActiveScreen('pdv');
    setIsMobileOpen(false);
  };

  const handleGoToHub = () => {
    setActiveScreen('hub');
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Backdrop para mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Container Lateral (Sidebar) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1A28] border-r border-[#1E4B75] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header da Sidebar: Logo & Fechar Mobile */}
        <div className="p-4 border-b border-[#1E4B75] flex items-center justify-between">
          <button
            type="button"
            onClick={handleGoToHub}
            className="flex items-center gap-2.5 text-left hover:opacity-90 transition cursor-pointer"
            title="Voltar ao Início"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center shadow-inner">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white leading-none block">
                Mesa<span className="text-[#10B981]">Mestre</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">
                Painel Admin
              </span>
            </div>
          </button>

          {/* Botão Fechar no Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132A40] lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identificação do Restaurante & Alternância */}
        <div className="px-3.5 py-3 border-b border-[#1E4B75]/70 bg-[#0F2537]/50">
          <div className="relative">
            {(() => {
              const companyName = businessConfig?.name || currentCompany?.name || 'Seu Restaurante';
              const logoUrl = businessConfig?.logoUrl || (currentCompany as any)?.logoUrl;
              const companyInitials = getCompanyInitials(companyName);

              return userCompanies.length > 1 || isSuperAdmin ? (
                <button
                  type="button"
                  onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0F2537] hover:bg-[#132A40] border border-[#1E4B75] text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={companyName}
                        className="w-8 h-8 rounded-lg object-cover border border-[#1E4B75] shrink-0 bg-white/10"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center font-extrabold text-white text-[11px] tracking-wider shadow-sm border border-emerald-400/40 shrink-0"
                        title={companyName}
                      >
                        {companyInitials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {companyName}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        {subscription?.status === 'trial' ? `Trial (${daysLeft}d restantes)` : 'Plano Ativo'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-[#0F2537] border border-[#1E4B75] flex items-center gap-2.5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={companyName}
                      className="w-8 h-8 rounded-lg object-cover border border-[#1E4B75] shrink-0 bg-white/10"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center font-extrabold text-white text-[11px] tracking-wider shadow-sm border border-emerald-400/40 shrink-0"
                      title={companyName}
                    >
                      {companyInitials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {companyName}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium">
                      {subscription?.status === 'trial' ? `Trial (${daysLeft}d restantes)` : 'Plano Ativo'}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Menu Dropdown de Empresas */}
            {showCompanyMenu && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#0F2537] border border-[#1E4B75] rounded-xl p-1.5 shadow-2xl z-50 animate-in fade-in">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Alternar Restaurante
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                  {userCompanies.map(comp => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => {
                        switchCompany(comp.id);
                        setShowCompanyMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
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

        {/* Lista de Navegação Principal */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
            Menu de Gestão
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E4B75] text-white shadow-md shadow-black/20 font-bold border-l-4 border-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-[#132A40]/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#10B981]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-extrabold ${item.badgeColor || 'bg-emerald-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Atalho para o Caixa PDV */}
          <div className="pt-3 mt-3 border-t border-[#1E4B75]/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
              Atalhos Rápidos
            </span>
            <button
              type="button"
              onClick={handleGoToPdv}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 transition cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Ir para Caixa PDV</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Frente</span>
            </button>
          </div>
        </div>

        {/* Rodapé da Sidebar: Usuário / Início / Logout */}
        <div className="p-3 border-t border-[#1E4B75] bg-[#091522] space-y-2">
          {/* Operador de Turno */}
          {currentUser && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#0F2537] border border-[#1E4B75]/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-full ${currentUser.avatarColor} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5 leading-none">{currentUser.tag}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveScreen('login');
                  setIsMobileOpen(false);
                }}
                className="text-[11px] text-slate-300 hover:text-white bg-[#1E4B75] hover:bg-[#255e94] px-2 py-1 rounded-lg font-semibold transition cursor-pointer"
                title="Trocar operador de turno"
              >
                Turno
              </button>
            </div>
          )}

          {/* Botões de Ação Inferior */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoToHub}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F2537] hover:bg-[#132A40] text-slate-300 hover:text-white border border-[#1E4B75] text-xs font-bold transition cursor-pointer"
              title="Voltar para a tela inicial de escolha"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Início</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
