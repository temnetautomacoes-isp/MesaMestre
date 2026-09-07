import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Lightbulb, 
  CheckSquare, 
  Square, 
  Settings, 
  BookOpen, 
  HeartHandshake, 
  Scale, 
  Flame, 
  Lock, 
  ShieldCheck, 
  Phone,
  MapPin,
  Building2,
  Save
} from 'lucide-react';

export const DicasScreen: React.FC = () => {
  const { businessConfig, updateBusinessConfig, formatCurrency, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'dicas' | 'checklist' | 'configuracoes'>('dicas');

  // Checklist diário do Seu Carlos
  const [checklist, setChecklist] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Conferir se o troco inicial de moedas e notas está na gaveta antes de abrir', done: true },
    { id: '2', text: 'Checar a aba Estoque > "Comprar Hoje" para repor carnes e hortifrúti', done: true },
    { id: '3', text: 'Alinhar com a cozinha os pratos do dia para não esgotar marmitex', done: false },
    { id: '4', text: 'Registrar qualquer retirada de dinheiro para compras no balcão como Sangria', done: false },
    { id: '5', text: 'Realizar o Fechamento Cego no final do turno com o operador', done: false },
    { id: '6', text: 'Conferir se todas as válvulas de gás e freezers estão devidamente travados', done: false }
  ]);

  // Config Form
  const [cfgName, setCfgName] = useState(businessConfig.name);
  const [cfgAddress, setCfgAddress] = useState(businessConfig.address);
  const [cfgPhone, setCfgPhone] = useState(businessConfig.phone);
  const [cfgTables, setCfgTables] = useState(businessConfig.tableCount);
  const [cfgCashDefault, setCfgCashDefault] = useState(businessConfig.initialCashDefault);
  const [cfgService, setCfgService] = useState(businessConfig.serviceChargePercentage);
  const [cfgPixKey, setCfgPixKey] = useState(businessConfig.pixKey || '');

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig({
      name: cfgName,
      address: cfgAddress,
      phone: cfgPhone,
      tableCount: Number(cfgTables),
      initialCashDefault: Number(cfgCashDefault),
      serviceChargePercentage: Number(cfgService),
      pixKey: cfgPixKey
    });
    showToast('Configurações Atualizadas', 'Dados do restaurante salvos com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6">
      {/* Header Principal */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2537] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0F2537]">
              Dicas do Mestre & Configurações
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Orientações práticas de quem entende o dia a dia do restaurante de verdade.
            </p>
          </div>
        </div>

        {/* Abas Superiores */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('dicas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dicas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dicas Práticas</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Rotina Diária</span>
          </button>
          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'configuracoes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {activeTab === 'dicas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#0F2537]">
              1. A Balança e a Concha são suas Melhores Amigas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              O maior rombo de um restaurante quase nunca é o roubo; é a <strong>porção sem padrão</strong>! Se um dia o prato vai com 250g de carne e no outro com 180g, o cliente reclama ou o seu lucro derrete. Estabeleça uma concha fixa para o feijão e pese as porções de carne antes de ir para a chapa.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#0F2537]">
              2. Por que o Caixa Cego Salva seu Negócio e sua Equipe?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quando o operador fecha o caixa sem saber o valor esperado pelo sistema, não existe tentação nem discussão. Se faltar ou sobrar dinheiro, vocês sentam juntos e analisam se faltou lançar uma sangria ou se houve troco errado. Isso gera <strong>confiança mútua e respeito</strong> na equipe.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#0F2537]">
              3. Faça a Feira 2x na Semana em vez de Estocar Demais
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dinheiro parado no freezer e na dispensa é dinheiro que não está no seu caixa para pagar boletos. Tomate e folhas estragam rápido no calor. Comprar em pequenas quantidades mantém a salada sempre fresca e apetitosa e evita o desperdício na lixeira.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#0F2537]">
              4. O Poder do Cafezinho Cortesia e do Nome do Cliente
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restaurante de interior e bairro não compete com fast-food internacional de shopping. O seu maior patrimônio é o <strong>calor humano</strong>. Chamar o cliente frequente pelo primeiro nome e oferecer um cafezinho com broa fresca fideliza mais do que qualquer promoção complicada!
            </p>
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F2537]">
              Rotina de Fechamento & Abertura Perfeita
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Marque os itens ao longo do expediente para ter certeza de que o restaurante está 100% blindado.
            </p>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                  item.done
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="mt-0.5">
                  {item.done ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className={`text-xs font-semibold select-none leading-relaxed ${item.done ? 'line-through opacity-80' : ''}`}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">
              Progresso do Checklist: {checklist.filter(c => c.done).length} de {checklist.length} concluídos
            </span>
            <button
              onClick={() => setChecklist(prev => prev.map(c => ({ ...c, done: false })))}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              Reiniciar para Amanhã
            </button>
          </div>
        </div>
      )}

      {activeTab === 'configuracoes' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-lg font-extrabold text-[#0F2537]">
              Dados do Estabelecimento
            </h2>
            <p className="text-xs text-slate-500">
              Esses dados saem no cabeçalho dos comprovantes impressos e nas mensagens de WhatsApp para clientes.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nome do Estabelecimento:</label>
              <input
                type="text"
                required
                value={cfgName}
                onChange={e => setCfgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-[#1E4B75]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telefone / WhatsApp:</label>
                <input
                  type="text"
                  value={cfgPhone}
                  onChange={e => setCfgPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chave PIX Oficial:</label>
                <input
                  type="text"
                  value={cfgPixKey}
                  onChange={e => setCfgPixKey(e.target.value)}
                  placeholder="CNPJ, E-mail ou Celular"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-[#10B981]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Endereço Completo:</label>
              <input
                type="text"
                value={cfgAddress}
                onChange={e => setCfgAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantidade de Mesas:</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={cfgTables}
                  onChange={e => setCfgTables(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Troco Padrão da Gaveta (R$):</label>
                <input
                  type="number"
                  step="10"
                  value={cfgCashDefault}
                  onChange={e => setCfgCashDefault(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Taxa de Serviço Salão (%):</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={cfgService}
                  onChange={e => setCfgService(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
