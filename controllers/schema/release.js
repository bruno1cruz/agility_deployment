const Joi = require('joi');

module.exports = {
    create: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      environment: Joi.string().valid(['production','development']).required()
    })
};
