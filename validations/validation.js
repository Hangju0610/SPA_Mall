const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  nickname: Joi.string().alphanum().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

module.exports = signupSchema;
