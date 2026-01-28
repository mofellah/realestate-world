"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isoDateSchema = exports.urlSchema = exports.paginationSchema = exports.positiveIntSchema = exports.nonEmptyStringSchema = exports.cuidSchema = exports.uuidSchema = exports.passwordSchema = exports.emailSchema = void 0;
const zod_1 = require("zod");
exports.emailSchema = zod_1.z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim();
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
exports.cuidSchema = zod_1.z.string().cuid('Invalid CUID format');
exports.nonEmptyStringSchema = zod_1.z.string().min(1, 'Field cannot be empty').trim();
exports.positiveIntSchema = zod_1.z.number().int().positive('Must be a positive integer');
exports.paginationSchema = zod_1.z.object({
    skip: zod_1.z.number().int().min(0).default(0),
    take: zod_1.z.number().int().min(1).max(100).default(10),
});
exports.urlSchema = zod_1.z.string().url('Invalid URL format');
exports.isoDateSchema = zod_1.z.string().datetime('Invalid ISO date format');
//# sourceMappingURL=validators.js.map