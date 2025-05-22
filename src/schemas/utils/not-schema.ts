import { ExcludeWith, SealDescriptor } from "~/types"
import BaseSchema from "../base-schema"
import ComposeSchema from "./compose-schema"

/**
 * Schema that validates input against a base schema but rejects if it matches the excluded schema.
 * Implements JSON Schema `not` with metadata for OpenAPI generation.
 * @template S Type of the base schema.
 * @template N Type of the schema to exclude.
 */
export default class NotSchema<S extends BaseSchema<any>, N extends BaseSchema<any>> extends ComposeSchema<ExcludeWith<S, N>, {
  allOf: SealDescriptor[],
  not: SealDescriptor
}> {
  /**
   * @param base The schema that input must satisfy first.
   * @param not The schema that input must NOT satisfy.
   */
  constructor(private readonly base: S, private readonly not: N) {
    super("not")
    // Store metadata: combine base schema via allOf and exclusion via not
    this.$metadata({
      allOf: [this.base.__$exportMetadata()],
      not: this.not.__$exportMetadata()
    })
  }

  /**
   * Validate input: passes if it matches base schema but does not match the excluded schema.
   * @param x Value to validate.
   * @returns Empty array if valid; otherwise an array with an error summary and details.
   * @internal
   */
  public __$validate(x: unknown): string[] {
    const baseValidationMessages = this.base.__$validate(x)
    const notValidationMessages = this.not.__$validate(x)

    const passesBase = baseValidationMessages.length === 0
    const failsNot = notValidationMessages.length !== 0

    if (passesBase && failsNot) {
      return []
    }

    // Determine error message: if base fails, report base failure; if `not` schema passed, report inversion error
    const errorMsg = !passesBase
      ? "base schema is invalid"
      : "value must not match the excluded schema"

    // Include relevant messages from failing validation
    const details = passesBase
      ? notValidationMessages
      : baseValidationMessages

    return [errorMsg, ...details]
  }
}
