import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Profile, 
  Company, 
  CompanyMember, 
  Subscription, 
  SignUpData 
} from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  currentCompany: Company | null;
  userCompanies: Company[];
  currentMembership: CompanyMember | null;
  subscription: Subscription | null;
  isSuperAdmin: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  
  // Ações de Autenticação
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchCompany: (companyId: string) => Promise<void>;
  refreshCompanyData: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [currentMembership, setCurrentMembership] = useState<CompanyMember | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isSuperAdmin = profile?.globalRole === 'super_admin';

  const clearAuthError = () => setAuthError(null);

  // Carregar dados da empresa e assinatura do usuário autenticado
  const fetchUserData = async (authUser: User) => {
    try {
      // 1. Buscar Profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      let currentProf: Profile;
      if (profileData) {
        currentProf = {
          id: profileData.id,
          fullName: profileData.full_name,
          email: profileData.email,
          globalRole: profileData.global_role,
          createdAt: profileData.created_at,
          updatedAt: profileData.updated_at
        };
      } else {
        // Fallback: criar perfil se não existir
        const newProf = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          global_role: 'user'
        };
        await supabase.from('profiles').upsert(newProf);
        currentProf = {
          id: newProf.id,
          fullName: newProf.full_name,
          email: newProf.email,
          globalRole: 'user'
        };
      }
      setProfile(currentProf);

      // 2. Se for Super Admin, buscar todas as empresas
      if (currentProf.globalRole === 'super_admin') {
        const { data: allCompanies } = await supabase
          .from('companies')
          .select('*')
          .order('name');

        if (allCompanies && allCompanies.length > 0) {
          const mappedCompanies: Company[] = allCompanies.map(c => ({
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
          }));
          setUserCompanies(mappedCompanies);
          
          // Seleciona a primeira empresa ou salva do localStorage
          const savedCompanyId = localStorage.getItem('mm_active_company_id');
          const found = mappedCompanies.find(c => c.id === savedCompanyId) || mappedCompanies[0];
          setCurrentCompany(found);
          await fetchSubscription(found.id);
        }
        return;
      }

      // 3. Usuário Regular: Buscar empresas onde é membro ativo ou dono
      const { data: membersData } = await supabase
        .from('company_members')
        .select('*, company:companies(*)')
        .eq('user_id', authUser.id)
        .eq('status', 'active');

      const companiesList: Company[] = [];
      let defaultMembership: CompanyMember | null = null;

      if (membersData && membersData.length > 0) {
        membersData.forEach(m => {
          if (m.company) {
            const comp: Company = {
              id: m.company.id,
              name: m.company.name,
              slug: m.company.slug,
              ownerId: m.company.owner_id,
              businessType: m.company.business_type,
              city: m.company.city,
              state: m.company.state,
              whatsapp: m.company.whatsapp,
              status: m.company.status,
              createdAt: m.company.created_at,
              updatedAt: m.company.updated_at
            };
            companiesList.push(comp);
            if (!defaultMembership) {
              defaultMembership = {
                id: m.id,
                companyId: m.company_id,
                userId: m.user_id,
                role: m.role,
                status: m.status,
                createdAt: m.created_at
              };
            }
          }
        });
      }

      setUserCompanies(companiesList);
      setCurrentMembership(defaultMembership);

      if (companiesList.length > 0) {
        const savedCompanyId = localStorage.getItem('mm_active_company_id');
        const selected = companiesList.find(c => c.id === savedCompanyId) || companiesList[0];
        setCurrentCompany(selected);
        localStorage.setItem('mm_active_company_id', selected.id);
        await fetchSubscription(selected.id);
      } else {
        setCurrentCompany(null);
        setSubscription(null);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  const fetchSubscription = async (companyId: string) => {
    try {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (subData) {
        setSubscription({
          id: subData.id,
          companyId: subData.company_id,
          plan: subData.plan,
          status: subData.status,
          paymentProvider: subData.payment_provider || 'mercado_pago',
          mercadoPagoSubscriptionId: subData.mercado_pago_subscription_id,
          trialEndsAt: subData.trial_ends_at,
          currentPeriodEndsAt: subData.current_period_ends_at,
          createdAt: subData.created_at,
          updatedAt: subData.updated_at
        });
      }
    } catch (e) {
      console.error('Erro ao buscar assinatura:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          setIsLoadingAuth(false);
          return;
        }

        const { data: { session: initSession } } = await supabase.auth.getSession();
        if (initSession?.user && isMounted) {
          setSession(initSession);
          setUser(initSession.user);
          await fetchUserData(initSession.user);
        }
      } catch (e) {
        console.error('Erro na inicialização da autenticação:', e);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    };

    initAuth();

    // Escuta mudanças de auth (login, logout, refresh de token)
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await fetchUserData(newSession.user);
      } else {
        setProfile(null);
        setCurrentCompany(null);
        setUserCompanies([]);
        setCurrentMembership(null);
        setSubscription(null);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      isMounted = false;
      authSub.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        let msg = 'Erro ao realizar login. Verifique suas credenciais.';
        if (error.message.includes('Invalid login credentials')) {
          msg = 'E-mail ou senha incorretos. Por favor, tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          msg = 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
        }
        setAuthError(msg);
        return { success: false, error: msg };
      }

      if (data.user) {
        await fetchUserData(data.user);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Falha inesperada na autenticação.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim()
          }
        }
      });

      if (authErr) {
        let msg = authErr.message;
        if (authErr.message.includes('User already registered')) {
          msg = 'Este e-mail já está cadastrado. Tente entrar ou recupere sua senha.';
        } else if (authErr.message.includes('Password should be at least')) {
          msg = 'A senha deve ter pelo menos 6 caracteres.';
        }
        setAuthError(msg);
        return { success: false, error: msg };
      }

      if (!authData.user) {
        return { success: false, error: 'Não foi possível criar a conta de usuário.' };
      }

      // 2. Garantir perfil criado
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        global_role: 'user'
      });

      // 3. Chamar stored procedure register_new_company
      const { data: rpcResult, error: rpcErr } = await supabase.rpc('register_new_company', {
        p_company_name: data.companyName.trim(),
        p_business_type: data.businessType,
        p_city: data.city.trim(),
        p_state: data.state.trim().toUpperCase(),
        p_whatsapp: data.whatsapp.trim()
      });

      if (rpcErr) {
        console.error('Erro ao registrar restaurante:', rpcErr);
        // Tenta buscar se foi criado
        await fetchUserData(authData.user);
      } else if (authData.user) {
        await fetchUserData(authData.user);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Erro ao realizar cadastro do restaurante.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('mm_active_company_id');
      setUser(null);
      setSession(null);
      setProfile(null);
      setCurrentCompany(null);
      setUserCompanies([]);
      setCurrentMembership(null);
      setSubscription(null);
    } catch (e) {
      console.error('Erro ao sair:', e);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/?reset=true`
      });

      if (error) {
        return { success: false, error: 'Não foi possível enviar o link de recuperação. Verifique o e-mail informado.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao solicitar recuperação de senha.' };
    }
  };

  const resetPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao atualizar senha.' };
    }
  };

  const switchCompany = async (companyId: string) => {
    const target = userCompanies.find(c => c.id === companyId);
    if (target) {
      setCurrentCompany(target);
      localStorage.setItem('mm_active_company_id', target.id);
      await fetchSubscription(target.id);
    }
  };

  const refreshCompanyData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      currentCompany,
      userCompanies,
      currentMembership,
      subscription,
      isSuperAdmin,
      isLoadingAuth,
      authError,
      login,
      signUp,
      signOut,
      forgotPassword,
      resetPassword,
      switchCompany,
      refreshCompanyData,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
