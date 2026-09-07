import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  ShieldCheck, 
  Search, 
  Filter, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ExternalLink,
  Edit,
  TrendingUp,
  Users,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Company, AuditLog, CompanyStatus, SubscriptionPlan } from '../../types';

export const SuperAdminScreen: React.FC = () => {
  const { switchCompany } = useAuth();
  const { showToast, setActiveScreen } = useApp();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [subscriptionsMap, setSubscriptionsMap] = useState<Record<string, { plan: SubscriptionPlan; status: CompanyStatus }>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'companies' | 'audit'>('companies');

  // Modais de Alteração
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [modalAction, setModalAction] = useState<'status' | 'plan' | null>(null);
  const [newStatus, setNewStatus] = useState<CompanyStatus>('active');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('essencial');
  const [actionReason, setActionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Buscar todas as empresas
      const { data: compData, error: compErr } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (compData) {
        setCompanies(compData.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          ownerId: c.owner_id,
          businessType: c.business_type,
          city: c.city,
          state: c.state,
          whatsapp: c.whatsapp,
          status: c.status,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        })));
      }

      // 2. Buscar assinaturas
      const { data: subData } = await supabase.from('subscriptions').select('*');
      if (subData) {
        const sMap: Record<string, { plan: SubscriptionPlan; status: CompanyStatus }> = {};
        subData.forEach(s => {
          sMap[s.company_id] = { plan: s.plan, status: s.status };
        });
        setSubscriptionsMap(sMap);
      }

      // 3. Buscar Logs de Auditoria
      const { data: logsData } = await supabase
        .from('audit_logs')
        .select('*, company:companies(name), profile:profiles(email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsData) {
        setAuditLogs(logsData.map(l => ({
          id: l.id,
          companyId: l.company_id,
          userId: l.user_id,
          action: l.action,
          details: l.details || {},
          ipAddress: l.ip_address,
          createdAt: l.created_at,
          companyName: l.company?.name || 'SaaS Global',
          userEmail: l.profile?.email || 'Sistema'
        })));
      }
    } catch (e) {
      console.error('Erro ao buscar dados administrativos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('admin_update_company_status', {
        p_company_id: selectedCompany.id,
        p_status: newStatus,
        p_reason: actionReason.trim()
      });

      if (error) {
        showToast('Erro ao atualizar', error.message, 'error');
      } else {
        showToast('Status Atualizado', `Empresa ${selectedCompany.name} alterada para ${newStatus.toUpperCase()}`);
        setModalAction(null);
        await fetchAdminData();
      }
    } catch (e: any) {
      showToast('Erro', e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedCompany) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.rpc('admin_update_company_plan', {
        p_company_id: selectedCompany.id,
        p_plan: newPlan,
        p_reason: actionReason.trim()
      });

      if (error) {
        showToast('Erro ao atualizar plano', error.message, 'error');
      } else {
        showToast('Plano Atualizado', `Plano da empresa ${selectedCompany.name} alterado para ${newPlan.toUpperCase()}`);
        setModalAction(null);
        await fetchAdminData();
      }
    } catch (e: any) {
      showToast('Erro', e.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccessAsRestaurant = async (company: Company) => {
    await supabase.rpc('admin_log_access', { p_company_id: company.id });
    await switchCompany(company.id);
    showToast('Acessando Restaurante', `Você agora está visualizando os dados de "${company.name}"`);
    setActiveScreen('pdv');
  };

  // Estatísticas
  const totalCount = companies.length;
  const trialCount = companies.filter(c => c.status === 'trial').length;
  const activeCount = companies.filter(c => c.status === 'active').length;
  const suspendedCount = companies.filter(c => c.status === 'suspended' || c.status === 'past_due').length;

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.whatsapp.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header do Painel Super Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F2537] text-white p-6 rounded-3xl border border-[#1E4B75] shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Painel Super Admin</h1>
              <span className="text-[11px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full font-bold uppercase">
                MesaMestre SaaS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Gestão central de clientes, planos, isolamento de dados e auditoria global.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1E4B75] hover:bg-[#255e94] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Restaurantes</span>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <p className="text-[11px] text-slate-500">Cadastrados na plataforma</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Assinantes Ativos</span>
          <div className="text-2xl font-black text-emerald-700">{activeCount}</div>
          <p className="text-[11px] text-emerald-600">Planos pagos ativos</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-1 bg-blue-50/20">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Em Teste Grátis</span>
          <div className="text-2xl font-black text-blue-700">{trialCount}</div>
          <p className="text-[11px] text-blue-600">Avaliando no trial de 7 dias</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-1 bg-rose-50/20">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Suspensos / Pendentes</span>
          <div className="text-2xl font-black text-rose-700">{suspendedCount}</div>
          <p className="text-[11px] text-rose-600">Aguardando regularização</p>
        </div>
      </div>

      {/* Navegação por Abas: Empresas vs Auditoria */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'companies'
              ? 'border-[#10B981] text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Restaurantes & Assinaturas ({filteredCompanies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'audit'
              ? 'border-[#10B981] text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Logs de Auditoria ({auditLogs.length})</span>
        </button>
      </div>

      {/* ABA 1: Lista de Empresas */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, cidade ou WhatsApp..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="trial">Trial (Teste Grátis)</option>
                <option value="active">Ativo (Pago)</option>
                <option value="past_due">Pendente</option>
                <option value="suspended">Suspenso</option>
                <option value="canceled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Tabela de Empresas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Restaurante</th>
                  <th className="py-3 px-4">Tipo & Local</th>
                  <th className="py-3 px-4">Plano Atual</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum restaurante encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map(c => {
                    const sub = subscriptionsMap[c.id] || { plan: 'inicial', status: c.status };
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{c.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">slug: {c.slug}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="capitalize">{c.businessType}</div>
                          <span className="text-[11px] text-slate-500">{c.city} - {c.state}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md uppercase text-[10px]">
                            {sub.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            c.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                            c.status === 'past_due' ? 'bg-amber-100 text-amber-800' :
                            c.status === 'suspended' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {c.status === 'active' && 'Ativo'}
                            {c.status === 'trial' && 'Teste Grátis'}
                            {c.status === 'past_due' && 'Pendente'}
                            {c.status === 'suspended' && 'Suspenso'}
                            {c.status === 'canceled' && 'Cancelado'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {c.whatsapp}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setNewStatus(c.status);
                              setModalAction('status');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                            title="Alterar Status"
                          >
                            Status
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCompany(c);
                              setNewPlan(sub.plan);
                              setModalAction('plan');
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold"
                            title="Alterar Plano"
                          >
                            Plano
                          </button>

                          <button
                            onClick={() => handleAccessAsRestaurant(c)}
                            className="p-1.5 rounded-lg bg-[#1E4B75] hover:bg-[#153655] text-white font-bold inline-flex items-center gap-1"
                            title="Acessar painel do restaurante"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Acessar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ABA 2: Logs de Auditoria */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Histórico de Ações & Auditoria SaaS</h3>
            <span className="text-xs text-slate-500">Últimos {auditLogs.length} eventos</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum log registrado até o momento.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 capitalize">
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {log.companyName}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      {JSON.stringify(log.details)}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Alterar Status */}
      {modalAction === 'status' && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Alterar Status do Restaurante</h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Restaurante: <strong>{selectedCompany.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Novo Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as CompanyStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              >
                <option value="trial">Trial (Teste Grátis)</option>
                <option value="active">Ativo (Pago e Regular)</option>
                <option value="past_due">Pendente (Aviso de Pagamento)</option>
                <option value="suspended">Suspenso (Bloqueado por Inadimplência)</option>
                <option value="canceled">Cancelado (Desativado)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Observação (Auditoria)</label>
              <input
                type="text"
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder="Ex: Confirmação manual de PIX ou solicitação do cliente"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#0ea571] text-white shadow"
              >
                {actionLoading ? 'Salvando...' : 'Confirmar Alteração'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Alterar Plano */}
      {modalAction === 'plan' && selectedCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Alterar Plano SaaS</h3>
              <button onClick={() => setModalAction(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Restaurante: <strong>{selectedCompany.name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Novo Plano</label>
              <select
                value={newPlan}
                onChange={e => setNewPlan(e.target.value as SubscriptionPlan)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              >
                <option value="inicial">Inicial (R$ 59,90/mês)</option>
                <option value="essencial">Essencial (R$ 99,90/mês)</option>
                <option value="gestao">Gestão Total (R$ 149,90/mês)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo / Observação (Auditoria)</label>
              <input
                type="text"
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                placeholder="Ex: Upgrade solicitado pelo cliente"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePlan}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#0ea571] text-white shadow"
              >
                {actionLoading ? 'Salvando...' : 'Confirmar Plano'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
