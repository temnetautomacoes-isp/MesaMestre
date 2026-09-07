import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Store, 
  Beer, 
  UtensilsCrossed, 
  Pizza, 
  Sandwich, 
  MapPin, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Loader2,
  FileText,
  X
} from 'lucide-react';
import { GoogleIcon } from './GoogleButton';

export const GoogleOnboardingModal: React.FC = () => {
  const { user, profile, registerGoogleCompany, signOut } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('restaurante_caseiro');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [whatsapp, setWhatsapp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showTermsModal, setShowTermsModal] = useState(false);

  const businessTypes = [
    { id: 'restaurante_caseiro', title: 'Restaurante Caseiro', desc: 'Pratos feitos e self-service', icon: UtensilsCrossed },
    { id: 'boteco_bar', title: 'Boteco & Bar', desc: 'Porções, petiscos e bebidas', icon: Beer },
    { id: 'marmitaria', title: 'Marmitaria', desc: 'Marmitas executivas e entrega', icon: Store },
    { id: 'lanchonete', title: 'Lanchonete & Burger', desc: 'Lanches na chapa e sucos', icon: Sandwich },
    { id: 'pizzaria', title: 'Pizzaria & Forno', desc: 'Pizzas, fatias e esfirras', icon: Pizza },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = 'Informe o nome do seu restaurante ou bar.';
    if (!whatsapp.trim()) errors.whatsapp = 'Informe o WhatsApp de contato.';
    if (!city.trim()) errors.city = 'Informe a cidade.';
    if (!state.trim()) errors.state = 'Informe o estado.';
    if (!termsAccepted) errors.terms = 'É necessário aceitar os Termos de Uso e Política de Privacidade para continuar.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setFormErrors({});

    const res = await registerGoogleCompany({
      companyName: companyName.trim(),
      businessType,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      whatsapp: whatsapp.trim(),
      termsAccepted: true,
      termsVersion: '1.0'
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Não foi possível concluir o cadastro do restaurante. Tente novamente.');
    }
  };

  const displayName = profile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1A28]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#0F2537] border border-[#1E4B75] text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#1E4B75]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0">
              <GoogleIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  Conta Google Conectada
                </span>
                <span className="text-xs text-slate-400">7 Dias de Teste Grátis</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Complete os dados do seu Restaurante
              </h2>
              <p className="text-xs text-slate-300">
                Olá, <span className="text-emerald-400 font-semibold">{displayName}</span>! Configure o seu estabelecimento para liberar seu acesso ao MesaMestre.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-xs text-slate-400 hover:text-slate-200 hover:underline shrink-0"
            title="Sair desta conta"
          >
            Trocar conta
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="mt-4 bg-rose-950/80 border border-rose-500/60 rounded-xl p-3.5 flex items-start gap-3 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Passo 1: Perfil do Negócio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Qual o perfil principal do seu negócio?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {businessTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = businessType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBusinessType(t.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                        : 'bg-[#0B1A28]/80 border-[#1E4B75] text-slate-300 hover:border-slate-500 hover:bg-[#0B1A28]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-[#1E4B75]/50 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate">{t.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passo 2: Dados do Restaurante */}
          <div className="pt-4 border-t border-[#1E4B75]">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              2. Informações do Estabelecimento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Fantasia do Restaurante / Bar / Marmitaria *
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Boteco & Restaurante Sabor da Vila"
                    className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                {formErrors.companyName && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.companyName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  WhatsApp para Pedidos / Contato *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
                {formErrors.whatsapp && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.whatsapp}</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="São Paulo"
                      className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl pl-9 pr-2 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>
                  {formErrors.city && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">UF *</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full bg-[#0B1A28] border border-[#1E4B75] rounded-xl px-2 py-2 text-xs text-white placeholder:text-slate-500 uppercase text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                  {formErrors.state && <p className="text-[10px] text-rose-400 mt-0.5">{formErrors.state}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3: Aceite dos Termos de Uso e Política de Privacidade */}
          <div className="pt-4 border-t border-[#1E4B75] bg-[#0B1A28]/50 p-4 rounded-2xl border border-[#1E4B75]">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms_acceptance"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-500 bg-[#0B1A28] border-[#1E4B75] rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="terms_acceptance" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
                Li e concordo com os{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Termos de Uso e Política de Privacidade (v1.0)
                </button>
                , incluindo o período de 7 dias grátis e o isolamento seguro dos dados do meu restaurante.
              </label>
            </div>
            {formErrors.terms && <p className="text-[10px] text-rose-400 mt-1.5 ml-7">{formErrors.terms}</p>}
          </div>

          {/* Botão de Conclusão */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#0E7490] hover:from-[#0ea571] hover:to-[#0c627a] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando seu Restaurante...</span>
                </>
              ) : (
                <>
                  <span>Concluir e Acessar MesaMestre</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Modal de Termos de Uso e Privacidade */}
        {showTermsModal && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F2537] border border-[#1E4B75] text-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E4B75]">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Termos de Uso e Privacidade — MesaMestre (v1.0)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto py-4 text-xs text-slate-300 space-y-3 leading-relaxed">
                <p><strong>1. Isolamento de Dados:</strong> Cada restaurante possui banco de dados segregado por ID de empresa (RLS), garantindo que apenas membros autorizados acessem vendas, mesas e cardápio.</p>
                <p><strong>2. Período Grátis de 7 Dias:</strong> Novos cadastros via Google ou e-mail recebem acesso completo ao Plano Inicial sem cobrança durante 7 dias.</p>
                <p><strong>3. Responsabilidade do Usuário:</strong> O administrador do restaurante é responsável pelas operações, troco de caixa e cadastro correto de insumos e preços.</p>
                <p><strong>4. Privacidade e Segurança:</strong> O MesaMestre não comercializa dados de clientes ou pedidos com terceiros.</p>
              </div>
              <div className="pt-3 border-t border-[#1E4B75] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setTermsAccepted(true);
                    setShowTermsModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                >
                  Li e Concordo
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
