export type GlobalRole = 'super_admin' | 'user';
export type MemberRole = 'owner' | 'manager' | 'cashier' | 'employee';
export type CompanyStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'canceled';
export type SubscriptionPlan = 'inicial' | 'essencial' | 'gestao';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  globalRole: GlobalRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  businessType: string;
  city: string;
  state: string;
  whatsapp: string;
  status: CompanyStatus;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: MemberRole;
  status: 'active' | 'inactive';
  createdAt?: string;
  profile?: Profile;
}

export interface Subscription {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: CompanyStatus;
  paymentProvider: string;
  mercadoPagoSubscriptionId?: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  companyId?: string;
  userId?: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
  companyName?: string;
  userEmail?: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  businessType: string;
  city: string;
  state: string;
  whatsapp: string;
}

export interface GoogleOnboardingData {
  companyName: string;
  businessType: string;
  city: string;
  state: string;
  whatsapp: string;
  termsAccepted: boolean;
  termsVersion: string;
}

export type UserRole = 'dono' | 'balcao' | 'garcom' | 'cozinha';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  avatarColor: string;
  tag: string;
}

export type BusinessType = 
  | 'restaurante'
  | 'restaurante_caseiro'
  | 'bar'
  | 'boteco_bar'
  | 'lanchonete'
  | 'hamburgueria'
  | 'marmitaria'
  | 'pizzaria'
  | 'outro';

export interface BusinessConfig {
  name: string;
  ownerName: string;
  type: BusinessType;
  phone: string;
  city: string;
  state: string;
  logoUrl?: string;
  tableCount: number;
  rates: {
    pix: number;       // e.g. 0%
    debito: number;    // e.g. 1.5%
    credito: number;   // e.g. 3.2%
    dinheiro: number;  // 0%
  };
  initialCashDefault: number; // e.g. 150 (troco inicial padrão)
  serviceChargePercentage: number; // e.g. 10% ou 0%
  isSetupComplete: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  unit: string; // 'un', 'prato', 'marmita', 'copo', 'garrafa'
  imageUrl?: string;
  isActive: boolean;
  costPrice: number; // Custo estimado calculado da ficha técnica
  stockTracked: boolean;
  linkedStockId?: string; // Para produtos prontos (cerveja, refri)
  prepTimeMinutes?: number;
  allergens?: string[];
  options?: {
    title: string;
    items: { name: string; additionalPrice: number }[];
  }[];
}

export type TableStatus = 'livre' | 'ocupada' | 'pedindo_conta' | 'reservada';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  selectedOptions?: string[];
  addedAt: string;
  status: 'enviado_cozinha' | 'preparando' | 'pronto' | 'entregue';
}

export interface TableOrder {
  id: string;
  tableNumber: number;
  customerName?: string;
  peopleCount: number;
  openedAt: string;
  items: OrderItem[];
  status: 'aberta' | 'fechada' | 'cancelada';
  discount: number;
  serviceFeeIncluded: boolean;
}

export interface PaymentRecord {
  method: 'dinheiro' | 'pix' | 'debito' | 'credito';
  amount: number;
  receivedAmount?: number; // Para cálculo de troco em dinheiro
  change?: number;
  feeDeduction?: number;
}

export interface SaleReceipt {
  id: string;
  orderNumber: number;
  type: 'mesa' | 'balcao' | 'delivery_marmita';
  tableNumber?: number;
  customerName?: string;
  openedAt: string;
  closedAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  payments: PaymentRecord[];
  cashierId: string;
  cashierName: string;
}

export type MovementType = 'suprimento' | 'sangria';

export interface CashMovement {
  id: string;
  type: MovementType;
  amount: number;
  reason: string;
  timestamp: string;
  operatorName: string;
}

export interface BlindCashCount {
  countedCash: number;
  countedPix: number;
  countedDebit: number;
  countedCredit: number;
  countedCoins: number;
  notes?: string;
}

export interface CashRegisterSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  isOpen: boolean;
  operatorName: string;
  initialCash: number; // Troco inicial inserido na abertura
  movements: CashMovement[]; // Suprimentos e Sangrias
  blindClose?: BlindCashCount; // Valores que o operador contou sem ver a tela
  systemTotalsAtClose?: {
    cashExpected: number;
    pixExpected: number;
    debitExpected: number;
    creditExpected: number;
    totalSales: number;
    supplements: number;
    withdrawals: number;
  };
  discrepancies?: {
    cashDiff: number;
    pixDiff: number;
    cardDiff: number;
    overallDiff: number;
  };
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'un';
  packageCost: number; // Preço pago no fardo/pacote
  packageQuantity: number; // Qtd do fardo (ex: 5kg, 12un)
  unitCost: number; // Custo unitário calculado
  currentStock: number;
  minimumStock: number;
  supplier?: string;
  lastRestockedDate?: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantityNeeded: number; // Na unidade do insumo
}

export interface Recipe {
  id: string;
  menuItemId: string;
  ingredients: RecipeItem[];
  wasteAllowancePercent: number; // Ex: 10% de perda no preparo (casca, gordura)
  laborCostEstimate: number; // Custo de gás/luz/mão de obra por porção
  suggestedMarkup: number; // Ex: 2.8x ou 3.0x
}

export interface WasteLog {
  id: string;
  date: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  reason: 'queimou' | 'estragou_validade' | 'derramou_quebrou' | 'sobra_limpeza';
  notes?: string;
  registeredBy: string;
}

export type FinancialCategory = 
  | 'fornecedor_alimentos'
  | 'fornecedor_bebidas'
  | 'energia_agua'
  | 'gas_cozinha'
  | 'aluguel'
  | 'funcionarios'
  | 'impostos_taxas'
  | 'manutencao'
  | 'vendas_diarias'
  | 'outros';

export interface FinancialEntry {
  id: string;
  description: string;
  type: 'receita' | 'despesa';
  category: FinancialCategory;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pago' | 'pendente' | 'atrasado';
  supplierOrCustomer?: string;
  receiptNote?: string;
}

export interface MasterTip {
  id: string;
  category: 'lucro' | 'estoque' | 'atendimento' | 'cardapio' | 'caixa';
  title: string;
  shortDesc: string;
  fullTip: string;
  iconName: string;
  audioDurationText?: string;
  badge: string;
}
