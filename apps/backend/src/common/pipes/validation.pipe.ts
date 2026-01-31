/**
 * Validation Pipe
 * Validates request bodies using Zod schemas
 */

import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.schema || metadata.type !== "body") {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join(".") || "body",
        message: err.message,
      }));

      throw new BadRequestException({
        message: "Validation failed",
        details: errors,
      });
    }

    return result.data;
  }
}
