import { z } from 'zod';
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const uuidSchema: z.ZodString;
export declare const cuidSchema: z.ZodString;
export declare const nonEmptyStringSchema: z.ZodString;
export declare const positiveIntSchema: z.ZodNumber;
export declare const paginationSchema: z.ZodObject<{
    skip: z.ZodDefault<z.ZodNumber>;
    take: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    take: number;
    skip: number;
}, {
    take?: number | undefined;
    skip?: number | undefined;
}>;
export declare const urlSchema: z.ZodString;
export declare const isoDateSchema: z.ZodString;
//# sourceMappingURL=validators.d.ts.map