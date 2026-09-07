# MesaMestre — SaaS de Gestão para Pequenos Restaurantes 🍽️

MesaMestre é uma plataforma SaaS Web Multiempresa de alta performance projetada especialmente para restaurantes caseiros, botecos, lanchonetes, pizzarias e marmitarias.

---

## 🚀 Arquitetura SaaS & Multiempresa

Cada restaurante cadastrado opera em ambiente **estritamente isolado** por `company_id` através de políticas de **Row Level Security (RLS)** no PostgreSQL (Supabase).

### 📋 Tabelas do Núcleo SaaS

1. **`profiles`**: Perfis de usuário com papel global (`super_admin` ou `user`).
2. **`companies`**: Estabelecimentos com slug único, dados de contato e status (`trial`, `active`, `past_due`, `suspended`, `canceled`).
3. **`company_members`**: Vínculo entre usuário e restaurante com papéis (`owner`, `manager`, `cashier`, `employee`).
4. **`subscriptions`**: Controle de planos (`inicial`, `essencial`, `gestao`), status de pagamento e contagem de período de teste de 7 dias grátis.
5. **`audit_logs`**: Rastreabilidade de ações administrativas, criação de empresas, alterações de status/plano e acessos.
6. **Tabelas Operacionais com `company_id`**:
   - `mm_business_config`
   - `mm_users`
   - `mm_categories`
   - `mm_menu_items`
   - `mm_ingredients`
   - `mm_recipes`
   - `mm_table_orders`
   - `mm_sales_history`
   - `mm_cash_sessions`
   - `mm_financial_entries`
   - `mm_waste_logs`
   - `mm_master_tips`

---

## 🔒 Segurança e Row Level Security (RLS)

- **Isolamento de Dados:** Usuários comuns só conseguem ler ou modificar dados pertencentes às empresas onde possuem membership ativo (`get_user_company_ids()`).
- **Super Admin:** Usuários com `global_role = 'super_admin'` possuem visão global através do painel de administração (`/admin`).
- **Segurança sem vazamento de chaves:** Apenas a chave anônima/pública é utilizada no frontend; todas as validações ocorrem via RLS e stored procedures `SECURITY DEFINER`.

---

## 🧪 Roteiro de Testes

### 1. Cadastro de Novo Restaurante (Trial de 7 dias)
1. Acesse a tela inicial e clique em **"Criar minha conta"**.
2. Preencha nome, e-mail, senha, nome do estabelecimento, tipo de negócio, cidade, estado e WhatsApp.
3. Clique em **"Começar 7 Dias Grátis"**.
4. O sistema cria o usuário no Supabase Auth, o profile, a empresa, a membership `owner` e a assinatura `trial` com 7 dias de cortesia.

### 2. Login e Autenticação
- **Login com Sucesso:** Informe o e-mail e senha cadastrados.
- **Login Inválido:** Teste com senha incorreta para verificar a mensagem amigável em português: *"E-mail ou senha incorretos. Por favor, tente novamente."*
- **Recuperação de Senha:** Clique em *"Esqueci minha senha"* e informe o e-mail para receber o link de redefinição.

### 3. Teste de Isolamento entre Empresas
- Crie o **Restaurante A** e cadastre um prato no cardápio (ex: *"Prato Exclusivo A"*).
- Crie ou entre no **Restaurante B** em outra aba/navegador.
- O **Restaurante B** nunca verá o prato, mesas ou vendas do **Restaurante A**.

### 4. Ciclo de Vida da Assinatura
- **Trial:** Exibe badge no topo com contagem regressiva de dias.
- **Past Due:** Exibe faixa amarela fixa de aviso de pagamento pendente.
- **Suspended:** Bloqueia o acesso e exibe a tela de regularização com botão direto para WhatsApp de suporte.
- **Canceled:** Bloqueia o acesso e exibe a tela de reativação de assinatura.

### 5. Painel Super Admin
Para conceder permissão de Super Admin a um usuário no banco Supabase:
```sql
UPDATE public.profiles 
SET global_role = 'super_admin' 
WHERE email = 'seu-email@admin.com';
```
Após o login, o botão **"Super Admin"** aparecerá na barra de navegação.

---

## 🛠️ Executando Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm run dev
   ```
