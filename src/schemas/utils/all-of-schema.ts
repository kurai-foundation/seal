import { IntersectionOf, SealDescriptor } from "~/types"
import BaseSchema from "../base-schema"
import ComposeSchema from "./compose-schema"

/**
 * Schema that validates input against all provided sub-schemas (intersection).
 * Combines multiple BaseSchema instances and ensures the value meets every schema.
 * @template A Tuple of BaseSchema types to intersect.
 */
export default class AllOfSchema<A extends BaseSchema<any>[]> extends ComposeSchema<IntersectionOf<A>, { allOf: SealDescriptor[] }> {
  /**
   * @param subs Array of schemas to combine with logical AND semantics.
   */
  constructor(private readonly subs: A) {
    super("allOf")
    // Store metadata for OpenAPI generation: list of component schemas
    this.$metadata({
      allOf: this.subs.map(s => s.__$exportMetadata())
    })
  }

  /**
   * Validate input against each sub-schema.
   * Aggregates error messages from all schemas and reports failure if any fail.
   * @param x Value to validate against all sub-schemas.
   * @returns Empty array if valid; otherwise an array with a summary message and all error details.
   * @internal
   */
  public __$validate(x: unknown): string[] {
    const validationMessages = this.subs.map(s => s.__$validate(x))
    const allValid = validationMessages.every(msgs => msgs.length === 0)
    if (allValid) {
      return []
    }
    return [
      "some of the provided schemas are invalid",
      ...validationMessages.flat()
    ]
  }
}
