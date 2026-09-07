import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
  TableOrder,
  SaleReceipt,
  CashRegisterSession,
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

export const SupabaseService = {
  // Inicialização e Carga com Seed automático caso banco esteja vazio
  async loadAllInitialData() {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      // 1. Configuração do Negócio
      const { data: configData, error: configError } = await supabase
        .from('mm_business_config')
        .select('data')
        .eq('id', 'default')
        .maybeSingle();

      let businessConfig: BusinessConfig | null = null;
      if (configData?.data) {
        businessConfig = configData.data as BusinessConfig;
      } else {
        await supabase.from('mm_business_config').upsert({ id: 'default', data: INITIAL_BUSINESS_CONFIG });
        businessConfig = INITIAL_BUSINESS_CONFIG;
      }

      // 2. Usuários
      let { data: usersData } = await supabase.from('mm_users').select('*');
      let users: UserProfile[] = [];
      if (usersData && usersData.length > 0) {
        users = usersData.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          pin: u.pin,
          avatarColor: u.avatar_color || 'bg-[#1E4B75]',
          tag: u.tag || '',
        }));
      } else {
        const toInsert = INITIAL_USERS.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          pin: u.pin,
          avatar_color: u.avatarColor,
          tag: u.tag
        }));
        await supabase.from('mm_users').upsert(toInsert);
        users = INITIAL_USERS;
      }

      // 3. Categorias
      let { data: catData } = await supabase.from('mm_categories').select('*');
      let categories: Category[] = [];
      if (catData && catData.length > 0) {
        categories = catData.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color
        }));
      } else {
        await supabase.from('mm_categories').upsert(INITIAL_CATEGORIES);
        categories = INITIAL_CATEGORIES;
      }

      // 4. Itens do Cardápio
      let { data: menuData } = await supabase.from('mm_menu_items').select('*');
      let menuItems: MenuItem[] = [];
      if (menuData && menuData.length > 0) {
        menuItems = menuData.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description || '',
          price: Number(m.price),
          categoryId: m.category_id,
          unit: m.unit || 'un',
          imageUrl: m.image_url,
          isActive: m.is_active,
          costPrice: Number(m.cost_price || 0),
          stockTracked: Boolean(m.stock_tracked),
          linkedStockId: m.linked_stock_id,
          prepTimeMinutes: m.prep_time_minutes,
          allergens: m.allergens || [],
          options: m.options || []
        }));
      } else {
        const toInsert = INITIAL_MENU_ITEMS.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          category_id: m.categoryId,
          unit: m.unit,
          image_url: m.imageUrl,
          is_active: m.isActive,
          cost_price: m.costPrice,
          stock_tracked: m.stockTracked,
          linked_stock_id: m.linkedStockId,
          prep_time_minutes: m.prepTimeMinutes,
          allergens: m.allergens,
          options: m.options
        }));
        await supabase.from('mm_menu_items').upsert(toInsert);
        menuItems = INITIAL_MENU_ITEMS;
      }

      // 5. Insumos (Ingredientes)
      let { data: ingData } = await supabase.from('mm_ingredients').select('*');
      let ingredients: Ingredient[] = [];
      if (ingData && ingData.length > 0) {
        ingredients = ingData.map(i => ({
          id: i.id,
          name: i.name,
          unit: i.unit as any,
          packageCost: Number(i.package_cost || 0),
          packageQuantity: Number(i.package_quantity || 1),
          unitCost: Number(i.cost_per_unit || i.unit_cost || 0),
          currentStock: Number(i.current_stock || 0),
          minimumStock: Number(i.min_stock || i.minimum_stock || 0),
          supplier: i.supplier,
          lastRestockedDate: i.last_restocked || i.last_restocked_date
        }));
      } else {
        const toInsert = INITIAL_INGREDIENTS.map(i => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          current_stock: i.currentStock,
          min_stock: i.minimumStock,
          cost_per_unit: i.unitCost,
          supplier: i.supplier,
          last_restocked: i.lastRestockedDate
        }));
        await supabase.from('mm_ingredients').upsert(toInsert);
        ingredients = INITIAL_INGREDIENTS;
      }

      // 6. Fichas Técnicas (Receitas)
      let { data: recipeData } = await supabase.from('mm_recipes').select('*');
      let recipes: Recipe[] = [];
      if (recipeData && recipeData.length > 0) {
        recipes = recipeData.map(r => ({
          id: r.id,
          menuItemId: r.menu_item_id,
          ingredients: r.items || r.ingredients || [],
          wasteAllowancePercent: Number(r.waste_allowance_percent || 10),
          laborCostEstimate: Number(r.labor_cost_estimate || 0),
          suggestedMarkup: Number(r.suggested_markup || 2.8)
        }));
      } else {
        const toInsert = INITIAL_RECIPES.map(r => ({
          id: r.id,
          menu_item_id: r.menuItemId,
          items: r.ingredients,
          created_at: new Date().toISOString()
        }));
        await supabase.from('mm_recipes').upsert(toInsert);
        recipes = INITIAL_RECIPES;
      }

      // 7. Mesas e Comandas
      let { data: tableData } = await supabase.from('mm_table_orders').select('*');
      const tableOrders: Record<number, TableOrder | null> = {};
      const tableStatuses: Record<number, TableStatus> = {};
      
      if (tableData && tableData.length > 0) {
        tableData.forEach(t => {
          tableStatuses[t.table_number] = t.status as TableStatus;
          tableOrders[t.table_number] = t.order_data as TableOrder | null;
        });
      }

      // 8. Histórico de Vendas
      let { data: salesData } = await supabase
        .from('mm_sales_history')
        .select('*')
        .order('closed_at', { ascending: false })
        .limit(100);

      let salesHistory: SaleReceipt[] = [];
      if (salesData && salesData.length > 0) {
        salesHistory = salesData.map(s => ({
          id: s.id,
          orderNumber: s.order_number,
          type: s.type as any,
          tableNumber: s.table_number,
          customerName: s.customer_name,
          openedAt: s.opened_at,
          closedAt: s.closed_at,
          items: s.items || [],
          subtotal: Number(s.subtotal),
          discount: Number(s.discount),
          serviceFee: Number(s.service_fee),
          total: Number(s.total),
          payments: s.payments || [],
          cashierId: s.cashier_id,
          cashierName: s.cashier_name
        }));
      }

      // 9. Caixa Atual (Sessão Aberta)
      let { data: cashData } = await supabase
        .from('mm_cash_sessions')
        .select('*')
        .eq('is_open', true)
        .order('opened_at', { ascending: false })
        .limit(1);

      let currentCashSession: CashRegisterSession | null = null;
      if (cashData && cashData.length > 0) {
        const c = cashData[0];
        currentCashSession = {
          id: c.id,
          openedAt: c.opened_at,
          closedAt: c.closed_at,
          isOpen: c.is_open,
          operatorName: c.operator_name,
          initialCash: Number(c.initial_cash),
          movements: c.movements || [],
          blindClose: c.blind_close,
          systemTotalsAtClose: c.system_totals_at_close
        };
      }

      // 10. Lançamentos Financeiros
      let { data: finData } = await supabase.from('mm_financial_entries').select('*').order('date', { ascending: false });
      let financialEntries: FinancialEntry[] = [];
      if (finData && finData.length > 0) {
        financialEntries = finData.map(f => ({
          id: f.id,
          description: f.description,
          type: f.type as any,
          category: f.category as any,
          amount: Number(f.amount),
          dueDate: f.due_date || f.date,
          paidDate: f.status === 'pago' ? f.date : undefined,
          status: f.status as any,
          supplierOrCustomer: f.supplier_or_customer || f.payment_method
        }));
      } else {
        const toInsert = INITIAL_FINANCIAL_ENTRIES.map(f => ({
          id: f.id,
          type: f.type,
          category: f.category,
          description: f.description,
          amount: f.amount,
          date: f.dueDate,
          due_date: f.dueDate,
          status: f.status,
          payment_method: f.supplierOrCustomer
        }));
        await supabase.from('mm_financial_entries').upsert(toInsert);
        financialEntries = INITIAL_FINANCIAL_ENTRIES;
      }

      // 11. Perdas (Waste Logs)
      let { data: wasteData } = await supabase.from('mm_waste_logs').select('*').order('date', { ascending: false });
      let wasteLogs: WasteLog[] = [];
      if (wasteData && wasteData.length > 0) {
        wasteLogs = wasteData.map(w => ({
          id: w.id,
          date: w.date,
          itemName: w.ingredient_name,
          quantity: Number(w.quantity),
          unit: w.unit,
          estimatedCost: Number(w.estimated_cost),
          reason: w.reason as any,
          notes: '',
          registeredBy: w.reported_by
        }));
      }

      // 12. Dicas do Mestre
      let { data: tipsData } = await supabase.from('mm_master_tips').select('*');
      let masterTips: MasterTip[] = [];
      if (tipsData && tipsData.length > 0) {
        masterTips = tipsData.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category as any,
          shortDesc: t.content.slice(0, 80) + '...',
          fullTip: t.content,
          iconName: 'Sparkles',
          badge: t.impact_level || 'Dica Prática'
        }));
      } else {
        masterTips = INITIAL_MASTER_TIPS;
      }

      return {
        businessConfig,
        users,
        categories,
        menuItems,
        ingredients,
        recipes,
        tableOrders: Object.keys(tableOrders).length > 0 ? tableOrders : null,
        tableStatuses: Object.keys(tableStatuses).length > 0 ? tableStatuses : null,
        salesHistory: salesHistory.length > 0 ? salesHistory : null,
        currentCashSession,
        financialEntries: financialEntries.length > 0 ? financialEntries : null,
        wasteLogs: wasteLogs.length > 0 ? wasteLogs : null,
        masterTips
      };
    } catch (err) {
      console.error('Erro ao sincronizar dados com Supabase:', err);
      return null;
    }
  },

  // Sincronizações específicas para mutações
  async saveBusinessConfig(config: BusinessConfig) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_business_config').upsert({ id: 'default', data: config, updated_at: new Date().toISOString() });
    } catch (e) {
      console.error('Erro ao salvar business_config no Supabase:', e);
    }
  },

  async saveMenuItem(item: MenuItem) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_menu_items').upsert({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.categoryId,
        unit: item.unit,
        image_url: item.imageUrl,
        is_active: item.isActive,
        cost_price: item.costPrice,
        stock_tracked: item.stockTracked,
        linked_stock_id: item.linkedStockId,
        prep_time_minutes: item.prepTimeMinutes,
        allergens: item.allergens,
        options: item.options
      });
    } catch (e) {
      console.error('Erro ao salvar item de menu no Supabase:', e);
    }
  },

  async saveIngredient(ing: Ingredient) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_ingredients').upsert({
        id: ing.id,
        name: ing.name,
        unit: ing.unit,
        current_stock: ing.currentStock,
        min_stock: ing.minimumStock,
        cost_per_unit: ing.unitCost,
        supplier: ing.supplier,
        last_restocked: ing.lastRestockedDate
      });
    } catch (e) {
      console.error('Erro ao salvar ingrediente no Supabase:', e);
    }
  },

  async saveRecipe(recipe: Recipe) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_recipes').upsert({
        id: recipe.id,
        menu_item_id: recipe.menuItemId,
        items: recipe.ingredients
      });
    } catch (e) {
      console.error('Erro ao salvar receita no Supabase:', e);
    }
  },

  async saveTableState(tableNumber: number, status: TableStatus, order: TableOrder | null) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_table_orders').upsert({
        table_number: tableNumber,
        status: status,
        order_data: order,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.error('Erro ao salvar estado da mesa no Supabase:', e);
    }
  },

  async saveSaleReceipt(receipt: SaleReceipt) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_sales_history').upsert({
        id: receipt.id,
        order_number: receipt.orderNumber,
        type: receipt.type,
        table_number: receipt.tableNumber,
        customer_name: receipt.customerName,
        opened_at: receipt.openedAt,
        closed_at: receipt.closedAt,
        items: receipt.items,
        subtotal: receipt.subtotal,
        discount: receipt.discount,
        service_fee: receipt.serviceFee,
        total: receipt.total,
        payments: receipt.payments,
        cashier_id: receipt.cashierId,
        cashier_name: receipt.cashierName
      });
    } catch (e) {
      console.error('Erro ao salvar venda no Supabase:', e);
    }
  },

  async saveCashSession(session: CashRegisterSession) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_cash_sessions').upsert({
        id: session.id,
        opened_at: session.openedAt,
        closed_at: session.closedAt,
        is_open: session.isOpen,
        operator_name: session.operatorName,
        initial_cash: session.initialCash,
        movements: session.movements,
        blind_close: session.blindClose,
        system_totals_at_close: session.systemTotalsAtClose
      });
    } catch (e) {
      console.error('Erro ao salvar sessão de caixa no Supabase:', e);
    }
  },

  async saveFinancialEntry(entry: FinancialEntry) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_financial_entries').upsert({
        id: entry.id,
        type: entry.type,
        category: entry.category,
        description: entry.description,
        amount: entry.amount,
        date: entry.dueDate,
        due_date: entry.dueDate,
        status: entry.status,
        payment_method: entry.supplierOrCustomer
      });
    } catch (e) {
      console.error('Erro ao salvar lançamento financeiro no Supabase:', e);
    }
  },

  async deleteFinancialEntry(id: string) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_financial_entries').delete().eq('id', id);
    } catch (e) {
      console.error('Erro ao excluir lançamento financeiro no Supabase:', e);
    }
  },

  async saveWasteLog(waste: WasteLog) {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('mm_waste_logs').upsert({
        id: waste.id,
        ingredient_id: waste.id,
        ingredient_name: waste.itemName,
        quantity: waste.quantity,
        unit: waste.unit,
        estimated_cost: waste.estimatedCost,
        reason: waste.reason,
        reported_by: waste.registeredBy,
        date: waste.date
      });
    } catch (e) {
      console.error('Erro ao salvar registro de perda no Supabase:', e);
    }
  }
};
