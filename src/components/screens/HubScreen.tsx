import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  LogOut, 
  ShoppingBag, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck
} from 'lucide-react';

/**
 * Função utilitária para extrair até 2 letras iniciais do nome da empresa
 * Exemplo: "Restaurante Sabor & Cia" -> "RS", "MesaMestre" -> "MM"
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

export const HubScreen: React.FC = () => {
  const { currentCompany, user, profile, subscription, isSuperAdmin, signOut } = useAuth();
  const { businessConfig, setActiveScreen, setCurrentEnvironment } = useApp();

  const companyName = businessConfig?.name || currentCompany?.name || 'Seu Restaurante';
  const logoUrl = businessConfig?.logoUrl || (currentCompany as any)?.logoUrl;
  const companyInitials = getCompanyInitials(companyName);

  return (
    <div className="min-h-screen bg-[#0B1A28] text-white flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Luzes de Fundo Ambientais (Background Glows) */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ============================================================ */}
      {/* BARRA SUPERIOR: Botão Sair (Vermelho Pequeno) + Logo/Iniciais + Nome */}
      {/* ============================================================ */}
      <header className="relative z-20 w-full border-b border-[#1E4B75]/70 bg-[#0F2537]/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LADO ESQUERDO: Botão Sair + Identidade da Empresa */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Botão Vermelho Pequeno "Sair" */}
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-rose-900/50 border border-rose-500 transition cursor-pointer"
              title="Deslogar da plataforma MesaMestre"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>

            {/* Divisor Vertical Suave */}
            <div className="h-6 w-px bg-[#1E4B75]" />

            {/* Logo da Empresa ou Iniciais do Nome */}
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="w-9 h-9 rounded-xl object-cover border border-[#1E4B75] shadow-sm"
                />
              ) : (
                <div 
                  className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center font-extrabold text-white text-xs tracking-wider shadow-md border border-emerald-400/40"
                  title={companyName}
                >
                  {companyInitials}
                </div>
              )}

              {/* Nome da Empresa */}
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight line-clamp-1 max-w-[200px] sm:max-w-xs md:max-w-md">
                  {companyName}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Estabelecimento Conectado
                </span>
              </div>
            </div>

          </div>

          {/* LADO DIREITO: Identificador do Usuário / Assinatura */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {isSuperAdmin && (
              <button
                onClick={() => setActiveScreen('admin')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-bold hover:bg-cyan-900 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Super Admin</span>
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#1E4B75]">
              <div className="w-7 h-7 rounded-lg bg-[#1E4B75] text-slate-200 text-xs font-bold flex items-center justify-center">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-slate-300 font-medium text-xs max-w-[150px] truncate">
                {profile?.fullName || user?.email?.split('@')[0]}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ============================================================ */}
      {/* CONTEÚDO CENTRAL: Saudação + Dois Grandes Botões de Escolha */}
      {/* ============================================================ */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full">
        
        {/* Cabeçalho de Boas-Vindas */}
        <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Seja bem-vindo(a){' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              {companyName}
            </span>
            ,<br className="hidden sm:inline" /> o que deseja acessar agora?
          </h1>
        </div>

        {/* Grade com os 2 Botões Centrais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          
          {/* ========================================= */}
          {/* CARD 1: CAIXA PDV */}
          {/* ========================================= */}
          <button
            type="button"
            onClick={() => {
              setCurrentEnvironment('pdv');
              setActiveScreen('pdv');
            }}
            className="group relative text-left bg-gradient-to-b from-[#0F2537] to-[#0D1F2D] border border-[#1E4B75] hover:border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/50 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Efeito de brilho de canto no hover */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition duration-500 pointer-events-none" />

            <div>
              {/* Badge & Ícone */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition duration-300">
                  <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  Frente de Caixa & Salão
                </span>
              </div>

              {/* Título & Descrição */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition">
                Caixa PDV
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                Ponto de venda rápido, gestão de mesas do salão, lançamento de comandas, divisão de contas e recebimentos com troco automático.
              </p>

              {/* Recursos em destaque */}
              <div className="mt-5 space-y-1.5 pt-4 border-t border-[#1E4B75]/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Mesas & Comandas em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Venda Balcão, PIX, Cartão e Dinheiro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Controle de Caixa Cego & Sangria</span>
                </div>
              </div>
            </div>

            {/* Botão de Ação Inferior */}
            <div className="mt-8 pt-4 flex items-center justify-between text-emerald-400 font-bold text-sm group-hover:text-emerald-300">
              <span>Acessar Caixa PDV</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-300 group-hover:text-white flex items-center justify-center transition duration-300">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
              </div>
            </div>
          </button>

          {/* ========================================= */}
          {/* CARD 2: PAINEL ADMINISTRADOR */}
          {/* ========================================= */}
          <button
            type="button"
            onClick={() => {
              setCurrentEnvironment('admin');
              setActiveScreen('relatorios');
            }}
            className="group relative text-left bg-gradient-to-b from-[#0F2537] to-[#0D1F2D] border border-[#1E4B75] hover:border-cyan-500/80 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-cyan-950/50 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Efeito de brilho de canto no hover */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition duration-500 pointer-events-none" />

            <div>
              {/* Badge & Ícone */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0E7490] to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 group-hover:scale-110 transition duration-300">
                  <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  Gestão & Relatórios
                </span>
              </div>

              {/* Título & Descrição */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition">
                Painel Administrador
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                Dashboard de faturamento, gráficos de vendas, gestão de estoque e fichas técnicas (CMV), livro caixa financeiro e cardápio.
              </p>

              {/* Recursos em destaque */}
              <div className="mt-5 space-y-1.5 pt-4 border-t border-[#1E4B75]/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Relatórios diários, semanais e mensais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Fichas Técnicas, CMV e Estoque</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Cardápio, Configurações & Assinatura</span>
                </div>
              </div>
            </div>

            {/* Botão de Ação Inferior */}
            <div className="mt-8 pt-4 flex items-center justify-between text-cyan-400 font-bold text-sm group-hover:text-cyan-300">
              <span>Acessar Painel Administrador</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-white flex items-center justify-center transition duration-300">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
              </div>
            </div>
          </button>

        </div>

      </main>

    </div>
  );
};
