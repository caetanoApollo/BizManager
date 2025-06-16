export const BASE_URL = "http://192.168.137.1:3001"; // troque para localhost se for testar no navegar e para o IP do notebook quando for testar no celular

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