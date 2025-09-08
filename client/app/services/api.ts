export const BASE_URL = "http://172.20.91.39:3001"; 
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

    const data = await response.json();
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
        await AsyncStorage.setItem('userToken', resposta.token);
    }

    return resposta;
};

export const cadastro = async (nome: string, email: string, telefone: string, cnpj: string, senha: string, fotoPerfilUri?: string) => {
    const body = {
        nome,
        email,
        telefone,
        cnpj,
        senha,
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

// --- Clientes ---
export const createClient = (usuario_id: number, nome: string, email: string, telefone: string, observacao: string) => {
    return apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify({ usuario_id, nome, email, telefone, observacoes: observacao }), 
    });
};

export const getClients = (usuario_id: number) => {
    return apiFetch(`/api/clients/user/${usuario_id}`);
};


export const getClientById = (clienteId: number) => {
    return apiFetch(`/api/clients/${clienteId}`);
};

export const updateClient = (clienteId: number, usuario_id: number, nome: string, email: string, telefone: string, observacao: string) => {
    return apiFetch(`/api/clients/${clienteId}`, {
        method: 'PUT',
        body: JSON.stringify({ usuario_id, nome, email, telefone, observacoes: observacao }),
    });
};

export const deleteClient = (id: number, usuario_id: number) => {
    return apiFetch(`/api/clients/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ usuario_id }),
    });
};


// --- Perfil do Usuário ---
export const getUserProfile = (usuario_id: number) => {
    return apiFetch(`/api/users/${usuario_id}`);
};

export const updateUserData = (usuario_id: number, userData: { nome?: string; email?: string; telefone?: string; cnpj?: string; senha?: string }) => {
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
    return apiFetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ usuario_id }),
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