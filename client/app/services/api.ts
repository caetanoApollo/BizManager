export const BASE_URL = "http://192.168.137.1:3001"; // troque para localhost se for testar no navegar e para o IP do notebook quando for testar no celular
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getAuthHeader() {
    const token = await AsyncStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// Função para login
export async function login(identificador: string, senha: string) {
    const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador, senha }),
    });
    const data = await response.json();
    console.log("informações do user", data);
    if (!response.ok) throw new Error(data.error);
    return data;
}

// Função para cadastro
export async function cadastro(
    nome: string,
    email: string,
    telefone: string,
    cnpj: string,
    senha: string,
    fotoPerfilUri?: string
) {
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    formData.append("cnpj", cnpj);
    formData.append("senha", senha);

    if (fotoPerfilUri) {
        formData.append("foto_perfil", {
            uri: fotoPerfilUri,
            name: "foto.jpg",
            type: "image/jpeg",
        } as any);
    }

    const response = await fetch(`${BASE_URL}/api/cadastro`, {
        method: "POST",
        headers: {
        },
        body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// função para criar cliente
export async function createClient(usuario_id: number, nome: string, email: string, telefone: string, endereco: string) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader && typeof authHeader.Authorization === "string") {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/clients`, {
        method: "POST",
        headers,
        body: JSON.stringify({usuario_id, nome, email, telefone, endereco }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// função para obter clientes por ID de usuário
export async function getClients(usuario_id: number) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader.Authorization) {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/clients/${usuario_id}`, {
        headers
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// função para atualizar cliente
export async function updateClient(clienteId: number, usuario_id: number, nome: string, email: string, telefone: string, endereco: string) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader && typeof authHeader.Authorization === "string") {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/clients/${usuario_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({clienteId, usuario_id, nome, email, telefone, endereco }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

//função para excluir cliente
export async function deleteClient(id: number, usuario_id: number) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader.Authorization) {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/clients/${id}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ usuario_id }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

export async function getUserProfile(usuario_id: number) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader.Authorization) {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/users/${usuario_id}`, {
        headers
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

export async function updateUserProfile(
    usuario_id: number,
    userData: { nome?: string; email?: string; telefone?: string; cnpj?: string; senha?: string } // Removido fotoPerfilUri para simplicidade, se precisar, trate separadamente com FormData.
) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader && typeof authHeader.Authorization === "string") {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/users/${usuario_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// função para obter configurações do usuário
export async function getConfigsByUserId(usuario_id: number) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader.Authorization) {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/configs/${usuario_id}`, {
        headers
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// função para atualizar/criar configurações do usuário
export async function updateConfigs(usuario_id: number, notificacoes_estoque: boolean, integracao_google_calendar: boolean) {
    const authHeader = await getAuthHeader();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (authHeader && typeof authHeader.Authorization === "string") {
        headers["Authorization"] = authHeader.Authorization;
    }
    const response = await fetch(`${BASE_URL}/api/configs/${usuario_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ notificacoes_estoque, integracao_google_calendar }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}