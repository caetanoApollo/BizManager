const Joi = require('joi');

const validate = (schema, property) => (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    const valid = error == null;

    if (valid) {
        next();
    } else {
        const { details } = error;
        const message = details.map(i => i.message).join(',');
        console.error('Erro de validação:', message);
        res.status(400).json({ error: message });
    }
};

module.exports = validate;