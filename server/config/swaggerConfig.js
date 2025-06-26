const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BizManager API',
            version: '1.0.0',
            description: 'Documentação da API do BizManager, um aplicativo de gestão para microempreendedores.',
        },
        servers: [
            {
                url: 'http://localhost:3001/api', // Ajuste conforme seu ambiente
                description: 'Servidor de Desenvolvimento',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT de autenticação'
                }
            },
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64', description: 'ID único do usuário' },
                        nome: { type: 'string', description: 'Nome do usuário' },
                        email: { type: 'string', format: 'email', description: 'Email do usuário' },
                        telefone: { type: 'string', description: 'Telefone do usuário' },
                        cnpj: { type: 'string', description: 'CNPJ do usuário (formato ##.###.###/####-##)' },
                        foto_perfil: { type: 'string', format: 'binary', description: 'Foto de perfil do usuário (base64 ou URL)' },
                        data_criacao: { type: 'string', format: 'date-time', description: 'Data de criação da conta' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['identificador', 'senha'],
                    properties: {
                        identificador: { type: 'string', description: 'CNPJ ou Email do usuário' },
                        senha: { type: 'string', format: 'password', description: 'Senha do usuário' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', description: 'Token JWT de autenticação' },
                        id: { type: 'integer', format: 'int64' },
                        nome: { type: 'string' },
                        email: { type: 'string' },
                        telefone: { type: 'string' },
                        cnpj: { type: 'string' }
                    }
                },
                Cliente: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64' },
                        usuario_id: { type: 'integer', format: 'int64' },
                        nome: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        telefone: { type: 'string' },
                        endereco: { type: 'string' },
                        data_cadastro: { type: 'string', format: 'date-time' }
                    }
                },
                Produto: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64' },
                        usuario_id: { type: 'integer', format: 'int64' },
                        nome: { type: 'string' },
                        descricao: { type: 'string' },
                        quantidade: { type: 'integer' },
                        quantidade_minima: { type: 'integer' },
                        preco_custo: { type: 'number', format: 'float' },
                        preco_venda: { type: 'number', format: 'float' },
                        fornecedor: { type: 'string' },
                        data_cadastro: { type: 'string', format: 'date-time' }
                    }
                },
                TransacaoFinanceira: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64' },
                        usuario_id: { type: 'integer', format: 'int64' },
                        titulo: { type: 'string' },
                        descricao: { type: 'string' },
                        valor: { type: 'number', format: 'float' },
                        data: { type: 'string', format: 'date', description: 'Formato YYYY-MM-DD' },
                        tipo: { type: 'string', enum: ['receita', 'despesa', 'transferencia'] },
                        categoria: { type: 'string' },
                        data_registro: { type: 'string', format: 'date-time' }
                    }
                },
                NotaFiscal: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64' },
                        usuario_id: { type: 'integer', format: 'int64' },
                        cliente_id: { type: 'integer', format: 'int64', nullable: true },
                        numero: { type: 'string' },
                        servico_fornecido: { type: 'string' },
                        cnpj_tomador: { type: 'string', description: 'CNPJ do tomador (formato ##.###.###/####-##)' },
                        data_emissao: { type: 'string', format: 'date', description: 'Formato YYYY-MM-DD' },
                        valor: { type: 'number', format: 'float' },
                        status: { type: 'string', enum: ['emitida', 'cancelada'] },
                        arquivo_pdf: { type: 'string', format: 'binary', description: 'Conteúdo do PDF da nota' },
                        data_registro: { type: 'string', format: 'date-time' }
                    }
                },
                ServicoAgendado: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64' },
                        usuario_id: { type: 'integer', format: 'int64' },
                        cliente_id: { type: 'integer', format: 'int64' },
                        titulo: { type: 'string' },
                        descricao: { type: 'string' },
                        data: { type: 'string', format: 'date', description: 'Formato YYYY-MM-DD' },
                        horario: { type: 'string', description: 'Formato HH:MM' },
                        status: { type: 'string', enum: ['agendado', 'concluido', 'cancelado'] },
                        data_criacao: { type: 'string', format: 'date-time' }
                    }
                },
                Configuracoes: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', format: 'int64' },
                        usuario_id: { type: 'integer', format: 'int64' },
                        notificacoes_estoque: { type: 'boolean' },
                        integracao_google_calendar: { type: 'boolean' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', description: 'Mensagem de erro' }
                    }
                }
            }
        }
    },
    apis: [
        './server/routers/*.js',
        './server/controllers/*.js' 
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;