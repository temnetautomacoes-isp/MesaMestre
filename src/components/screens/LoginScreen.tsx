import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { ChefHat, KeyRound, ShieldCheck, ArrowRight, Sun, Sparkles } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { users, currentUser, setCurrentUser, setActiveScreen, showToast } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserProfile>(currentUser || users[0]);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg('');
      if (newPin.length === 4) {
        verifyPin(newPin, selectedUser);
      }
    }
  };

  const handleClearPin = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const verifyPin = (inputPin: string, user: UserProfile) => {
    if (inputPin === user.pin) {
      setCurrentUser(user);
      showToast('Acesso Liberado', `Bem-vindo de volta, ${user.name}! Bom trabalho.`);
      setActiveScreen('pdv');
    } else {
      setErrorMsg('PIN incorreto. Tente novamente ou confira seu código.');
      setPin('');
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    setSelectedUser(user);
    setPin('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-110px)] bg-gradient-to-b from-[#0F2537] via-[#132A40] to-[#0B1A28] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Painel Esquerdo: Identidade & Boas-Vindas */}
        <div className="md:col-span-6 text-white space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#1E4B75]/60 border border-[#1E4B75] px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Bom dia e bom serviço!</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center shadow-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Mesa<span className="text-[#10B981]">Mestre</span>
              </h1>
            </div>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              O sistema descomplicado para o seu boteco, restaurante, lanchonete ou marmitaria faturar com tranquilidade e controle total do salão.
            </p>
          </div>

          {/* Destaque para o Carlos */}
          <div className="bg-[#1E4B75]/30 border border-[#1E4B75]/80 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Dica do Seu Carlos</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                "Aqui o atendimento é rápido: no balcão você fecha uma comanda em 3 toques e na cozinha o pedido sai sem erro de comanda!"
              </p>
            </div>
          </div>

          {/* Seleção de Operador Rápida */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quem está assumindo o turno agora?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {users.map((user) => {
                const isSelected = selectedUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E4B75] border-emerald-400 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-[#16334D]/50 border-[#1E4B75]/60 hover:bg-[#1E4B75]/40 text-slate-300'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full ${user.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{user.tag}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel Direito: Teclado de PIN & Acesso Rápido */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800">
          <div className="text-center mb-6">
            <div className="inline-flex p-2.5 bg-slate-100 rounded-2xl mb-3">
              <KeyRound className="w-6 h-6 text-[#0F2537]" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2537]">
              Acesso de {selectedUser.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Digite seu PIN de 4 dígitos para liberar o terminal
            </p>
          </div>

          {/* Marcadores de Dígitos do PIN */}
          <div className="flex justify-center items-center gap-3 mb-6">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isFilled 
                      ? 'bg-[#10B981] border-[#10B981] scale-110' 
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              );
            })}
          </div>

          {errorMsg && (
            <div className="mb-4 text-center text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-lg animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Teclado Numérico */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handlePinDigit(digit)}
                className="h-13 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl text-xl font-bold text-[#0F2537] flex items-center justify-center transition shadow-xs cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClearPin}
              className="h-13 bg-slate-50 hover:bg-rose-50 active:bg-rose-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center justify-center transition cursor-pointer"
            >
              Limpar
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              className="h-13 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl text-xl font-bold text-[#0F2537] flex items-center justify-center transition shadow-xs cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-13 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              ⌫
            </button>
          </div>

          {/* Atalho de Demonstração */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              onClick={() => verifyPin(selectedUser.pin, selectedUser)}
              className="inline-flex items-center gap-1.5 text-xs text-[#0E7490] hover:text-[#0F2537] font-semibold transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Entrar com PIN de Teste ({selectedUser.pin})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
