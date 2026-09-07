import React from 'react';
import { useApp, ScreenId } from '../context/AppContext';
import { 
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
  Cloud
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    activeScreen, 
    setActiveScreen, 
    businessConfig,
    currentCashSession,
    ingredients,
    formatCurrency
  } = useApp();

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minimumStock).length;

  const navItems: { id: ScreenId; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
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
    { id: 'ficha_tecnica', label: 'Ficha Técnica', icon: Calculator },
    { 
      id: 'estoque', 
      label: 'Estoque & Perdas', 
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} reposição` : undefined,
      badgeColor: 'bg-amber-500'
    },
    { id: 'financeiro', label: 'Livro Caixa', icon: Wallet },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'dicas', label: 'Dicas do Mestre', icon: Sparkles },
    { id: 'onboarding', label: 'Ajustes', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0F2537] text-white border-b border-[#1E4B75] shadow-md">
      {/* Barra Superior de Identidade & Operador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Nome do Restaurante */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0E7490] flex items-center justify-center shadow-inner">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Mesa<span className="text-[#10B981]">Mestre</span>
              </span>
              <span className="text-xs bg-[#1E4B75] text-slate-200 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                {businessConfig.type === 'restaurante_caseiro' && 'Restaurante Caseiro'}
                {businessConfig.type === 'boteco_bar' && 'Boteco & Bar'}
                {businessConfig.type === 'marmitaria' && 'Marmitaria'}
                {businessConfig.type === 'pizzaria' && 'Pizzaria'}
                {businessConfig.type === 'lanchonete' && 'Lanchonete'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate max-w-[220px] sm:max-w-xs">
              {businessConfig.name}
            </p>
          </div>
        </div>

        {/* Status Caixa + Alertas + Usuário Ativo */}
        <div className="flex items-center gap-3">
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
            title="Conectado e sincronizado com o Supabase"
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

          {/* Operador / Usuário */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#1E4B75]">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                <div className="text-[11px] text-emerald-400 font-medium">{currentUser.tag}</div>
              </div>
              <button 
                onClick={() => setActiveScreen('login')}
                className="flex items-center gap-1.5 bg-[#1E4B75] hover:bg-[#255e94] text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                title="Trocar de operador ou bloquear tela"
              >
                <div className={`w-5 h-5 rounded-full ${currentUser.avatarColor} text-white text-[10px] font-bold flex items-center justify-center`}>
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline">Trocar</span>
                <LogOut className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveScreen('login')}
              className="bg-[#10B981] hover:bg-[#0ea571] text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Barra de Navegação dos 11 Módulos */}
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
