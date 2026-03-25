import { celebrate, Joi, Segments } from 'celebrate';

const authBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const registerValidator = celebrate({
  [Segments.BODY]: authBodySchema
});

export const loginValidator = celebrate({
  [Segments.BODY]: authBodySchema
});
