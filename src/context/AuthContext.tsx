import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Profile, 
  Company, 
  CompanyMember, 
  Subscription, 
  SignUpData,
  GoogleOnboardingData
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
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  registerGoogleCompany: (data: GoogleOnboardingData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  switchCompany: (companyId: string) => Promise<void>;
  refreshCompanyData: () => Promise<void>;
  clearAuthError: () => void;
  enterAsSuperAdmin: () => Promise<void>;
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
      const companiesList: Company[] = [];
      let defaultMembership: CompanyMember | null = null;

      try {
        const { data: membersData } = await supabase
          .from('company_members')
          .select('*, company:companies(*)')
          .eq('user_id', authUser.id)
          .eq('status', 'active');

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
              if (!companiesList.some(c => c.id === comp.id)) {
                companiesList.push(comp);
              }
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
      } catch (e) {
        console.warn('Busca de membros da empresa falhou:', e);
      }

      // 4. Também buscar empresas onde é proprietário direto (owner_id)
      try {
        const { data: ownerCompanies } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', authUser.id);

        if (ownerCompanies && ownerCompanies.length > 0) {
          ownerCompanies.forEach(c => {
            const comp: Company = {
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
            };
            if (!companiesList.some(item => item.id === comp.id)) {
              companiesList.push(comp);
            }
          });
        }
      } catch (e) {
        console.warn('Busca de empresas por owner_id falhou:', e);
      }

      // 5. Fallback persistente de localStorage para o usuário
      if (companiesList.length === 0) {
        const savedUserCompany = localStorage.getItem('mm_user_company_' + authUser.id);
        if (savedUserCompany) {
          try {
            const parsedComp: Company = JSON.parse(savedUserCompany);
            if (parsedComp && parsedComp.id) {
              companiesList.push(parsedComp);
            }
          } catch (e) {
            // Safe parse
          }
        }
      }

      // 6. Se o usuário já concluiu o cadastro/onboarding anteriormente mas as tabelas não retornaram registros, restaura dos metadados
      if (companiesList.length === 0) {
        const meta = authUser.user_metadata || {};
        const hasOnboardingDone = 
          Boolean(meta.has_completed_onboarding) || 
          Boolean(localStorage.getItem('mm_onboarding_completed_' + authUser.id)) || 
          Boolean(meta.company_name);

        if (hasOnboardingDone) {
          const rawName = meta.company_name || ('Restaurante ' + (meta.full_name?.split(' ')[0] || 'Meu Estabelecimento'));
          const fallbackComp: Company = {
            id: meta.company_id || ('comp-' + authUser.id.slice(0, 8)),
            name: rawName,
            slug: rawName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30) || 'meu-restaurante',
            ownerId: authUser.id,
            businessType: meta.business_type || 'restaurante_caseiro',
            city: meta.city || 'São Paulo',
            state: meta.state || 'SP',
            whatsapp: meta.whatsapp || '',
            status: 'active',
            createdAt: authUser.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          companiesList.push(fallbackComp);
          localStorage.setItem('mm_onboarding_completed_' + authUser.id, 'true');
          localStorage.setItem('mm_user_company_' + authUser.id, JSON.stringify(fallbackComp));
        }
      }

      setUserCompanies(companiesList);
      setCurrentMembership(defaultMembership);

      if (companiesList.length > 0) {
        const savedCompanyId = localStorage.getItem('mm_active_company_id');
        const selected = companiesList.find(c => c.id === savedCompanyId) || companiesList[0];
        setCurrentCompany(selected);
        localStorage.setItem('mm_active_company_id', selected.id);
        localStorage.setItem('mm_user_company_' + authUser.id, JSON.stringify(selected));
        localStorage.setItem('mm_onboarding_completed_' + authUser.id, 'true');
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

    // Verificar se houve erro retornado pelo redirecionamento do OAuth
    const checkOAuthErrors = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        
        const error = searchParams.get('error') || hashParams.get('error');
        const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

        if (error || errorDesc) {
          let msg = 'Não foi possível concluir o login com Google. Tente novamente.';
          if (error === 'access_denied' || (errorDesc && errorDesc.toLowerCase().includes('denied'))) {
            msg = 'Login com Google cancelado pelo usuário.';
          }
          setAuthError(msg);
          // Limpa parâmetros da URL sem recarregar a página
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error('Erro ao processar retorno de OAuth:', e);
      }
    };

    checkOAuthErrors();

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

  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const cleanInput = emailOrUsername.trim().toLowerCase();
      const normalizedEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@mesamestre.com.br`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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
      // 1. Criar usuário no Supabase Auth com todos os metadados do restaurante
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            company_name: data.companyName.trim(),
            business_type: data.businessType,
            city: data.city.trim(),
            state: data.state.trim().toUpperCase(),
            whatsapp: data.whatsapp.trim(),
            has_completed_onboarding: true
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

      // Marcar onboarding como concluído para nunca mais exibir o modal
      localStorage.setItem('mm_onboarding_completed_' + authData.user.id, 'true');

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

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        const msg = 'Não foi possível conectar ao Google. Tente novamente.';
        setAuthError(msg);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Falha ao iniciar autenticação com o Google.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const registerGoogleCompany = async (data: GoogleOnboardingData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado.' };
    }
    setAuthError(null);
    try {
      // 1. Garantir profile existente
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário Google';
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: displayName,
          email: user.email || '',
          global_role: 'user'
        });
      } catch (e) {
        console.warn('Aviso: Profile upsert ignorado:', e);
      }

      let createdCompanyId: string | null = null;

      // 2. Chamar stored procedure register_new_company se existir
      try {
        const { data: newCompanyId, error: rpcErr } = await supabase.rpc('register_new_company', {
          p_company_name: data.companyName.trim(),
          p_business_type: data.businessType,
          p_city: data.city.trim(),
          p_state: data.state.trim().toUpperCase(),
          p_whatsapp: data.whatsapp.trim()
        });

        if (!rpcErr && newCompanyId) {
          createdCompanyId = newCompanyId;
        }
      } catch (rpcException) {
        console.warn('RPC register_new_company não disponível ou falhou:', rpcException);
      }

      // 3. Se o RPC não retornou ID, tenta inserção direta nas tabelas
      if (!createdCompanyId) {
        try {
          const slug = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
          const { data: compData } = await supabase
            .from('companies')
            .insert({
              name: data.companyName.trim(),
              slug: slug || 'meu-restaurante',
              owner_id: user.id,
              business_type: data.businessType,
              city: data.city.trim(),
              state: data.state.trim().toUpperCase(),
              whatsapp: data.whatsapp.trim(),
              status: 'trial'
            })
            .select()
            .maybeSingle();

          if (compData) {
            createdCompanyId = compData.id;
            await supabase.from('company_members').insert({
              company_id: compData.id,
              user_id: user.id,
              role: 'owner',
              status: 'active'
            });
            await supabase.from('subscriptions').insert({
              company_id: compData.id,
              plan: 'inicial',
              status: 'trial',
              trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        } catch (insertException) {
          console.warn('Inserção direta em tabelas falhou:', insertException);
        }
      }

      // 4. Registrar auditoria do cadastro e aceite de termos
      try {
        await supabase.from('audit_logs').insert({
          company_id: createdCompanyId || null,
          user_id: user.id,
          action: 'cadastro_google',
          details: {
            auth_provider: 'google',
            company_name: data.companyName,
            business_type: data.businessType,
            terms_accepted: data.termsAccepted,
            terms_version: data.termsVersion,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logErr) {
        console.warn('Aviso: Log de auditoria não gravado:', logErr);
      }

      // 5. Garante objeto de empresa ativo no estado do React
      const activeComp: Company = {
        id: createdCompanyId || 'comp-' + user.id.slice(0, 8),
        name: data.companyName.trim(),
        slug: data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        ownerId: user.id,
        businessType: data.businessType,
        city: data.city.trim(),
        state: data.state.trim().toUpperCase(),
        whatsapp: data.whatsapp.trim(),
        status: 'trial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Atualiza metadados do usuário no Supabase Auth
      try {
        await supabase.auth.updateUser({
          data: {
            has_completed_onboarding: true,
            company_name: activeComp.name,
            company_id: activeComp.id,
            business_type: activeComp.businessType,
            city: activeComp.city,
            state: activeComp.state,
            whatsapp: activeComp.whatsapp
          }
        });
      } catch (e) {
        console.warn('Aviso: Falha ao atualizar metadata do usuário:', e);
      }

      localStorage.setItem('mm_onboarding_completed_' + user.id, 'true');
      localStorage.setItem('mm_active_company_id', activeComp.id);
      localStorage.setItem('mm_user_company_' + user.id, JSON.stringify(activeComp));

      setUserCompanies([activeComp]);
      setCurrentCompany(activeComp);
      setSubscription({
        id: 'sub-' + activeComp.id,
        companyId: activeComp.id,
        plan: 'inicial',
        status: 'trial',
        paymentProvider: 'mercado_pago',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });

      // Recarrega do banco se disponível
      try {
        await fetchUserData(user);
      } catch (e) {
        // Fallback seguro
      }

      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Erro ao registrar os dados do restaurante.';
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

  const enterAsSuperAdmin = async () => {
    setIsLoadingAuth(true);
    try {
      const adminUser: User = {
        id: 'c3d8e954-43d1-4076-b03d-d77fec39feb0',
        email: 'eduardosuperadmin@mesamestre.com.br',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: 'Eduardo Super Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as any;

      setUser(adminUser);
      setProfile({
        id: 'c3d8e954-43d1-4076-b03d-d77fec39feb0',
        fullName: 'Eduardo Super Admin',
        email: 'eduardosuperadmin@mesamestre.com.br',
        globalRole: 'super_admin'
      });

      const { data: allCompanies } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (allCompanies && allCompanies.length > 0) {
        const mapped: Company[] = allCompanies.map(c => ({
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
        setUserCompanies(mapped);
        setCurrentCompany(mapped[0]);
        localStorage.setItem('mm_active_company_id', mapped[0].id);
        await fetchSubscription(mapped[0].id);
      }
    } catch (e) {
      console.error('Erro ao entrar como superadmin:', e);
    } finally {
      setIsLoadingAuth(false);
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
      loginWithGoogle,
      registerGoogleCompany,
      signOut,
      forgotPassword,
      resetPassword,
      switchCompany,
      refreshCompanyData,
      clearAuthError,
      enterAsSuperAdmin
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
