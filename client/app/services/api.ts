export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await AsyncStorage.getItem('token');
    const headers: Record<string, string> =
        options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)
            ? { ...options.headers as Record<string, string> }
            : {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Tenta fazer o parse do JSON. Se não houver corpo (ex: 204 No Content), retorna um objeto vazio.
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro na requisição.');
    }
    return data;
};

export const login = async (identificador: string, senha: string) => {
    const resposta = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ identificador, senha }),
    });

    if (resposta.token) {
        // ATENÇÃO: O seu login.tsx salva como 'token', mas o apiFetch lê 'token'
        // O seu login.tsx também salva 'userToken'
        // Vamos garantir que 'token' seja salvo, pois é o que o apiFetch usa.
        await AsyncStorage.setItem('token', resposta.token);
    }

    return resposta;
};

// --- CADASTRO ATUALIZADO ---
export const cadastro = async (
    nome: string, 
    email: string, 
    telefone: string, 
    cnpj: string, 
    senha: string, 
    inscricao_municipal?: string, 
    codigo_municipio?: string
) => {
    const body = {
        nome,
        email,
        telefone,
        cnpj, // O backend vai limpar a máscara
        senha,
        inscricao_municipal,
        codigo_municipio
    };

    const response = await apiFetch('/api/cadastro', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    return response;
};

export const forgotPassword = async (email: string) => {
    return await apiFetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

// --- CLIENTES ATUALIZADOS ---
// Objeto com todos os campos (incluindo os opcionais de NF-e)
interface ClientData {
    usuario_id: number;
    nome: string;
    email: string;
    telefone: string;
    observacoes: string;
    cnpj?: string;
    endereco_logradouro?: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cep?: string;
    endereco_uf?: string;
    endereco_codigo_municipio?: string;
}

export const createClient = (clientData: Omit<ClientData, 'id' | 'data_cadastro'>) => {
    return apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
    });
};

export const getClients = (usuario_id: number) => {
    return apiFetch(`/api/clients/user/${usuario_id}`);
};

export const getClientById = (clienteId: number) => {
    return apiFetch(`/api/clients/${clienteId}`);
};

export const updateClient = (clienteId: number, clientData: Omit<ClientData, 'id' | 'data_cadastro'>) => {
    return apiFetch(`/api/clients/${clienteId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
    });
};

export const deleteClient = (id: number) => {
    // O backend agora pega o usuario_id do token, não precisa enviar no body
    return apiFetch(`/api/clients/${id}`, {
        method: 'DELETE',
    });
};


// --- Perfil do Usuário ---
export const getUserProfile = (usuario_id: number) => {
    return apiFetch(`/api/users/${usuario_id}`);
};

// --- ATUALIZADO para incluir campos fiscais ---
export const updateUserData = (usuario_id: number, userData: { 
    nome?: string; 
    email?: string; 
    telefone?: string; 
    cnpj?: string; 
    senha?: string;
    inscricao_municipal?: string;
    codigo_municipio?: string;
}) => {
    return apiFetch(`/api/users/${usuario_id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

// --- Configurações ---
export const getConfigsByUserId = (usuario_id: number) => {
    return apiFetch(`/api/configs/${usuario_id}`);
};

export const updateConfigs = (usuario_id: number, notificacoes_estoque: boolean, integracao_google_calendar: boolean) => {
    return apiFetch(`/api/configs/${usuario_id}`, {
        method: 'PUT',
        body: JSON.stringify({ notificacoes_estoque, integracao_google_calendar }),
    });
};

// --- Financeiro ---
export const createTransaction = (
    usuario_id: number,
    titulo: string,
    descricao: string,
    valor: number,
    data: string,
    tipo: 'Entrada' | 'Saída',
    categoria: string
) => {
    return apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ usuario_id, titulo, descricao, valor, data, tipo, categoria }),
    });
};

export const getTransactionsByUserId = (usuario_id: number) => {
    return apiFetch(`/api/transactions/user/${usuario_id}`);
};

export const getTransactionById = (id: number) => {
    return apiFetch(`/api/transactions/${id}`);
};

export const updateTransaction = (
    id: number,
    usuario_id: number,
    titulo: string,
    descricao: string,
    valor: number,
    data: string,
    tipo: 'Entrada' | 'Saída',
    categoria: string
) => {
    return apiFetch(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ usuario_id, titulo, descricao, valor, data, tipo, categoria }),
    });
};

export const deleteTransaction = (id: number, usuario_id: number) => {
    // O backend espera o usuario_id no token, não no body
    return apiFetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        // body: JSON.stringify({ usuario_id }), // Removido, pois o authMiddleware já faz isso
    });
};

// --- Agenda / Serviços Agendados ---
export const getScheduledServices = () => {
    return apiFetch('/api/scheduled-services');
};

export const createScheduledService = (evento: {
    cliente_id: number;
    titulo: string;
    descricao: string;
    data: string;
    horario: string;
}) => {
    return apiFetch('/api/scheduled-services', {
        method: 'POST',
        body: JSON.stringify(evento),
    });
};

export const updateScheduledService = (id: number, evento: {
    cliente_id: number;
    titulo: string;
    descricao: string;
    data: string;
    horario: string;
    status: 'agendado' | 'concluido' | 'cancelado';
}) => {
    return apiFetch(`/api/scheduled-services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(evento),
    });
};

export const deleteScheduledService = (id: number) => {
    return apiFetch(`/api/scheduled-services/${id}`, {
        method: 'DELETE',
    });
};

export const getScheduledServiceById = (id: number) => {
    return apiFetch(`/api/scheduled-services/${id}`);
};

// --- Estoque ---
export const createProduct = (usuario_id: number, nome: string, descricao: string, quantidade: number, quantidade_minima: number, preco_custo: number, preco_venda: number, fornecedor: string) => {
    return apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ usuario_id, nome, descricao, quantidade, quantidade_minima, preco_custo, preco_venda, fornecedor }),
    });
};

export const getProductsByUserId = (usuario_id: number) => {
    return apiFetch(`/api/products/${usuario_id}`);
};

export const updateProduct = (id: number, usuario_id: number, nome: string, descricao: string, quantidade: number, quantidade_minima: number, preco_custo: number, preco_venda: number, fornecedor: string) => {
    return apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ usuario_id, nome, descricao, quantidade, quantidade_minima, preco_custo, preco_venda, fornecedor }),
    });
};

export const deleteProduct = (id: number, usuario_id: number) => {
    // O backend espera o usuario_id no token, não no body
    return apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
        // body: JSON.stringify({ usuario_id }), // Removido
    });
};

// ===================================================================
// SEÇÃO DE NOTAS FISCAIS ATUALIZADA
// ===================================================================

// Interface para os dados do formulário
interface TomadorPayload {
    cnpj: string;
    razao_social: string;
    email: string;
    endereco: {
        logradouro: string;
        numero: string;
        bairro: string;
        codigo_municipio: string;
        uf: string;
        cep: string;
    };
}

interface ServicoPayload {
    aliquota: number;
    discriminacao: string;
    valor_servicos: number;
    item_lista_servico: string;
    codigo_tributario_municipio: string;
}

/**
 * Cria uma nova nota fiscal chamando a API da FocusNFE.
 * O usuario_id (Prestador) é obtido pelo token no backend.
 */
export const createInvoice = async (invoiceData: {
    cliente_id?: number;
    data_emissao: string; // Formato YYYY-MM-DD
    tomador: TomadorPayload;
    servico: ServicoPayload;
}) => {
    return apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
    });
};

/**
 * Busca as notas fiscais do usuário logado (armazenadas localmente no DB).
 */
export const getInvoices = async (usuario_id: number) => {
    return apiFetch(`/api/invoices/${usuario_id}`);
};

/**
 * Busca os detalhes de uma nota fiscal específica (do DB local).
 */
export const getInvoiceById = async (id: number) => {
    return apiFetch(`/api/invoices/details/${id}`);
};

/**
 * Solicita o cancelamento de uma nota fiscal (chama a API FocusNFE).
 */
export const cancelInvoice = async (id: number) => {
    return apiFetch(`/api/invoices/cancel/${id}`, {
        method: 'POST',
    });
};

/**
 * Consulta o status mais recente de uma nota (chama a API FocusNFE).
 */
export const consultInvoiceStatus = async (id: number) => {
    return apiFetch(`/api/invoices/consult/${id}`, {
        method: 'POST',
    });
};


// --- Notificações ---
export const getLowStockAlerts = async (): Promise<{ id: number; nome: string; quantidade: number; quantidade_minima: number }[]> => {
    // O backend pega o usuario_id do token
    return apiFetch('/api/stock/low-alerts');
};