const Joi = require('joi');

const userSchema = Joi.object({
    nome: Joi.string().min(3).max(255).required().messages({
        'string.base': 'Nome deve ser texto.',
        'string.empty': 'Nome não pode ser vazio.',
        'string.min': 'Nome deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Nome deve ter no máximo {#limit} caracteres.',
        'any.required': 'Nome é obrigatório.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email inválido.',
        'string.empty': 'Email não pode ser vazio.',
        'any.required': 'Email é obrigatório.'
    }),
    senha: Joi.string().min(6).required().messages({
        'string.empty': 'Senha não pode ser vazia.',
        'string.min': 'Senha deve ter no mínimo {#limit} caracteres.',
        'any.required': 'Senha é obrigatória.'
    }),
    telefone: Joi.string().min(10).max(20).required().messages({
        'string.base': 'Telefone deve ser texto.',
        'string.empty': 'Telefone não pode ser vazio.',
        'string.min': 'Telefone deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Telefone deve ter no máximo {#limit} caracteres.',
        'any.required': 'Telefone é obrigatório.'
    }),
    cnpj: Joi.string().length(18).required().messages({ 
        'string.base': 'CNPJ deve ser texto.',
        'string.empty': 'CNPJ não pode ser vazio.',
        'string.length': 'CNPJ deve ter {#limit} caracteres.',
        'any.required': 'CNPJ é obrigatório.'
    })
});

const userLoginSchema = Joi.object({
    identificador: Joi.string().required().messages({
        'string.empty': 'Identificador (CNPJ ou E-mail) não pode ser vazio.',
        'any.required': 'Identificador (CNPJ ou E-mail) é obrigatório.'
    }),
    senha: Joi.string().required().messages({
        'string.empty': 'Senha não pode ser vazia.',
        'any.required': 'Senha é obrigatória.'
    })
});

const clientSchema = Joi.object({
    usuario_id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID do usuário deve ser um número.',
        'number.integer': 'ID do usuário deve ser um número inteiro.',
        'number.positive': 'ID do usuário deve ser positivo.',
        'any.required': 'ID do usuário é obrigatório.'
    }),
    nome: Joi.string().min(3).max(100).required().messages({
        'string.base': 'Nome do cliente deve ser texto.',
        'string.empty': 'Nome do cliente não pode ser vazio.',
        'string.min': 'Nome do cliente deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Nome do cliente deve ter no máximo {#limit} caracteres.',
        'any.required': 'Nome do cliente é obrigatório.'
    }),
    email: Joi.string().email().allow(null, '').messages({
        'string.email': 'Email do cliente inválido.'
    }),
    telefone: Joi.string().min(10).max(20).required().messages({
        'string.base': 'Telefone do cliente deve ser texto.',
        'string.empty': 'Telefone do cliente não pode ser vazio.',
        'string.min': 'Telefone do cliente deve ter no mínimo {#limit} caracteres.',
        'string.max': 'Telefone do cliente deve ter no máximo {#limit} caracteres.',
        'any.required': 'Telefone do cliente é obrigatório.'
    }),
    observacoes: Joi.string().max(255).allow(null, '').messages({
        'string.base': 'Observações do cliente deve ser texto.',
        'string.max': 'Observações do cliente deve ter no máximo {#limit} caracteres.'
    })
});

const productSchema = Joi.object({
    usuario_id: Joi.number().integer().positive().required(),
    nome: Joi.string().min(3).max(100).required(),
    descricao: Joi.string().max(255).allow(null, ''),
    quantidade: Joi.number().integer().min(0).required(),
    quantidade_minima: Joi.number().integer().min(0).default(5),
    preco_custo: Joi.number().precision(2).positive().required(),
    preco_venda: Joi.number().precision(2).positive().required(),
    fornecedor: Joi.string().max(100).allow(null, '')
});

const transactionSchema = Joi.object({
    usuario_id: Joi.number().integer().positive().required(),
    titulo: Joi.string().min(3).max(100).required(),
    descricao: Joi.string().max(255).allow(null, ''),
    valor: Joi.number().precision(2).positive().required(),
    data: Joi.date().iso().required(),
    tipo: Joi.string().valid('Entrada', 'Saída').required(),
    categoria: Joi.string().max(50).allow(null, '')
});

const invoiceSchema = Joi.object({
    usuario_id: Joi.number().integer().positive().required(),
    cliente_id: Joi.number().integer().positive().allow(null),
    numero: Joi.string().max(50).required(),
    servico_fornecido: Joi.string().required(),
    cnpj_tomador: Joi.string().length(18).required(), 
    data_emissao: Joi.date().iso().required(), 
    valor: Joi.number().precision(2).positive().required(),
    status: Joi.string().valid('emitida', 'cancelada').default('emitida'),
});

const scheduledServiceSchema = Joi.object({
    usuario_id: Joi.number().integer().positive().required(),
    cliente_id: Joi.number().integer().positive().required(),
    titulo: Joi.string().min(3).max(100).required(),
    descricao: Joi.string().max(255).allow(null, ''),
    data: Joi.date().iso().required(), 
    horario: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), 
    status: Joi.string().valid('agendado', 'concluido', 'cancelado').default('agendado')
});

const configSchema = Joi.object({
    notificacoes_estoque: Joi.boolean().default(true),
    integracao_google_calendar: Joi.boolean().default(false)
});

module.exports = {
    userSchema,
    userLoginSchema,
    clientSchema,
    productSchema,
    transactionSchema,
    invoiceSchema,
    scheduledServiceSchema,
    configSchema
};