import { celebrate, Joi, Segments } from 'celebrate';

const categorySchema = Joi.string().valid('sale', 'service', 'job', 'other');

export const listAnnouncementsValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    search: Joi.string().allow('').optional(),
    sort: Joi.string().valid('newest', 'oldest').optional(),
    page: Joi.number().integer().positive().optional()
  })
});

export const announcementIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required()
  })
});

export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().min(10).required(),
    price: Joi.number().positive().required(),
    category: categorySchema.required(),
    contactInfo: Joi.string().trim().min(5).required()
  })
});

export const patchAnnouncementValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(5).max(100),
    description: Joi.string().trim().min(10),
    price: Joi.number().positive(),
    category: categorySchema,
    contactInfo: Joi.string().trim().min(5)
  }).min(1)
});
