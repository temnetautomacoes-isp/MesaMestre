import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, AlertOctagon, Phone, CreditCard, LogOut, ChefHat } from 'lucide-react';

export const SuspendedAccountScreen: React.FC = () => {
  const { currentCompany, signOut } = useAuth();

  const handleOpenWhatsapp = () => {
    window.open('https://wa.me/5519998765432?text=Olá,%20preciso%20regularizar%20o%20pagamento%20da%20minha%20assinatura%20do%20MesaMestre', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1A28] via-[#0F2537] to-[#132A40] text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#0F2537] border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Glow de Alerta */}
        <div className="w-20 h-20 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/50">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full">
            Acesso Temporariamente Suspenso
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Assinatura do {currentCompany?.name || 'Restaurante'}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Identificamos uma pendência financeira na sua conta. Seus dados, cardápio e histórico continuam 100% seguros e preservados.
          </p>
        </div>

        {/* Informações para Regularizar */}
        <div className="bg-[#0B1A28] border border-[#1E4B75] rounded-2xl p-4 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Status da Conta:</span>
            <span className="font-bold text-rose-400">Suspenso por Inadimplência</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Restabelecimento:</span>
            <span className="font-semibold text-emerald-400">Imediato após confirmação</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleOpenWhatsapp}
            className="w-full bg-gradient-to-r from-[#10B981] to-[#0E7490] hover:from-[#0ea571] hover:to-[#0c667f] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Regularizar pelo WhatsApp de Suporte</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full bg-[#1E4B75]/40 hover:bg-[#1E4B75]/70 text-slate-300 hover:text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400">
          MesaMestre SaaS • Dúvidas financeiras? Contate suporte@mesamestre.com.br
        </p>
      </div>
    </div>
  );
};
