import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessType, ReceiptPrintSettings } from '../../types';
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
  Image as ImageIcon,
  Receipt,
  FileText,
  MessageSquare
} from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { businessConfig, updateBusinessConfig, setActiveScreen, showToast } = useApp();
  const { currentCompany, updateCurrentCompany } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialName = businessConfig.name || currentCompany?.name || 'Meu Restaurante';
  const initialLogo = businessConfig.logoUrl || (currentCompany as any)?.logoUrl || '';

  const initialPrintSettings: ReceiptPrintSettings = {
    showLogo: businessConfig.printSettings?.showLogo ?? true,
    showName: businessConfig.printSettings?.showName ?? true,
    showLegalName: businessConfig.printSettings?.showLegalName ?? false,
    showCnpj: businessConfig.printSettings?.showCnpj ?? true,
    showIe: businessConfig.printSettings?.showIe ?? false,
    showPhone: businessConfig.printSettings?.showPhone ?? true,
    showAddress: businessConfig.printSettings?.showAddress ?? true,
    showCityState: businessConfig.printSettings?.showCityState ?? true,
    showCep: businessConfig.printSettings?.showCep ?? false,
    showFooterMessage: businessConfig.printSettings?.showFooterMessage ?? true,
  };

  const [formData, setFormData] = useState({
    name: initialName,
    legalName: businessConfig.legalName || '',
    cnpj: businessConfig.cnpj || '',
    ie: businessConfig.ie || '',
    ownerName: businessConfig.ownerName || '',
    type: businessConfig.type,
    phone: businessConfig.phone || '',
    address: businessConfig.address || '',
    neighborhood: businessConfig.neighborhood || '',
    city: businessConfig.city || '',
    state: businessConfig.state || '',
    cep: businessConfig.cep || '',
    footerMessage: businessConfig.footerMessage || 'Obrigado pela preferência! Volte sempre :)',
    logoUrl: initialLogo,
    printSettings: initialPrintSettings,
    tableCount: businessConfig.tableCount,
    pixRate: businessConfig.rates.pix,
    debitoRate: businessConfig.rates.debito,
    creditoRate: businessConfig.rates.credito,
    initialCashDefault: businessConfig.initialCashDefault,
    serviceChargePercentage: businessConfig.serviceChargePercentage
  });

  const togglePrintSetting = (key: keyof ReceiptPrintSettings) => {
    setFormData(prev => ({
      ...prev,
      printSettings: {
        ...prev.printSettings,
        [key]: !prev.printSettings[key]
      }
    }));
  };

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
      legalName: formData.legalName.trim() || undefined,
      cnpj: formData.cnpj.trim() || undefined,
      ie: formData.ie.trim() || undefined,
      ownerName: formData.ownerName,
      type: formData.type,
      phone: formData.phone,
      address: formData.address.trim() || undefined,
      neighborhood: formData.neighborhood.trim() || undefined,
      city: formData.city,
      state: formData.state,
      cep: formData.cep.trim() || undefined,
      footerMessage: formData.footerMessage.trim() || undefined,
      logoUrl: finalLogo,
      printSettings: formData.printSettings,
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

    showToast('Alterações Salvas!', 'As configurações do seu estabelecimento e impressão de nota foram atualizadas com sucesso.');
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

          {/* Passo 2: Dados Básicos & Impressão da Notinha */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  2. Dados da Empresa & Impressão na Notinha
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preencha as informações do seu negócio e marque abaixo de cada item o que deve ser impresso no cupom do cliente.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto border border-emerald-200/60">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personalização da Notinha Ativa</span>
              </div>
            </div>

            {/* Upload da Logo da Marca */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Logo da Marca da Empresa <span className="text-slate-400 font-normal">(Recomendado: PNG com fundo transparente ou JPG)</span>
              </label>

              {/* Input Invisível para Upload de Arquivo */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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

                {/* Ações de Upload e Checkbox */}
                <div className="space-y-2.5 flex-1">
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
                  
                  {/* Checkbox: Aparecer na nota? */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={formData.printSettings.showLogo}
                      onChange={() => togglePrintSetting('showLogo')}
                      className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                    />
                    <span className={`text-xs font-medium transition-colors ${formData.printSettings.showLogo ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      Aparecer na nota? (Exibir logo no topo do cupom impresso)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Grid com Todos os Campos e Seus Respectivos Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Nome Fantasia */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia do Restaurante/Bar *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                      placeholder="Ex: Boteco Sabor da Vila"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showName}
                    onChange={() => togglePrintSetting('showName')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showName ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* Razão Social */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social / Nome Jurídico</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={e => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                      placeholder="Ex: Silva & Santos Gastronomia Ltda"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showLegalName}
                    onChange={() => togglePrintSetting('showLegalName')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showLegalName ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* CNPJ / CPF */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={e => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                    placeholder="Ex: 12.345.678/0001-90"
                  />
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showCnpj}
                    onChange={() => togglePrintSetting('showCnpj')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showCnpj ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* Inscrição Estadual (IE) */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Estadual (IE)</label>
                  <input
                    type="text"
                    value={formData.ie}
                    onChange={e => setFormData(prev => ({ ...prev, ie: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                    placeholder="Ex: 123.456.789.000"
                  />
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showIe}
                    onChange={() => togglePrintSetting('showIe')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showIe ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* WhatsApp / Telefone */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Telefone para Pedidos</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                      placeholder="(19) 99876-5432"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showPhone}
                    onChange={() => togglePrintSetting('showPhone')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showPhone ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* Endereço (Rua e Número) & Bairro */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 sm:col-span-2 lg:col-span-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço (Rua, Número, Bairro)</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                        placeholder="Rua Nove de Julho, 1420"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={e => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                      placeholder="Bairro (Ex: Centro)"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showAddress}
                    onChange={() => togglePrintSetting('showAddress')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showAddress ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* Cidade e Estado (UF) */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade e UF</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.state}
                        onChange={e => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden uppercase text-center shadow-xs"
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showCityState}
                    onChange={() => togglePrintSetting('showCityState')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showCityState ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* CEP */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={e => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                    placeholder="14800-000"
                  />
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showCep}
                    onChange={() => togglePrintSetting('showCep')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showCep ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
              </div>

              {/* Nome do Gestor */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Proprietário(a) / Gestor *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={e => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                    placeholder="Ex: Carlos Silva"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5">
                  Responsável pela operação no sistema
                </p>
              </div>

              {/* Mesas no Salão */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Mesas no Salão *</label>
                  <div className="relative">
                    <LayoutGrid className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={formData.tableCount}
                      onChange={e => setFormData(prev => ({ ...prev, tableCount: Number(e.target.value) }))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5">
                  Mesas ativas no salão
                </p>
              </div>

              {/* Mensagem de Rodapé da Notinha / Agradecimento */}
              <div className="flex flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200 sm:col-span-2 lg:col-span-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mensagem de Rodapé / Agradecimento / Senha Wi-Fi da Nota
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.footerMessage}
                      onChange={e => setFormData(prev => ({ ...prev, footerMessage: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-[#1E4B75] focus:ring-1 focus:ring-[#1E4B75] outline-hidden shadow-xs"
                      placeholder="Ex: Obrigado pela preferência! Volte sempre :) Wi-Fi: SaborDaVila / Senha: 123"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 mt-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={formData.printSettings.showFooterMessage}
                    onChange={() => togglePrintSetting('showFooterMessage')}
                    className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-xs font-medium transition-colors ${formData.printSettings.showFooterMessage ? 'text-emerald-700 font-semibold' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    Aparecer na nota?
                  </span>
                </label>
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
