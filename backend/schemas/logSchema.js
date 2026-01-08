const Joi = require("joi");

const logEntrySchema = Joi.object({
  level: Joi.string().valid("error", "warn", "info", "debug").required(),
  message: Joi.string().required(),
  resourceId: Joi.string().required(),
  timestamp: Joi.string().required(), // ISO 8601 format
  traceId: Joi.string().required(),
  spanId: Joi.string().required(),
  commit: Joi.string().required(),
  metadata: Joi.object().default({}),
});

module.exports = { logEntrySchema };