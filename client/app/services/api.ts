export const BASE_URL = "http://172.20.91.39:3001"; //IP
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await AsyncStorage.getItem('userToken'); // Corrigido para 'userToken' se for o padrão
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
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    formData.append("cnpj", cnpj);
    formData.append("senha", senha);

    if (fotoPerfilUri) {
        formData.append("profilePicture", {
            uri: fotoPerfilUri,
            name: "foto.jpg",
            type: "image/jpeg",
        } as any);
    }

    // Usamos o fetch diretamente aqui por causa do FormData
    const response = await fetch(`${BASE_URL}/api/cadastro`, {
        method: "POST",
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
};

export const forgotPassword = async (email: string) => {
    return await apiFetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

// --- Clientes ---
export const createClient = (usuario_id: number, nome: string, email: string, telefone: string, endereco: string) => {
    return apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify({ usuario_id, nome, email, telefone, endereco }),
    });
};

export const getClients = (usuario_id: number) => {
    return apiFetch(`/api/clients/${usuario_id}`);
};

export const updateClient = (clienteId: number, usuario_id: number, nome: string, email: string, telefone: string, endereco: string) => {
    return apiFetch(`/api/clients/${usuario_id}`, {
        method: 'PUT',
        body: JSON.stringify({ clienteId, usuario_id, nome, email, telefone, endereco }),
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

// 1. Função para upload da foto
export const uploadProfilePicture = (fotoPerfilUri: string) => {
    const formData = new FormData();
    formData.append("profilePicture", {
        uri: fotoPerfilUri,
        name: "foto.jpg",
        type: "image/jpeg",
    } as any);

    return apiFetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
    });
};

// 2. Função para atualizar os dados de texto
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