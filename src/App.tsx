import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { NotificationToast } from './components/NotificationToast';
import { ReceiptModal } from './components/ReceiptModal';

// Screens
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

const MainLayout: React.FC = () => {
  const { currentUser, activeScreen } = useApp();

  // If user is not logged in, show PIN login screen
  if (!currentUser) {
    return <LoginScreen />;
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
        {activeScreen === 'onboarding' && <OnboardingScreen />}
      </main>

      {/* Modais Globais e Notificações */}
      <ReceiptModal />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
