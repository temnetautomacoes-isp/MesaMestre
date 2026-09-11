import { 
  UserProfile, 
  BusinessConfig, 
  Category, 
  MenuItem, 
  Ingredient, 
  Recipe, 
  FinancialEntry, 
  MasterTip 
} from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-carlos',
    name: 'Seu Carlos Silva',
    role: 'dono',
    pin: '1234',
    avatarColor: 'bg-[#1E4B75]',
    tag: 'Proprietário & Gestor',
  },
  {
    id: 'user-tiago',
    name: 'Tiago (Balcão)',
    role: 'balcao',
    pin: '1111',
    avatarColor: 'bg-[#0E7490]',
    tag: 'Operador de Caixa',
  },
  {
    id: 'user-lucas',
    name: 'Lucas (Garçom)',
    role: 'garcom',
    pin: '2222',
    avatarColor: 'bg-[#10B981]',
    tag: 'Atendimento Salão',
  },
  {
    id: 'user-bete',
    name: 'Dona Bete',
    role: 'cozinha',
    pin: '3333',
    avatarColor: 'bg-[#F59E0B]',
    tag: 'Cozinheira Chefe',
  }
];

export const INITIAL_BUSINESS_CONFIG: BusinessConfig = {
  name: 'Boteco & Restaurante Sabor da Vila',
  legalName: 'Sabor da Vila Gastronomia Ltda',
  cnpj: '12.345.678/0001-90',
  ie: '123.456.789.000',
  ownerName: 'Carlos Silva',
  type: 'restaurante_caseiro',
  phone: '(19) 99876-5432',
  address: 'Rua Nove de Julho, 1420',
  neighborhood: 'Centro',
  city: 'Araraquara',
  state: 'SP',
  cep: '14800-000',
  footerMessage: 'Obrigado pela preferência! Volte sempre :)',
  printSettings: {
    showLogo: true,
    showName: true,
    showLegalName: false,
    showCnpj: true,
    showIe: false,
    showPhone: true,
    showAddress: true,
    showCityState: true,
    showCep: false,
    showFooterMessage: true,
  },
  tableCount: 10,
  rates: {
    pix: 0.0,
    debito: 1.49,
    credito: 3.19,
    dinheiro: 0.0,
  },
  initialCashDefault: 150.00,
  serviceChargePercentage: 10,
  isSetupComplete: true,
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-marmitas', name: 'Marmitas & Almoço', icon: 'UtensilsCrossed', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'cat-porcoes', name: 'Porções de Boteco', icon: 'Flame', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'cat-pratos', name: 'Pratos da Casa', icon: 'Soup', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'cat-bebidas', name: 'Cervejas & Bebidas', icon: 'Beer', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'cat-doses', name: 'Drinks & Doses', icon: 'Wine', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'cat-sobremesas', name: 'Sobremesas da Bete', icon: 'Cake', color: 'bg-rose-100 text-rose-800 border-rose-300' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'prod-1',
    name: 'Marmitex Executivo (Contrafilé)',
    description: 'Bife acebolado suculento, arroz soltinho, feijão caseiro, fritas crocantes e farofa temperada.',
    price: 28.00,
    costPrice: 9.80,
    categoryId: 'cat-marmitas',
    unit: 'marmita',
    isActive: true,
    stockTracked: false,
    prepTimeMinutes: 12,
    allergens: ['Glúten (farofa)'],
    options: [
      {
        title: 'Ponto da Carne',
        items: [
          { name: 'Ao Ponto', additionalPrice: 0 },
          { name: 'Bem Passado', additionalPrice: 0 },
          { name: 'Mal Passado', additionalPrice: 0 },
        ]
      },
      {
        title: 'Turbinar Almoço',
        items: [
          { name: 'Ovo Frito Estalado', additionalPrice: 3.50 },
          { name: 'Feijão Tropeiro Extra', additionalPrice: 5.00 },
        ]
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Feijoada Completa Individual',
    description: 'Feijão preto com carnes nobres, couve refogada no alho, bisteca grelhada, torresmo, arroz e laranja.',
    price: 36.00,
    costPrice: 11.40,
    categoryId: 'cat-marmitas',
    unit: 'prato',
    isActive: true,
    stockTracked: false,
    prepTimeMinutes: 15,
  },
  {
    id: 'prod-3',
    name: 'Torresmo de Rolo Pururucado',
    description: '500g de panceta enrolada e marinada na cachaça, crocante por fora e macia por dentro. Acompanha limão capeta.',
    price: 42.00,
    costPrice: 14.50,
    categoryId: 'cat-porcoes',
    unit: 'porção',
    isActive: true,
    stockTracked: false,
    prepTimeMinutes: 18,
  },
  {
    id: 'prod-4',
    name: 'Batata Rústica com Cheddar e Bacon',
    description: 'Batata temperada com páprica e alecrim, coberta com creme de cheddar cremoso e cubos de bacon dourados.',
    price: 32.00,
    costPrice: 8.90,
    categoryId: 'cat-porcoes',
    unit: 'porção',
    isActive: true,
    stockTracked: false,
    prepTimeMinutes: 10,
  },
  {
    id: 'prod-5',
    name: 'Pastelzinho de Feira (8 unidades)',
    description: 'Metade carne moída sequinha bem temperada e metade queijo meia cura derretido. Molho de pimenta da casa.',
    price: 26.00,
    costPrice: 6.20,
    categoryId: 'cat-porcoes',
    unit: 'porção',
    isActive: true,
    stockTracked: false,
    prepTimeMinutes: 8,
  },
  {
    id: 'prod-6',
    name: 'Cerveja Pilsen 600ml Trincando',
    description: 'Servida no balde com gelo e sal grosso, garrafa estalando de gelada.',
    price: 13.00,
    costPrice: 6.50,
    categoryId: 'cat-bebidas',
    unit: 'garrafa',
    isActive: true,
    stockTracked: true,
    linkedStockId: 'ing-cerveja-600',
  },
  {
    id: 'prod-7',
    name: 'Guaraná Antarctica Lata 350ml',
    description: 'Lata bem gelada, servida com copo americano e gelo e limão a gosto.',
    price: 6.50,
    costPrice: 2.80,
    categoryId: 'cat-bebidas',
    unit: 'un',
    isActive: true,
    stockTracked: true,
    linkedStockId: 'ing-guarana-lata',
  },
  {
    id: 'prod-8',
    name: 'Suco de Laranja Natural 500ml',
    description: 'Espremido na hora com laranjas frescas selecionadas. Sem conservantes.',
    price: 9.00,
    costPrice: 2.30,
    categoryId: 'cat-bebidas',
    unit: 'copo',
    isActive: true,
    stockTracked: false,
  },
  {
    id: 'prod-9',
    name: 'Caipirinha Tradicional de Cachaça',
    description: 'Limão tahiti espremido na hora com açúcar refinado e cachaça artesanal envelhecida em barril de umburana.',
    price: 18.00,
    costPrice: 4.10,
    categoryId: 'cat-doses',
    unit: 'copo',
    isActive: true,
    stockTracked: false,
  },
  {
    id: 'prod-10',
    name: 'Pudim de Leite da Dona Bete',
    description: 'Fatia generosa, sem furinhos, extremamente aveludada com calda dourada de caramelo artesanal.',
    price: 10.00,
    costPrice: 2.90,
    categoryId: 'cat-sobremesas',
    unit: 'fatia',
    isActive: true,
    stockTracked: false,
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-contrafile',
    name: 'Contrafilé Bovino Resfriado',
    unit: 'kg',
    packageCost: 195.00,
    packageQuantity: 5,
    unitCost: 39.00,
    currentStock: 14.5,
    minimumStock: 10.0,
    supplier: 'Frigorífico Boi Gordo',
    lastRestockedDate: '04/09/2026',
  },
  {
    id: 'ing-feijao',
    name: 'Feijão Preto Tipo 1',
    unit: 'kg',
    packageCost: 44.00,
    packageQuantity: 5,
    unitCost: 8.80,
    currentStock: 18.0,
    minimumStock: 12.0,
    supplier: 'Distribuidora Cereais Brasil',
    lastRestockedDate: '02/09/2026',
  },
  {
    id: 'ing-arroz',
    name: 'Arroz Branco Tipo 1 5kg',
    unit: 'kg',
    packageCost: 145.00,
    packageQuantity: 25,
    unitCost: 5.80,
    currentStock: 32.0,
    minimumStock: 20.0,
    supplier: 'Distribuidora Cereais Brasil',
    lastRestockedDate: '02/09/2026',
  },
  {
    id: 'ing-panceta',
    name: 'Panceta Suína Inteira (P/ Torresmo)',
    unit: 'kg',
    packageCost: 184.00,
    packageQuantity: 8,
    unitCost: 23.00,
    currentStock: 6.2,
    minimumStock: 8.0, // Alerta: abaixo do mínimo!
    supplier: 'Frigorífico Boi Gordo',
    lastRestockedDate: '01/09/2026',
  },
  {
    id: 'ing-batata',
    name: 'Batata Especial Pré-Frita (Saco)',
    unit: 'kg',
    packageCost: 75.00,
    packageQuantity: 6,
    unitCost: 12.50,
    currentStock: 4.0, // Alerta: quase acabando!
    minimumStock: 10.0,
    supplier: 'Distribuidora Frituras & Cia',
    lastRestockedDate: '28/08/2026',
  },
  {
    id: 'ing-queijo',
    name: 'Queijo Mussarela Barra',
    unit: 'kg',
    packageCost: 168.00,
    packageQuantity: 4,
    unitCost: 42.00,
    currentStock: 5.5,
    minimumStock: 4.0,
    supplier: 'Laticínios Vale Verde',
    lastRestockedDate: '03/09/2026',
  },
  {
    id: 'ing-bacon',
    name: 'Bacon Defumado Especial',
    unit: 'kg',
    packageCost: 116.00,
    packageQuantity: 4,
    unitCost: 29.00,
    currentStock: 7.0,
    minimumStock: 3.5,
    supplier: 'Laticínios Vale Verde',
    lastRestockedDate: '03/09/2026',
  },
  {
    id: 'ing-embalagem-marmita',
    name: 'Embalagem Térmica Marmitex 3 Divisões',
    unit: 'un',
    packageCost: 65.00,
    packageQuantity: 100,
    unitCost: 0.65,
    currentStock: 45, // Alerta: comprar logo!
    minimumStock: 80,
    supplier: 'Plásticos & Descartáveis Silva',
    lastRestockedDate: '25/08/2026',
  },
  {
    id: 'ing-cerveja-600',
    name: 'Cerveja Pilsen 600ml (Caixa 24un)',
    unit: 'un',
    packageCost: 156.00,
    packageQuantity: 24,
    unitCost: 6.50,
    currentStock: 18, // Alerta: movimento do fim de semana
    minimumStock: 36,
    supplier: 'Distribuidora Bebidas Central',
    lastRestockedDate: '04/09/2026',
  },
  {
    id: 'ing-guarana-lata',
    name: 'Guaraná Antarctica 350ml (Fardo 12un)',
    unit: 'un',
    packageCost: 33.60,
    packageQuantity: 12,
    unitCost: 2.80,
    currentStock: 42,
    minimumStock: 24,
    supplier: 'Distribuidora Bebidas Central',
    lastRestockedDate: '04/09/2026',
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    menuItemId: 'prod-1', // Marmitex Executivo
    wasteAllowancePercent: 8,
    laborCostEstimate: 1.80, // Gás, óleo, temperos e mão de obra
    suggestedMarkup: 2.8,
    ingredients: [
      { ingredientId: 'ing-contrafile', quantityNeeded: 0.18 }, // 180g
      { ingredientId: 'ing-arroz', quantityNeeded: 0.15 },      // 150g
      { ingredientId: 'ing-feijao', quantityNeeded: 0.10 },     // 100g
      { ingredientId: 'ing-batata', quantityNeeded: 0.12 },     // 120g
      { ingredientId: 'ing-embalagem-marmita', quantityNeeded: 1 }, // 1 embalagem
    ]
  },
  {
    id: 'rec-2',
    menuItemId: 'prod-3', // Torresmo de Rolo
    wasteAllowancePercent: 18, // Encolhimento na fritura
    laborCostEstimate: 3.50,
    suggestedMarkup: 2.9,
    ingredients: [
      { ingredientId: 'ing-panceta', quantityNeeded: 0.55 }, // 550g cru
    ]
  },
  {
    id: 'rec-3',
    menuItemId: 'prod-4', // Batata Rústica
    wasteAllowancePercent: 5,
    laborCostEstimate: 2.20,
    suggestedMarkup: 3.2,
    ingredients: [
      { ingredientId: 'ing-batata', quantityNeeded: 0.40 },  // 400g
      { ingredientId: 'ing-queijo', quantityNeeded: 0.08 },  // 80g
      { ingredientId: 'ing-bacon', quantityNeeded: 0.07 },   // 70g
    ]
  }
];

export const INITIAL_FINANCIAL_ENTRIES: FinancialEntry[] = [
  {
    id: 'fin-1',
    description: 'Fornecedor de Carnes Boi Gordo (Carnes do Fim de Semana)',
    type: 'despesa',
    category: 'fornecedor_alimentos',
    amount: 1450.00,
    dueDate: '10/09/2026',
    status: 'pendente',
    supplierOrCustomer: 'Frigorífico Boi Gordo',
  },
  {
    id: 'fin-2',
    description: 'Conta de Energia Elétrica (CPFL / Refrigeradores e Cozinha)',
    type: 'despesa',
    category: 'energia_agua',
    amount: 890.40,
    dueDate: '12/09/2026',
    status: 'pendente',
    supplierOrCustomer: 'CPFL Paulista',
  },
  {
    id: 'fin-3',
    description: 'Distribuidora Bebidas Central (Cervejas e Refrigerantes)',
    type: 'despesa',
    category: 'fornecedor_bebidas',
    amount: 1220.00,
    dueDate: '05/09/2026',
    paidDate: '05/09/2026',
    status: 'pago',
    supplierOrCustomer: 'Distribuidora Central',
  },
  {
    id: 'fin-4',
    description: 'Recarga de Gás P45 Cozinha Industrial',
    type: 'despesa',
    category: 'gas_cozinha',
    amount: 480.00,
    dueDate: '03/09/2026',
    paidDate: '03/09/2026',
    status: 'pago',
    supplierOrCustomer: 'Ultragaz Express',
  },
  {
    id: 'fin-5',
    description: 'Aluguel do Salão Comercial e Cozinha',
    type: 'despesa',
    category: 'aluguel',
    amount: 2300.00,
    dueDate: '15/09/2026',
    status: 'pendente',
    supplierOrCustomer: 'Imobiliária Santa Cruz',
  },
  {
    id: 'fin-6',
    description: 'Vendas de Balcão e Salão - Quarta-feira',
    type: 'receita',
    category: 'vendas_diarias',
    amount: 1845.50,
    dueDate: '03/09/2026',
    paidDate: '03/09/2026',
    status: 'pago',
    supplierOrCustomer: 'Frente de Caixa MesaMestre',
  },
  {
    id: 'fin-7',
    description: 'Vendas de Balcão e Salão - Quinta-feira',
    type: 'receita',
    category: 'vendas_diarias',
    amount: 2150.00,
    dueDate: '04/09/2026',
    paidDate: '04/09/2026',
    status: 'pago',
    supplierOrCustomer: 'Frente de Caixa MesaMestre',
  }
];

export const INITIAL_MASTER_TIPS: MasterTip[] = [
  {
    id: 'tip-1',
    category: 'lucro',
    title: 'O Segredo da Marmita que dá Lucro de Verdade',
    shortDesc: 'Por que cobrar R$ 22 pode estar dando prejuízo sem você perceber.',
    fullTip: 'Seu Carlos, o erro mais comum de quem vende marmita é calcular apenas a carne e esquecer a embalagem térmica (R$ 0,65), o óleo da fritadeira, o gás de cozinha e a sacola. Uma marmita vendida por R$ 28 com custo de R$ 9,80 deixa mais de R$ 18 de margem bruta para pagar luz, aluguel e sobrar no seu bolso! Use a aba Ficha Técnica para cadastrar seus pratos em 2 minutos.',
    iconName: 'DollarSign',
    audioDurationText: 'Áudio de 1 min',
    badge: 'Dica de Ouro',
  },
  {
    id: 'tip-2',
    category: 'caixa',
    title: 'Por Que o Fechamento de Caixa Cego Evita Sumiço de Dinheiro',
    shortDesc: 'A técnica simples usada pelas melhores lanchonetes e botecos.',
    fullTip: 'Quando o funcionário fecha o caixa sabendo exatamente o valor que o sistema espera, ele pode tentar "completar" ou "guardar a sobra". No Caixa Cego do MesaMestre, o operador apenas conta as notas e moedas na gaveta e digita o total. Depois, o Seu Carlos abre a conferência e vê se bateu certinho, sem estresse e com total transparência.',
    iconName: 'Lock',
    audioDurationText: 'Áudio de 45 seg',
    badge: 'Prevenção de Perdas',
  },
  {
    id: 'tip-3',
    category: 'estoque',
    title: 'Nunca Fique Sem Batata e Cerveja no Sábado à Noite',
    shortDesc: 'Como o aviso "Comprar Hoje" do MesaMestre salva seu faturamento.',
    fullTip: 'Perder mesa porque acabou a cerveja gelada ou a batata frita é queimar dinheiro. Defina sempre o "Estoque Mínimo" com 30% a mais do que gasta na sexta-feira. O MesaMestre avisa com badge vermelho assim que atingir a linha amarela, para você fazer o pedido na distribuidora antes do meio-dia.',
    iconName: 'AlertTriangle',
    audioDurationText: 'Áudio de 1 min',
    badge: 'Rotina Sem Furos',
  },
  {
    id: 'tip-4',
    category: 'atendimento',
    title: 'Agilidade no Balcão: Como Fechar Contas Divididas em Segundos',
    shortDesc: 'Turma de 4 amigos querendo pagar cada um no seu PIX ou cartão.',
    fullTip: 'Na correria do balcão, nada atrasa mais a fila do que fazer conta de cabeça para dividir cerveja e porção. No MesaMestre PDV, clique em "Dividir Conta", escolha o número de pessoas (ex: 4 amigos) e o sistema já calcula o valor exato de cada um (R$ 27,50), permitindo receber 2 em PIX, 1 em Dinheiro com troco e 1 no Cartão!',
    iconName: 'Zap',
    audioDurationText: 'Áudio de 50 seg',
    badge: 'Fila Rápida',
  },
  {
    id: 'tip-5',
    category: 'cardapio',
    title: 'Cardápio Curto Vende Mais e Desperdiça Menos',
    shortDesc: 'Menos pratos no menu = insumos mais frescos e preparo 2x mais rápido.',
    fullTip: 'Ter 50 opções no cardápio parece bom, mas faz estragar tomate, carne e queijo na geladeira. Foque nos seus 10 pratos campeões (seus "cavalos de batalha"). O cliente decide mais rápido, a cozinha trabalha tranquila e seu lucro aumenta.',
    iconName: 'BookOpen',
    audioDurationText: 'Áudio de 1 min',
    badge: 'Gestão Inteligente',
  }
];
