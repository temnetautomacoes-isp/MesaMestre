import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  BusinessConfig, 
  Category, 
  MenuItem, 
  Ingredient, 
  Recipe, 
  FinancialEntry, 
  MasterTip,
  TableStatus,
  OrderItem,
  TableOrder,
  SaleReceipt,
  PaymentRecord,
  CashRegisterSession,
  CashMovement,
  BlindCashCount,
  WasteLog
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_BUSINESS_CONFIG, 
  INITIAL_CATEGORIES, 
  INITIAL_MENU_ITEMS, 
  INITIAL_INGREDIENTS, 
  INITIAL_RECIPES, 
  INITIAL_FINANCIAL_ENTRIES, 
  INITIAL_MASTER_TIPS 
} from '../mockData';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type ScreenId = 
  | 'login'
  | 'onboarding'
  | 'pdv'
  | 'mesas'
  | 'caixa'
  | 'cardapio'
  | 'ficha_tecnica'
  | 'estoque'
  | 'financeiro'
  | 'relatorios'
  | 'dicas'
  | 'subscription'
  | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
}

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  users: UserProfile[];
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  businessConfig: BusinessConfig;
  updateBusinessConfig: (newConfig: Partial<BusinessConfig>) => void;
  isCloudConnected: boolean;
  
  // Cardápio
  categories: Category[];
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  toggleMenuItemActive: (id: string) => void;
  
  // Mesas & Comandas
  tableOrders: Record<number, TableOrder | null>;
  tableStatuses: Record<number, TableStatus>;
  openTable: (tableNumber: number, customerName?: string, peopleCount?: number) => void;
  addItemToTable: (tableNumber: number, item: MenuItem, quantity?: number, notes?: string, selectedOptions?: string[]) => void;
  removeItemFromTable: (tableNumber: number, orderItemId: string) => void;
  setTableStatus: (tableNumber: number, status: TableStatus) => void;
  transferTable: (fromTable: number, toTable: number) => void;
  closeTableOrder: (tableNumber: number, payments: PaymentRecord[], discount?: number, includeService?: boolean) => SaleReceipt;
  
  // Venda Balcão Rápida
  finalizeQuickSale: (items: OrderItem[], payments: PaymentRecord[], customerName?: string, discount?: number) => SaleReceipt;
  
  // Caixa & Movimentações
  currentCashSession: CashRegisterSession;
  addCashMovement: (type: 'sangria' | 'suprimento', amount: number, reason: string) => void;
  performBlindClose: (counts: BlindCashCount) => void;
  reopenCashSession: (initialCash: number) => void;
  
  // Vendas Histórico & Recibo
  salesHistory: SaleReceipt[];
  activeReceipt: SaleReceipt | null;
  setActiveReceipt: (receipt: SaleReceipt | null) => void;
  
  // Estoque & Ficha Técnica & Perdas
  ingredients: Ingredient[];
  recipes: Recipe[];
  wasteLogs: WasteLog[];
  restockIngredient: (id: string, addedQty: number, totalCostPaid?: number) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, data: Partial<Ingredient>) => void;
  registerWaste: (data: Omit<WasteLog, 'id' | 'date'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  
  // Financeiro
  financialEntries: FinancialEntry[];
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id'>) => void;
  toggleFinancialStatus: (id: string) => void;
  deleteFinancialEntry: (id: string) => void;
  
  // Dicas do Mestre
  masterTips: MasterTip[];
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, description: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  
  // Utilitários
  formatCurrency: (value: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentCompany } = useAuth();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mesamestre_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [activeScreen, setActiveScreen] = useState<ScreenId>('pdv');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured);
  
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem('mesamestre_config');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_CONFIG;
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [masterTips, setMasterTips] = useState<MasterTip[]>(INITIAL_MASTER_TIPS);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('mesamestre_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('mesamestre_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('mesamestre_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem('mesamestre_finances');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ENTRIES;
  });

  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([
    {
      id: 'waste-1',
      date: '04/09/2026 11:30',
      itemName: 'Batata Especial Pré-Frita',
      quantity: 1.5,
      unit: 'kg',
      estimatedCost: 18.75,
      reason: 'queimou',
      notes: 'Óleo da fritadeira aqueceu além do normal na troca de turno.',
      registeredBy: 'Dona Bete'
    },
    {
      id: 'waste-2',
      date: '02/09/2026 21:40',
      itemName: 'Guaraná Antarctica Lata',
      quantity: 2,
      unit: 'un',
      estimatedCost: 5.60,
      reason: 'derramou_quebrou',
      notes: 'Lata caiu do engradado no balcão e amassou/estourou.',
      registeredBy: 'Tiago'
    }
  ]);

  const [tableStatuses, setTableStatuses] = useState<Record<number, TableStatus>>({
    1: 'ocupada',
    2: 'livre',
    3: 'pedindo_conta',
    4: 'livre',
    5: 'ocupada',
    6: 'livre',
    7: 'livre',
    8: 'reservada',
    9: 'livre',
    10: 'livre'
  });

  const [tableOrders, setTableOrders] = useState<Record<number, TableOrder | null>>({
    1: {
      id: 'order-mesa-1',
      tableNumber: 1,
      customerName: 'Família Souza',
      peopleCount: 3,
      openedAt: '12:15',
      discount: 0,
      serviceFeeIncluded: true,
      status: 'aberta',
      items: [
        {
          id: 'item-101',
          menuItemId: 'prod-3',
          name: 'Torresmo de Rolo Pururucado',
          price: 42.00,
          quantity: 1,
          addedAt: '12:20',
          status: 'entregue',
          notes: 'Limão capeta extra'
        },
        {
          id: 'item-102',
          menuItemId: 'prod-6',
          name: 'Cerveja Pilsen 600ml Trincando',
          price: 13.00,
          quantity: 2,
          addedAt: '12:21',
          status: 'entregue'
        },
        {
          id: 'item-103',
          menuItemId: 'prod-7',
          name: 'Guaraná Antarctica Lata 350ml',
          price: 6.50,
          quantity: 1,
          addedAt: '12:22',
          status: 'entregue'
        }
      ]
    },
    3: {
      id: 'order-mesa-3',
      tableNumber: 3,
      customerName: 'Doutor Rogério',
      peopleCount: 4,
      openedAt: '11:45',
      discount: 0,
      serviceFeeIncluded: true,
      status: 'aberta',
      items: [
        {
          id: 'item-301',
          menuItemId: 'prod-1',
          name: 'Marmitex Executivo (Contrafilé)',
          price: 28.00,
          quantity: 2,
          addedAt: '11:50',
          status: 'entregue',
          notes: 'Carne ao ponto'
        },
        {
          id: 'item-302',
          menuItemId: 'prod-2',
          name: 'Feijoada Completa Individual',
          price: 36.00,
          quantity: 2,
          addedAt: '11:52',
          status: 'entregue'
        },
        {
          id: 'item-303',
          menuItemId: 'prod-8',
          name: 'Suco de Laranja Natural 500ml',
          price: 9.00,
          quantity: 4,
          addedAt: '11:55',
          status: 'entregue'
        }
      ]
    },
    5: {
      id: 'order-mesa-5',
      tableNumber: 5,
      customerName: 'Mesa Balcão 5',
      peopleCount: 2,
      openedAt: '12:40',
      discount: 0,
      serviceFeeIncluded: false,
      status: 'aberta',
      items: [
        {
          id: 'item-501',
          menuItemId: 'prod-4',
          name: 'Batata Rústica com Cheddar e Bacon',
          price: 32.00,
          quantity: 1,
          addedAt: '12:42',
          status: 'preparando'
        },
        {
          id: 'item-502',
          menuItemId: 'prod-9',
          name: 'Caipirinha Tradicional de Cachaça',
          price: 18.00,
          quantity: 2,
          addedAt: '12:43',
          status: 'entregue'
        }
      ]
    }
  });

  const [currentCashSession, setCurrentCashSession] = useState<CashRegisterSession>({
    id: 'cash-session-001',
    openedAt: '05/09/2026 10:00',
    isOpen: true,
    operatorName: 'Tiago (Balcão)',
    initialCash: 150.00,
    movements: [
      {
        id: 'mov-1',
        type: 'suprimento',
        amount: 50.00,
        reason: 'Troco extra em moedas de R$ 1,00 trazido do banco',
        timestamp: '10:30',
        operatorName: 'Seu Carlos Silva'
      },
      {
        id: 'mov-2',
        type: 'sangria',
        amount: 35.00,
        reason: 'Compra urgente de 2 sacos de gelo na distribuidora vizinha',
        timestamp: '11:15',
        operatorName: 'Tiago (Balcão)'
      }
    ]
  });

  const [salesHistory, setSalesHistory] = useState<SaleReceipt[]>([
    {
      id: 'rec-901',
      orderNumber: 104,
      type: 'balcao',
      customerName: 'Cliente Rápido',
      openedAt: '11:10',
      closedAt: '11:18',
      items: [
        {
          id: 'item-901',
          menuItemId: 'prod-1',
          name: 'Marmitex Executivo (Contrafilé)',
          price: 28.00,
          quantity: 1,
          addedAt: '11:10',
          status: 'entregue'
        },
        {
          id: 'item-902',
          menuItemId: 'prod-7',
          name: 'Guaraná Antarctica Lata 350ml',
          price: 6.50,
          quantity: 1,
          addedAt: '11:10',
          status: 'entregue'
        }
      ],
      subtotal: 34.50,
      discount: 0,
      serviceFee: 0,
      total: 34.50,
      payments: [
        { method: 'pix', amount: 34.50 }
      ],
      cashierId: 'user-tiago',
      cashierName: 'Tiago (Balcão)'
    },
    {
      id: 'rec-902',
      orderNumber: 105,
      type: 'mesa',
      tableNumber: 2,
      customerName: 'Marcos & Amanda',
      openedAt: '11:20',
      closedAt: '12:05',
      items: [
        {
          id: 'item-903',
          menuItemId: 'prod-5',
          name: 'Pastelzinho de Feira (8 unidades)',
          price: 26.00,
          quantity: 1,
          addedAt: '11:22',
          status: 'entregue'
        },
        {
          id: 'item-904',
          menuItemId: 'prod-6',
          name: 'Cerveja Pilsen 600ml Trincando',
          price: 13.00,
          quantity: 2,
          addedAt: '11:25',
          status: 'entregue'
        }
      ],
      subtotal: 52.00,
      discount: 0,
      serviceFee: 5.20,
      total: 57.20,
      payments: [
        { method: 'debito', amount: 57.20 }
      ],
      cashierId: 'user-carlos',
      cashierName: 'Seu Carlos Silva'
    }
  ]);

  const [activeReceipt, setActiveReceipt] = useState<SaleReceipt | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Carregamento inicial do Supabase
  useEffect(() => {
    let isMounted = true;
    const initSupabaseData = async () => {
      try {
        const cloudData = await SupabaseService.loadAllInitialData(currentCompany?.id);
        if (cloudData && isMounted) {
          setIsCloudConnected(true);
          if (cloudData.businessConfig) setBusinessConfig(cloudData.businessConfig);
          if (cloudData.users && cloudData.users.length > 0) setUsers(cloudData.users);
          if (cloudData.categories && cloudData.categories.length > 0) setCategories(cloudData.categories);
          if (cloudData.menuItems && cloudData.menuItems.length > 0) setMenuItems(cloudData.menuItems);
          if (cloudData.ingredients && cloudData.ingredients.length > 0) setIngredients(cloudData.ingredients);
          if (cloudData.recipes && cloudData.recipes.length > 0) setRecipes(cloudData.recipes);
          if (cloudData.tableOrders) setTableOrders(cloudData.tableOrders);
          if (cloudData.tableStatuses) setTableStatuses(cloudData.tableStatuses);
          if (cloudData.salesHistory) setSalesHistory(cloudData.salesHistory);
          if (cloudData.currentCashSession) setCurrentCashSession(cloudData.currentCashSession);
          if (cloudData.financialEntries) setFinancialEntries(cloudData.financialEntries);
          if (cloudData.wasteLogs) setWasteLogs(cloudData.wasteLogs);
          if (cloudData.masterTips) setMasterTips(cloudData.masterTips);
          
          showToast('Supabase Conectado', 'Dados sincronizados com o banco na nuvem!', 'info');
        }
      } catch (e) {
        console.error('Falha ao inicializar com Supabase:', e);
      }
    };

    initSupabaseData();

    // Ativa inscrição em tempo real (WebSockets / Supabase Realtime)
    const unsubscribeRealtime = SupabaseService.subscribeToRealtime({
      onTableChange: (tableNumber, status, orderData) => {
        setTableStatuses(prev => ({ ...prev, [tableNumber]: status }));
        setTableOrders(prev => ({ ...prev, [tableNumber]: orderData }));
      },
      onSaleChange: (sale) => {
        setSalesHistory(prev => {
          if (prev.some(s => s.id === sale.id)) return prev;
          return [sale, ...prev];
        });
      },
      onCashChange: (session) => {
        setCurrentCashSession(session);
      },
      onMenuChange: (item, isDelete) => {
        if (isDelete) {
          setMenuItems(prev => prev.filter(m => m.id !== item.id));
        } else {
          setMenuItems(prev => {
            const exists = prev.some(m => m.id === item.id);
            if (exists) {
              return prev.map(m => m.id === item.id ? item : m);
            }
            return [item, ...prev];
          });
        }
      },
      onIngredientChange: (ing) => {
        setIngredients(prev => {
          const exists = prev.some(i => i.id === ing.id);
          if (exists) {
            return prev.map(i => i.id === ing.id ? ing : i);
          }
          return [...prev, ing];
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribeRealtime();
    };
  }, []);

  // Persistência local em fallback
  useEffect(() => {
    localStorage.setItem('mesamestre_config', JSON.stringify(businessConfig));
  }, [businessConfig]);

  useEffect(() => {
    localStorage.setItem('mesamestre_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('mesamestre_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  const showToast = (title: string, description: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const updateBusinessConfig = (newConfig: Partial<BusinessConfig>) => {
    const updated = { ...businessConfig, ...newConfig };
    setBusinessConfig(updated);
    SupabaseService.saveBusinessConfig(updated, currentCompany?.id);
    showToast('Configurações Salvas', 'Os dados do estabelecimento foram atualizados.');
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `prod-${Date.now()}`
    };
    setMenuItems(prev => [newItem, ...prev]);
    SupabaseService.saveMenuItem(newItem, currentCompany?.id);
    showToast('Prato Adicionado', `${newItem.name} agora está no seu cardápio!`);
  };

  const updateMenuItem = (id: string, updated: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const nextList = prev.map(item => {
        if (item.id === id) {
          const fullItem = { ...item, ...updated };
          SupabaseService.saveMenuItem(fullItem, currentCompany?.id);
          return fullItem;
        }
        return item;
      });
      return nextList;
    });
    showToast('Cardápio Atualizado', 'Alterações salvas com sucesso.');
  };

  const toggleMenuItemActive = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const next = !item.isActive;
        const updatedItem = { ...item, isActive: next };
        SupabaseService.saveMenuItem(updatedItem, currentCompany?.id);
        showToast(
          next ? 'Item Ativado' : 'Item Pausado', 
          next ? `${item.name} voltou a ficar disponível!` : `${item.name} pausado no cardápio.`
        );
        return updatedItem;
      }
      return item;
    }));
  };

  // Mesas actions
  const openTable = (tableNumber: number, customerName: string = '', peopleCount: number = 2) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newOrder: TableOrder = {
      id: `order-${tableNumber}-${Date.now()}`,
      tableNumber,
      customerName: customerName.trim() || `Mesa ${tableNumber}`,
      peopleCount: peopleCount > 0 ? peopleCount : 1,
      openedAt: timeStr,
      items: [],
      status: 'aberta',
      discount: 0,
      serviceFeeIncluded: true
    };

    setTableOrders(prev => ({
      ...prev,
      [tableNumber]: newOrder
    }));

    setTableStatuses(prev => ({
      ...prev,
      [tableNumber]: 'ocupada'
    }));

    SupabaseService.saveTableState(tableNumber, 'ocupada', newOrder);
    showToast('Mesa Aberta', `Mesa ${tableNumber} pronta para receber pedidos!`);
  };

  const addItemToTable = (
    tableNumber: number, 
    item: MenuItem, 
    quantity: number = 1, 
    notes?: string, 
    selectedOptions?: string[]
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let currentOrder = tableOrders[tableNumber];
    if (!currentOrder) {
      currentOrder = {
        id: `order-${tableNumber}-${Date.now()}`,
        tableNumber,
        customerName: `Mesa ${tableNumber}`,
        peopleCount: 2,
        openedAt: timeStr,
        items: [],
        status: 'aberta',
        discount: 0,
        serviceFeeIncluded: true
      };
    }

    const newOrderItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      notes,
      selectedOptions,
      addedAt: timeStr,
      status: 'enviado_cozinha'
    };

    const updatedOrder: TableOrder = {
      ...currentOrder,
      items: [...currentOrder.items, newOrderItem]
    };

    setTableOrders(prev => ({
      ...prev,
      [tableNumber]: updatedOrder
    }));

    setTableStatuses(prev => ({
      ...prev,
      [tableNumber]: 'ocupada'
    }));

    SupabaseService.saveTableState(tableNumber, 'ocupada', updatedOrder);

    // Baixa automática de estoque se produto for estocado
    if (item.linkedStockId) {
      setIngredients(prev => prev.map(ing => {
        if (ing.id === item.linkedStockId) {
          const updatedStock = Math.max(0, ing.currentStock - quantity);
          const updatedIng = { ...ing, currentStock: updatedStock };
          SupabaseService.saveIngredient(updatedIng);
          if (updatedStock <= ing.minimumStock) {
            showToast('Alerta de Reposição', `${ing.name} atingiu nível baixo (${updatedStock} ${ing.unit})!`, 'warning');
          }
          return updatedIng;
        }
        return ing;
      }));
    }

    showToast('Item Adicionado', `+${quantity}x ${item.name} lançado na Mesa ${tableNumber}!`);
  };

  const removeItemFromTable = (tableNumber: number, orderItemId: string) => {
    setTableOrders(prev => {
      const order = prev[tableNumber];
      if (!order) return prev;
      const updatedOrder = {
        ...order,
        items: order.items.filter(it => it.id !== orderItemId)
      };
      SupabaseService.saveTableState(tableNumber, tableStatuses[tableNumber] || 'ocupada', updatedOrder);
      return {
        ...prev,
        [tableNumber]: updatedOrder
      };
    });
    showToast('Item Removido', 'Item cancelado da comanda.');
  };

  const setTableStatus = (tableNumber: number, status: TableStatus) => {
    setTableStatuses(prev => ({ ...prev, [tableNumber]: status }));
    SupabaseService.saveTableState(tableNumber, status, tableOrders[tableNumber]);
  };

  const transferTable = (fromTable: number, toTable: number) => {
    const sourceOrder = tableOrders[fromTable];
    if (!sourceOrder) {
      showToast('Erro', `Mesa ${fromTable} não possui comanda ativa.`, 'error');
      return;
    }

    const updatedTargetOrder = { ...sourceOrder, tableNumber: toTable };

    setTableOrders(prev => ({
      ...prev,
      [toTable]: updatedTargetOrder,
      [fromTable]: null
    }));

    setTableStatuses(prev => ({
      ...prev,
      [toTable]: 'ocupada',
      [fromTable]: 'livre'
    }));

    SupabaseService.saveTableState(fromTable, 'livre', null);
    SupabaseService.saveTableState(toTable, 'ocupada', updatedTargetOrder);

    showToast('Mesa Transferida', `Comanda movida da Mesa ${fromTable} para a Mesa ${toTable} com sucesso!`);
  };

  const closeTableOrder = (
    tableNumber: number, 
    payments: PaymentRecord[], 
    discount: number = 0, 
    includeService: boolean = true
  ): SaleReceipt => {
    const order = tableOrders[tableNumber];
    if (!order) {
      throw new Error('Comanda não encontrada');
    }

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFee = includeService ? (subtotal * (businessConfig.serviceChargePercentage / 100)) : 0;
    const total = Math.max(0, subtotal - discount + serviceFee);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const receipt: SaleReceipt = {
      id: `rec-${Date.now()}`,
      orderNumber: salesHistory.length + 101,
      type: 'mesa',
      tableNumber,
      customerName: order.customerName,
      openedAt: order.openedAt,
      closedAt: timeStr,
      items: order.items,
      subtotal,
      discount,
      serviceFee,
      total,
      payments,
      cashierId: currentUser?.id || 'admin',
      cashierName: currentUser?.name || 'Seu Carlos Silva'
    };

    setSalesHistory(prev => [receipt, ...prev]);
    setTableOrders(prev => ({ ...prev, [tableNumber]: null }));
    setTableStatuses(prev => ({ ...prev, [tableNumber]: 'livre' }));
    setActiveReceipt(receipt);

    SupabaseService.saveSaleReceipt(receipt, currentCompany?.id);
    SupabaseService.saveTableState(tableNumber, 'livre', null, currentCompany?.id);

    showToast('Conta Fechada!', `Mesa ${tableNumber} finalizada com sucesso. Recibo emitido!`);
    return receipt;
  };

  const finalizeQuickSale = (
    items: OrderItem[], 
    payments: PaymentRecord[], 
    customerName?: string, 
    discount: number = 0
  ): SaleReceipt => {
    const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const total = Math.max(0, subtotal - discount);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const receipt: SaleReceipt = {
      id: `rec-${Date.now()}`,
      orderNumber: salesHistory.length + 101,
      type: 'balcao',
      customerName: customerName || 'Balcão Rápido',
      openedAt: timeStr,
      closedAt: timeStr,
      items,
      subtotal,
      discount,
      serviceFee: 0,
      total,
      payments,
      cashierId: currentUser?.id || 'balcao',
      cashierName: currentUser?.name || 'Tiago (Balcão)'
    };

    // Baixa de estoque para itens vendidos
    items.forEach(it => {
      const menuProd = menuItems.find(m => m.id === it.menuItemId);
      if (menuProd?.linkedStockId) {
        setIngredients(prev => prev.map(ing => {
          if (ing.id === menuProd.linkedStockId) {
            const updated = { ...ing, currentStock: Math.max(0, ing.currentStock - it.quantity) };
            SupabaseService.saveIngredient(updated, currentCompany?.id);
            return updated;
          }
          return ing;
        }));
      }
    });

    setSalesHistory(prev => [receipt, ...prev]);
    setActiveReceipt(receipt);
    SupabaseService.saveSaleReceipt(receipt, currentCompany?.id);

    showToast('Venda Concluída', `Venda rápida de ${formatCurrency(total)} registrada no balcão!`);
    return receipt;
  };

  // Caixa & Movimentações
  const addCashMovement = (type: 'sangria' | 'suprimento', amount: number, reason: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMov: CashMovement = {
      id: `mov-${Date.now()}`,
      type,
      amount,
      reason,
      timestamp: timeStr,
      operatorName: currentUser?.name || 'Operador'
    };

    const updatedSession = {
      ...currentCashSession,
      movements: [...currentCashSession.movements, newMov]
    };

    setCurrentCashSession(updatedSession);
    SupabaseService.saveCashSession(updatedSession, currentCompany?.id);

    showToast(
      type === 'sangria' ? 'Sangria Realizada' : 'Suprimento Registrado',
      `${type === 'sangria' ? 'Retirada' : 'Entrada'} de ${formatCurrency(amount)}: "${reason}"`
    );
  };

  const performBlindClose = (counts: BlindCashCount) => {
    let cashSales = 0;
    let pixSales = 0;
    let debitSales = 0;
    let creditSales = 0;

    salesHistory.forEach(rec => {
      rec.payments.forEach(p => {
        if (p.method === 'dinheiro') cashSales += p.amount;
        if (p.method === 'pix') pixSales += p.amount;
        if (p.method === 'debito') debitSales += p.amount;
        if (p.method === 'credito') creditSales += p.amount;
      });
    });

    let supplements = 0;
    let withdrawals = 0;
    currentCashSession.movements.forEach(m => {
      if (m.type === 'suprimento') supplements += m.amount;
      if (m.type === 'sangria') withdrawals += m.amount;
    });

    const cashExpected = currentCashSession.initialCash + cashSales + supplements - withdrawals;
    const totalCountedInDrawer = counts.countedCash + counts.countedCoins;
    const cashDiff = totalCountedInDrawer - cashExpected;
    const pixDiff = counts.countedPix - pixSales;
    const cardDiff = (counts.countedDebit + counts.countedCredit) - (debitSales + creditSales);
    const overallDiff = cashDiff + pixDiff + cardDiff;

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const closedSession: CashRegisterSession = {
      ...currentCashSession,
      isOpen: false,
      closedAt: timeStr,
      blindClose: counts,
      systemTotalsAtClose: {
        cashExpected,
        pixExpected: pixSales,
        debitExpected: debitSales,
        creditExpected: creditSales,
        totalSales: cashSales + pixSales + debitSales + creditSales,
        supplements,
        withdrawals
      },
      discrepancies: {
        cashDiff,
        pixDiff,
        cardDiff,
        overallDiff
      }
    };

    setCurrentCashSession(closedSession);
    SupabaseService.saveCashSession(closedSession, currentCompany?.id);

    showToast('Caixa Fechado com Sucesso', 'Conferência cega realizada. Relatório de auditoria pronto para o Carlos!');
  };

  const reopenCashSession = (initialCash: number) => {
    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSession: CashRegisterSession = {
      id: `cash-session-${Date.now()}`,
      openedAt: timeStr,
      isOpen: true,
      operatorName: currentUser?.name || 'Operador',
      initialCash: initialCash || businessConfig.initialCashDefault,
      movements: []
    };

    setCurrentCashSession(newSession);
    SupabaseService.saveCashSession(newSession, currentCompany?.id);

    showToast('Caixa Aberto!', `Turno iniciado com troco de ${formatCurrency(initialCash)}.`);
  };

  // Estoque e Perdas
  const restockIngredient = (id: string, addedQty: number, totalCostPaid?: number) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const newStock = ing.currentStock + addedQty;
        const newUnitCost = totalCostPaid ? (totalCostPaid / addedQty) : ing.unitCost;
        const updated = {
          ...ing,
          currentStock: newStock,
          unitCost: newUnitCost,
          lastRestockedDate: 'Hoje'
        };
        SupabaseService.saveIngredient(updated, currentCompany?.id);
        return updated;
      }
      return ing;
    }));
    showToast('Entrada de Estoque', `Reposição de ${addedQty} confirmada!`);
  };

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    const newIng: Ingredient = {
      ...ingredient,
      id: `ing-${Date.now()}`
    };
    setIngredients(prev => [...prev, newIng]);
    SupabaseService.saveIngredient(newIng, currentCompany?.id);
    showToast('Insumo Cadastrado', `${newIng.name} adicionado ao controle de insumos!`);
  };

  const updateIngredient = (id: string, data: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(it => {
      if (it.id === id) {
        const updated = { ...it, ...data };
        SupabaseService.saveIngredient(updated, currentCompany?.id);
        return updated;
      }
      return it;
    }));
    showToast('Insumo Atualizado', 'Dados do ingrediente salvos.');
  };

  const registerWaste = (data: Omit<WasteLog, 'id' | 'date'>) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newWaste: WasteLog = {
      ...data,
      id: `waste-${Date.now()}`,
      date: dateStr
    };

    setWasteLogs(prev => [newWaste, ...prev]);
    SupabaseService.saveWasteLog(newWaste, currentCompany?.id);

    // Reduz do estoque correspondente se encontrado
    setIngredients(prev => prev.map(ing => {
      if (ing.name.toLowerCase().includes(data.itemName.toLowerCase())) {
        const updated = { ...ing, currentStock: Math.max(0, ing.currentStock - data.quantity) };
        SupabaseService.saveIngredient(updated, currentCompany?.id);
        return updated;
      }
      return ing;
    }));

    showToast('Perda Registrada', `${data.quantity} ${data.unit} de ${data.itemName} registrado no controle de perdas.`);
  };

  const updateRecipe = (recipe: Recipe) => {
    setRecipes(prev => {
      const idx = prev.findIndex(r => r.menuItemId === recipe.menuItemId);
      let updatedList: Recipe[];
      if (idx >= 0) {
        updatedList = [...prev];
        updatedList[idx] = recipe;
      } else {
        updatedList = [...prev, recipe];
      }
      SupabaseService.saveRecipe(recipe, currentCompany?.id);
      return updatedList;
    });

    const rawCost = recipe.ingredients.reduce((sum, item) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return sum + (ing ? (ing.unitCost * item.quantityNeeded) : 0);
    }, 0);
    const withWaste = rawCost * (1 + (recipe.wasteAllowancePercent / 100));
    const totalCost = withWaste + recipe.laborCostEstimate;

    setMenuItems(prev => prev.map(m => {
      if (m.id === recipe.menuItemId) {
        const updatedItem = { ...m, costPrice: Number(totalCost.toFixed(2)) };
        SupabaseService.saveMenuItem(updatedItem, currentCompany?.id);
        return updatedItem;
      }
      return m;
    }));

    showToast('Ficha Técnica Salva', 'Custo unitário e margem recalculados automaticamente!');
  };

  // Financeiro
  const addFinancialEntry = (entry: Omit<FinancialEntry, 'id'>) => {
    const newEntry: FinancialEntry = {
      ...entry,
      id: `fin-${Date.now()}`
    };
    setFinancialEntries(prev => [newEntry, ...prev]);
    SupabaseService.saveFinancialEntry(newEntry, currentCompany?.id);
    showToast('Lançamento Financeiro', `${entry.type === 'receita' ? 'Receita' : 'Despesa'} de ${formatCurrency(entry.amount)} cadastrada.`);
  };

  const toggleFinancialStatus = (id: string) => {
    setFinancialEntries(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'pago' ? 'pendente' : 'pago';
        const paidDate = nextStatus === 'pago' ? 'Hoje' : undefined;
        const updated = { ...item, status: nextStatus, paidDate };
        SupabaseService.saveFinancialEntry(updated, currentCompany?.id);
        showToast(
          nextStatus === 'pago' ? 'Conta Marcada como Paga' : 'Conta Marcada como Pendente',
          `${item.description} - ${formatCurrency(item.amount)}`
        );
        return updated;
      }
      return item;
    }));
  };

  const deleteFinancialEntry = (id: string) => {
    setFinancialEntries(prev => prev.filter(f => f.id !== id));
    SupabaseService.deleteFinancialEntry(id, currentCompany?.id);
    showToast('Lançamento Removido', 'Item excluído do livro caixa.');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      activeScreen,
      setActiveScreen,
      businessConfig,
      updateBusinessConfig,
      isCloudConnected,
      categories,
      menuItems,
      addMenuItem,
      updateMenuItem,
      toggleMenuItemActive,
      tableOrders,
      tableStatuses,
      openTable,
      addItemToTable,
      removeItemFromTable,
      setTableStatus,
      transferTable,
      closeTableOrder,
      finalizeQuickSale,
      currentCashSession,
      addCashMovement,
      performBlindClose,
      reopenCashSession,
      salesHistory,
      activeReceipt,
      setActiveReceipt,
      ingredients,
      recipes,
      wasteLogs,
      restockIngredient,
      addIngredient,
      updateIngredient,
      registerWaste,
      updateRecipe,
      financialEntries,
      addFinancialEntry,
      toggleFinancialStatus,
      deleteFinancialEntry,
      masterTips,
      toasts,
      showToast,
      dismissToast,
      formatCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
