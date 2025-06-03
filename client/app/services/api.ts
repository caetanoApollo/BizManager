export const BASE_URL = "http://192.168.2.119:3001"; // troque para localhost se for testar no navegar e para o IP do notebook quando for testar no celular

// Função para login
export async function login(cnpj: string, senha: string) {
    const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnpj, senha }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

// Função para cadastro
export async function cadastro(nome: string, email: string, telefone: string, cnpj: string, senha: string) {
    const response = await fetch(`${BASE_URL}/api/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, cnpj, senha }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}