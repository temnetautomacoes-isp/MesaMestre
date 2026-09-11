import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessType } from '../../types';
import { 
  Building2, 
  Store, 
  Beer, 
  UtensilsCrossed, 
  Pizza, 
  Sandwich,
  Flame,
  Check, 
  Percent, 
  Coins, 
  LayoutGrid, 
  Phone, 
  MapPin, 
  Sparkles,
  ArrowRight,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { businessConfig, updateBusinessConfig, setActiveScreen, showToast } = useApp();
  const { currentCompany, updateCurrentCompany } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialName = businessConfig.name || currentCompany?.name || 'Meu Restaurante';
  const initialLogo = businessConfig.logoUrl || (currentCompany as any)?.logoUrl || '';

  const [formData, setFormData] = useState({
    name: initialName,
    ownerName: businessConfig.ownerName,
    type: businessConfig.type,
    phone: businessConfig.phone,
    city: businessConfig.city,
    state: businessConfig.state,
    logoUrl: initialLogo,
    tableCount: businessConfig.tableCount,
    pixRate: businessConfig.rates.pix,
    debitoRate: businessConfig.rates.debito,
    creditoRate: businessConfig.rates.credito,
    initialCashDefault: businessConfig.initialCashDefault,
    serviceChargePercentage: businessConfig.serviceChargePercentage
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('Arquivo muito grande', 'Por favor selecione uma imagem de até 4MB.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, logoUrl: result }));
        showToast('Logo selecionada!', 'Clique em "Salvar Alterações" para aplicar em todo o sistema.');
      };
      reader.readAsDataURL(file);
    }
  };

  const businessTypes: { id: BusinessType; title: string; desc: string; icon: React.ElementType }[] = [
    { id: 'restaurante', title: 'Restaurante', desc: 'Pratos feitos, self-service e almoço de família', icon: UtensilsCrossed },
    { id: 'bar', title: 'Bar', desc: 'Cervejas trincando, porções, petiscos e caipirinhas', icon: Beer },
    { id: 'marmitaria', title: 'Marmitaria', desc: 'Marmitas executivas, entrega e comida boa para levar', icon: Store },
    { id: 'lanchonete', title: 'Lanchonete', desc: 'Lanches na chapa, salgados, pastéis e sucos', icon: Sandwich },
    { id: 'hamburgueria', title: 'Hamburgueria', desc: 'Burgers artesanais, combos especiais e porções', icon: Flame },
    { id: 'pizzaria', title: 'Pizzaria', desc: 'Pizzas inteiras, fatias, calzones e esfirras', icon: Pizza },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = formData.name.trim() || 'Meu Restaurante';
    const finalLogo = formData.logoUrl.trim() || undefined;

    updateBusinessConfig({
      name: finalName,
      ownerName: formData.ownerName,
      type: formData.type,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      logoUrl: finalLogo,
      tableCount: Number(formData.tableCount),
      rates: {
        pix: Number(formData.pixRate),
        debito: Number(formData.debitoRate),
        credito: Number(formData.creditoRate),
        dinheiro: 0
      },
      initialCashDefault: Number(formData.initialCashDefault),
      serviceChargePercentage: Number(formData.serviceChargePercentage),
      isSetupComplete: true
    });

    // Atualiza também os dados da empresa ativa
    updateCurrentCompany({
      name: finalName,
      businessType: formData.type,
      city: formData.city,
      state: formData.state,
      whatsapp: formData.phone,
      logoUrl: finalLogo
    });

    showToast('Alterações Salvas!', 'As configurações do seu estabelecimento foram atualizadas com sucesso.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Cabeçalho da Configuração */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Configuração Inicial & Ajustes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2537]">
              O seu estabelecimento do seu jeito
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Configuração rápida para deixar o MesaMestre pronto para operar suas mesas, comandas, taxas de cartão e troco sem complicações.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 max-w-xs shrink-0">
            <span className="font-bold text-[#0F2537] block mb-1">Dica do Seu Carlos:</span>
            "Preencha as taxas reais da sua maquininha de cartão para o sistema calcular seu lucro líquido sem nenhuma surpresa no fim do mês!"
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Passo 1: Tipo de Estabelecimento */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              1. Qual é o perfil principal do seu negócio?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {businessTypes.map((t) => {
                const Icon = t.icon;
                const isSelected = formData.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: t.id }))}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0F2537] flex items-center justify-between">
                        <span>{t.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passo 2: Dados Básicos */}
          <div className="pt-6 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
              2. Nome e Contato do Estabelecimento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia do Restaurante/Bar</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden"
                    placeholder="Ex: Boteco Sabor da Vila"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Proprietário(a) / Gestor</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden"
                  placeholder="Ex: Carlos Silva"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone para Pedidos</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden"
                    placeholder="(19) 99876-5432"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden"
                    placeholder="Araraquara"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={formData.state}
                  onChange={e => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden uppercase"
                  placeholder="SP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Mesas no Salão</label>
                <div className="relative">
                  <LayoutGrid className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.tableCount}
                    onChange={e => setFormData(prev => ({ ...prev, tableCount: Number(e.target.value) }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Logo da Marca do Restaurante <span className="text-slate-400 font-normal">(Recomendado: imagem PNG com fundo transparente ou JPG)</span>
                </label>
                
                {/* Input Invisível para Upload de Arquivo */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  {/* Visualizador / Preview da Logo */}
                  {formData.logoUrl ? (
                    <div className="relative w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm p-1.5 flex items-center justify-center shrink-0 overflow-hidden group">
                      <img
                        src={formData.logoUrl}
                        alt="Logo do Restaurante"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center text-white font-extrabold text-xl shadow-sm shrink-0 border border-emerald-400/40">
                      {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'MM'}
                    </div>
                  )}

                  {/* Ações de Upload e Informações */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#1E4B75] hover:bg-[#255e94] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{formData.logoUrl ? 'Trocar Imagem (PNG/JPG)' : 'Fazer Upload da Logo (PNG)'}</span>
                      </button>

                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Esta foto/logo aparecerá no topo do menu lateral (Sidebar), no portal inicial e no cabeçalho das impressões.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3: Taxas de Pagamento & Operação */}
          <div className="pt-6 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-4">
              3. Taxas da Maquininha & Troco Padrão
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-emerald-800 block">PIX</span>
                <p className="text-[11px] text-slate-500 mb-2">Geralmente 0% ou taxa fixa</p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pixRate}
                    onChange={e => setFormData(prev => ({ ...prev, pixRate: Number(e.target.value) }))}
                    className="w-full pr-8 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-hidden"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-blue-800 block">Cartão de Débito</span>
                <p className="text-[11px] text-slate-500 mb-2">Ex: 1.49% a 1.99%</p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.debitoRate}
                    onChange={e => setFormData(prev => ({ ...prev, debitoRate: Number(e.target.value) }))}
                    className="w-full pr-8 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-hidden"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-purple-800 block">Cartão de Crédito</span>
                <p className="text-[11px] text-slate-500 mb-2">Ex: 3.19% à vista</p>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.creditoRate}
                    onChange={e => setFormData(prev => ({ ...prev, creditoRate: Number(e.target.value) }))}
                    className="w-full pr-8 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-hidden"
                  />
                  <Percent className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-amber-800 block">Troco Inicial Padrão</span>
                <p className="text-[11px] text-slate-500 mb-2">Fundo de gaveta na abertura</p>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="10"
                    value={formData.initialCashDefault}
                    onChange={e => setFormData(prev => ({ ...prev, initialCashDefault: Number(e.target.value) }))}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-800">Taxa de Serviço Opcional (10%)</span>
                <p className="text-xs text-slate-500 mt-0.5">Adiciona sugestão de 10% nas comandas de mesa para os garçons</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, serviceChargePercentage: prev.serviceChargePercentage === 10 ? 0 : 10 }))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    formData.serviceChargePercentage === 10
                      ? 'bg-[#10B981] text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {formData.serviceChargePercentage === 10 ? 'Ativado (10%)' : 'Desativado (0%)'}
                </button>
              </div>
            </div>
          </div>

          {/* Botão de Salvar Alterações */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-[#10B981] hover:bg-[#0ea571] text-white rounded-2xl text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
