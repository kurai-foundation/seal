import { SealDescriptor, UnionOf } from "~/types"
import BaseSchema from "../base-schema"
import ComposeSchema from "./compose-schema"

/**
 * Schema that validates input against at least one of the provided sub-schemas (union).
 * Combines multiple BaseSchema instances and ensures the value meets at least one schema.
 * @template A Tuple of BaseSchema types to union.
 */
export default class AnyOfSchema<A extends BaseSchema<any>[]> extends ComposeSchema<UnionOf<A>, { anyOf: SealDescriptor[] }> {
  /**
   * Create a new AnyOfSchema instance.
   * @param subs Array of schemas to combine with logical OR semantics.
   */
  constructor(private readonly subs: A) {
    super("anyOf")
    // Store metadata for OpenAPI generation: list of component schemas
    this.$metadata({
      anyOf: this.subs.map(s => s.__$exportMetadata())
    })
  }

  /**
   * Validate input against each sub-schema, passing if any one succeeds.
   * @param x Value to validate against the sub-schemas.
   * @returns Empty array if at least one sub-schema validates; otherwise an array with a summary message and all collected error messages.
   * @internal
   */
  public __$validate(x: unknown): string[] {
    const validationMessages = this.subs.map(s => s.__$validate(x))

    const valid = validationMessages.some(m => m.length === 0)
    if (valid) {
      return []
    }

    return [
      "all schemas are invalid",
      ...validationMessages.flat()
    ]
  }
}
