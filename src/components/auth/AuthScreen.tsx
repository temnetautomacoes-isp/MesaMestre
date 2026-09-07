import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  ChefHat, 
  Mail, 
  Lock, 
  User, 
  Store, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';

export const AuthScreen: React.FC<{ initialMode?: 'login' | 'register' | 'forgot' | 'reset' }> = ({ initialMode = 'login' }) => {
  const { login, signUp, forgotPassword, resetPassword, authError, clearAuthError, enterAsSuperAdmin } = useAuth();
  const { setActiveScreen } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('restaurante');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('SP');
  const [regWhatsapp, setRegWhatsapp] = useState('');

  // Forgot / Reset password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true' || window.location.hash.includes('type=recovery')) {
      setMode('reset');
    }
  }, []);

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot' | 'reset') => {
    setMode(newMode);
    clearAuthError();
    setSuccessMsg(null);
    setFormErrors({});
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errors: Record<string, string> = {};
    if (!loginEmail.trim()) errors.email = 'Informe seu e-mail.';
    if (!loginPassword) errors.password = 'Informe sua senha.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errors: Record<string, string> = {};
    if (!regFullName.trim()) errors.fullName = 'Informe seu nome completo.';
    if (!regEmail.trim()) errors.email = 'Informe seu e-mail.';
    if (!regPassword || regPassword.length < 6) errors.password = 'A senha deve ter no mínimo 6 caracteres.';
    if (!regCompanyName.trim()) errors.companyName = 'Informe o nome do seu restaurante/estabelecimento.';
    if (!regCity.trim()) errors.city = 'Informe a cidade.';
    if (!regState.trim()) errors.state = 'Informe o estado.';
    if (!regWhatsapp.trim()) errors.whatsapp = 'Informe o WhatsApp para contato.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setFormErrors({});
    const res = await signUp({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      companyName: regCompanyName,
      businessType: regBusinessType,
      city: regCity,
      state: regState,
      whatsapp: regWhatsapp
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Conta criada com sucesso! Você já pode acessar seu período de 7 dias grátis.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!forgotEmail.trim()) {
      setFormErrors({ forgotEmail: 'Informe seu e-mail cadastrado.' });
      return;
    }

    setLoading(true);
    setFormErrors({});
    const res = await forgotPassword(forgotEmail);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!newPassword || newPassword.length < 6) {
      setFormErrors({ newPassword: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setLoading(true);
    setFormErrors({});
    const res = await resetPassword(newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Senha atualizada com sucesso! Você já pode entrar com sua nova senha.');
      setTimeout(() => {
        handleSwitchMode('login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1A28] via-[#0F2537] to-[#132A40] text-white flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Lado Esquerdo: Identidade do MesaMestre & Benefícios */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Mesa<span className="text-[#10B981]">Mestre</span>
              </h1>
              <span className="text-xs text-slate-300 font-medium">SaaS de Gestão Descomplicada para Restaurantes</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
              O controle do seu salão, caixa e cardápio na palma da mão.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Feito sob medida para botecos, restaurantes caseiros, lanchonetes e marmitarias. Multiempresa, isolamento total de dados e operação em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#1E4B75]/30 border border-[#1E4B75]/70 rounded-xl p-3.5 flex flex-col gap-1.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">7 Dias Grátis</h4>
              <p className="text-[11px] text-slate-300">Teste completo sem compromisso no plano Inicial.</p>
            </div>
            <div className="bg-[#1E4B75]/30 border border-[#1E4B75]/70 rounded-xl p-3.5 flex flex-col gap-1.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">100% Seguro</h4>
              <p className="text-[11px] text-slate-300">Isolamento rigoroso por empresa com RLS.</p>
            </div>
            <div className="bg-[#1E4B75]/30 border border-[#1E4B75]/70 rounded-xl p-3.5 flex flex-col gap-1.5">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-bold text-white">Caixa Cego</h4>
              <p className="text-[11px] text-slate-300">Auditoria à prova de erros e sangrias controladas.</p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Card de Formulário (Login / Cadastro / Recuperação) */}
        <div className="lg:col-span-6">
          <div className="bg-[#0F2537]/90 backdrop-blur-xl border border-[#1E4B75] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
            
            {/* Header do Card */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {mode === 'login' && 'Bem-vindo ao MesaMestre'}
                  {mode === 'register' && 'Criar minha conta'}
                  {mode === 'forgot' && 'Recuperar minha senha'}
                  {mode === 'reset' && 'Definir nova senha'}
                </h3>
                {mode === 'login' && (
                  <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-semibold">
                    Acesso Seguro
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {mode === 'login' && 'Informe seu e-mail e senha para acessar o sistema.'}
                {mode === 'register' && 'Cadastre seu restaurante e comece seu teste gratuito de 7 dias.'}
                {mode === 'forgot' && 'Informe seu e-mail para receber o link de redefinição.'}
                {mode === 'reset' && 'Digite sua nova senha abaixo.'}
              </p>
            </div>

            {/* Mensagem de Erro Geral */}
            {authError && (
              <div className="mb-5 bg-rose-950/80 border border-rose-500/60 rounded-xl p-3.5 flex items-start gap-3 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMsg && (
              <div className="mb-5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3.5 flex items-start gap-3 text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. Formulário de LOGIN */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail ou Usuário</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="eduardosuperadmin ou seu-email@restaurante.com"
                      className={`w-full bg-[#0B1A28] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition ${
                        formErrors.email ? 'border-rose-500' : 'border-[#1E4B75]'
                      }`}
                    />
                  </div>
                  {formErrors.email && <p className="text-[11px] text-rose-400 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Senha</label>
                    <button 
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-[#0B1A28] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition ${
                        formErrors.password ? 'border-rose-500' : 'border-[#1E4B75]'
                      }`}
                    />
                  </div>
                  {formErrors.password && <p className="text-[11px] text-rose-400 mt-1">{formErrors.password}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#10B981] to-[#0E7490] hover:from-[#0ea571] hover:to-[#0c667f] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no MesaMestre</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-3 border-t border-[#1E4B75] space-y-3">
                  <p className="text-xs text-slate-300">
                    Não tem uma conta?{' '}
                    <button 
                      type="button"
                      onClick={() => handleSwitchMode('register')}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Criar minha conta
                    </button>
                  </p>

                  {/* Botão de Acesso Direto Super Admin (Temporário para testes) */}
                  <button
                    type="button"
                    onClick={async () => {
                      await enterAsSuperAdmin();
                      setActiveScreen('admin');
                    }}
                    className="w-full bg-[#1E4B75]/70 hover:bg-[#1E4B75] text-cyan-300 border border-cyan-500/40 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                    title="Acessar painel de administração diretamente"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>⚡ Acessar Painel Super Admin (Acesso Direto)</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. Formulário de CADASTRO (Novo Restaurante) */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Nome Completo</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={regFullName}
                        onChange={e => setRegFullName(e.target.value)}
                        placeholder="Ex: Carlos Silva"
                        className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      />
                    </div>
                    {formErrors.fullName && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Seu E-mail de Acesso</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="carlos@sabordavila.com"
                        className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      />
                    </div>
                    {formErrors.email && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Senha (mínimo 6 caracteres)</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {formErrors.password && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.password}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#1E4B75]/60">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Estabelecimento</label>
                    <div className="relative">
                      <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={regCompanyName}
                        onChange={e => setRegCompanyName(e.target.value)}
                        placeholder="Ex: Boteco Sabor da Vila"
                        className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      />
                    </div>
                    {formErrors.companyName && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.companyName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Negócio</label>
                    <select 
                      value={regBusinessType}
                      onChange={e => setRegBusinessType(e.target.value)}
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    >
                      <option value="restaurante">Restaurante Caseiro / Comercial</option>
                      <option value="bar">Boteco / Bar / Petiscaria</option>
                      <option value="lanchonete">Lanchonete / Hamburgueria</option>
                      <option value="marmitaria">Marmitaria & Delivery</option>
                      <option value="pizzaria">Pizzaria</option>
                      <option value="outro">Outro Estabelecimento</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={regCity}
                        onChange={e => setRegCity(e.target.value)}
                        placeholder="Ex: Araraquara"
                        className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      />
                    </div>
                    {formErrors.city && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
                    <input 
                      type="text"
                      maxLength={2}
                      value={regState}
                      onChange={e => setRegState(e.target.value.toUpperCase())}
                      placeholder="SP"
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl px-2 py-2 text-xs text-center font-bold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Telefone</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={regWhatsapp}
                      onChange={e => setRegWhatsapp(e.target.value)}
                      placeholder="(19) 99876-5432"
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {formErrors.whatsapp && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.whatsapp}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#10B981] to-[#0E7490] hover:from-[#0ea571] hover:to-[#0c667f] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Criando Restaurante...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Começar 7 Dias Grátis</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-300">
                    Já tem uma conta?{' '}
                    <button 
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Fazer Login
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* 3. Formulário de RECUPERAÇÃO DE SENHA */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seu E-mail Cadastrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="seu-email@restaurante.com"
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {formErrors.forgotEmail && <p className="text-[11px] text-rose-400 mt-1">{formErrors.forgotEmail}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#10B981] hover:bg-[#0ea571] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando link...</span>
                    </>
                  ) : (
                    <span>Enviar Link de Recuperação</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="text-xs text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    ← Voltar para o login
                  </button>
                </div>
              </form>
            )}

            {/* 4. Formulário de REDEFINIÇÃO DE SENHA */}
            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Digite sua Nova Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {formErrors.newPassword && <p className="text-[11px] text-rose-400 mt-1">{formErrors.newPassword}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#10B981] hover:bg-[#0ea571] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando senha...</span>
                    </>
                  ) : (
                    <span>Salvar Nova Senha</span>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
