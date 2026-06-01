import type { ValidationErrorCode } from "./index.js";

export class ColorEngineValidationError
  extends Error
  implements globalThis.Error
{
  readonly code: ValidationErrorCode;
  readonly field: string;
  readonly value: unknown;

  constructor({
    code,
    field,
    value,
    message,
  }: {
    code: ValidationErrorCode;
    field: string;
    value: unknown;
    message: string;
  }) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.field = field;
    this.value = value;
  }
}
