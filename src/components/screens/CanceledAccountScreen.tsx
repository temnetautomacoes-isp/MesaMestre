import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Phone, LogOut } from 'lucide-react';

export const CanceledAccountScreen: React.FC = () => {
  const { currentCompany, signOut } = useAuth();

  const handleReactivate = () => {
    window.open('https://wa.me/5519998765432?text=Olá,%20gostaria%20de%20reativar%20minha%20assinatura%20no%20MesaMestre', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1A28] via-[#0F2537] to-[#132A40] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0F2537] border border-[#1E4B75] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full">
            Assinatura Cancelada
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sentimos sua falta no {currentCompany?.name || 'MesaMestre'}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sua conta está desativada, mas você pode reativar a qualquer momento e retomar o controle de mesas, comandas e caixa exatamente de onde parou.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleReactivate}
            className="w-full bg-gradient-to-r from-[#10B981] to-[#0E7490] hover:from-[#0ea571] hover:to-[#0c667f] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Reativar Minha Assinatura</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full bg-[#1E4B75]/40 hover:bg-[#1E4B75]/70 text-slate-300 hover:text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
