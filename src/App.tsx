import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { NotificationToast } from './components/NotificationToast';
import { ReceiptModal } from './components/ReceiptModal';

// Screens
import { AuthScreen } from './components/auth/AuthScreen';
import { GoogleOnboardingModal } from './components/auth/GoogleOnboardingModal';
import { SuspendedAccountScreen } from './components/screens/SuspendedAccountScreen';
import { CanceledAccountScreen } from './components/screens/CanceledAccountScreen';
import { SubscriptionScreen } from './components/screens/SubscriptionScreen';
import { SuperAdminScreen } from './components/screens/SuperAdminScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { PdvScreen } from './components/screens/PdvScreen';
import { MesasScreen } from './components/screens/MesasScreen';
import { CaixaCegoScreen } from './components/screens/CaixaCegoScreen';
import { CardapioScreen } from './components/screens/CardapioScreen';
import { FichaTecnicaScreen } from './components/screens/FichaTecnicaScreen';
import { EstoqueScreen } from './components/screens/EstoqueScreen';
import { FinanceiroScreen } from './components/screens/FinanceiroScreen';
import { RelatoriosScreen } from './components/screens/RelatoriosScreen';
import { DicasScreen } from './components/screens/DicasScreen';
import { Loader2, ChefHat } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, isLoadingAuth, currentCompany, userCompanies, subscription, isSuperAdmin } = useAuth();
  const { activeScreen } = useApp();

  // 1. Estado de Carregamento Inicial de Sessão
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0F2537] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#0E7490] flex items-center justify-center shadow-lg animate-pulse">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Carregando MesaMestre...</span>
        </div>
      </div>
    );
  }

  // 2. Se não estiver autenticado no Supabase Auth, exibe a tela de Autenticação SaaS
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Usuário autenticado (ex: via Google) sem empresa cadastrada -> Onboarding Obrigatório
  if (!isSuperAdmin && (!currentCompany || userCompanies.length === 0)) {
    return <GoogleOnboardingModal />;
  }

  // 4. Verificação de Status da Conta / Assinatura (se não for Super Admin)
  if (!isSuperAdmin) {
    const isSuspended = currentCompany?.status === 'suspended' || subscription?.status === 'suspended';
    const isCanceled = currentCompany?.status === 'canceled' || subscription?.status === 'canceled';

    if (isSuspended) {
      return <SuspendedAccountScreen />;
    }

    if (isCanceled) {
      return <CanceledAccountScreen />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Barra de Navegação Superior */}
      <Navigation />

      {/* Conteúdo da Tela Ativa */}
      <main className="flex-1 pb-16">
        {activeScreen === 'pdv' && <PdvScreen />}
        {activeScreen === 'mesas' && <MesasScreen />}
        {(activeScreen === 'caixa' || (activeScreen as string) === 'caixa_cego') && <CaixaCegoScreen />}
        {activeScreen === 'cardapio' && <CardapioScreen />}
        {activeScreen === 'ficha_tecnica' && <FichaTecnicaScreen />}
        {activeScreen === 'estoque' && <EstoqueScreen />}
        {activeScreen === 'financeiro' && <FinanceiroScreen />}
        {activeScreen === 'relatorios' && <RelatoriosScreen />}
        {activeScreen === 'dicas' && <DicasScreen />}
        {activeScreen === 'subscription' && <SubscriptionScreen />}
        {activeScreen === 'admin' && <SuperAdminScreen />}
        {activeScreen === 'onboarding' && <OnboardingScreen />}
        {activeScreen === 'login' && <LoginScreen />}
      </main>

      {/* Modais Globais e Notificações */}
      <ReceiptModal />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
