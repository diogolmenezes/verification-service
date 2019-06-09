const Joi = require('@hapi/joi');

module.exports.validateSend = (req, res, next) => {
    const sendSchema = Joi.object({
        type: Joi.string().valid('sms', 'email').required(),
        destination: Joi.string()
            .when('type', { is: Joi.string().valid('sms'), then: Joi.string().regex(/^[0-9]{12,13}$/) })
            .when('type', { is: 'email', then: Joi.string().email() })
            .required(),
        ttl: Joi.number().integer().min(1),
        destroy: Joi.boolean()
    }).required();

    const validation = Joi.validate(req.body, sendSchema);

    if (validation.error) {
        res.send(422, { message: validation.error.message });
    } else {
        next();
    }
};

module.exports.validateCheck = (req, res, next) => {
    const checkSchema = Joi.object({
        type: Joi.string().valid('sms', 'email').required(),
        destination: Joi.string()
            .when('type', { is: Joi.string().valid('sms'), then: Joi.string().regex(/^[0-9]{12,13}$/) })
            .when('type', { is: 'email', then: Joi.string().email() })
            .required(),
        verificationCode: Joi.string().required()
    }).required();

    const validation = Joi.validate(req.query, checkSchema);

    if (validation.error) {
        res.send(422, { message: validation.error.message });
    } else {
        next();
    }
};
