import { SealDescriptor, UnionOf } from "~/types"
import BaseSchema from "../base-schema"
import ComposeSchema from "./compose-schema"

/**
 * Schema that validates input against exactly one of the provided subschemas.
 * Combines multiple BaseSchema instances and enforces that exactly one schema matches.
 * @template A Tuple of BaseSchema types to test.
 */
export default class OneOfSchema<A extends BaseSchema<any>[]> extends ComposeSchema<UnionOf<A>, { oneOf: SealDescriptor[] }> {
  /**
   * Initialize a OneOfSchema instance.
   * @param subs Array of schemas to combine with exclusive OR semantics.
   */
  constructor(private readonly subs: A) {
    super("oneOf")
    // Store metadata for OpenAPI generation: list of component schemas
    this.$metadata({
      oneOf: this.subs.map(s => s.__$exportMetadata())
    })
  }

  /**
   * Validate input against each sub-schema, ensuring exactly one passes.
   * @param x Value to validate against the sub-schemas.
   * @returns Empty array if exactly one sub-schema validates; otherwise an array with a summary message and all collected error messages.
   * @internal
   */
  public __$validate(x: unknown): string[] {
    const validationMessages = this.subs.map(s => s.__$validate(x))
    const matchCount = validationMessages.filter(msgs => msgs.length === 0).length

    if (matchCount === 1) return []

    const errorMsg = matchCount < 1
      ? "none of the provided schemas is valid"
      : "more than one schema is valid"

    return [
      errorMsg,
      ...validationMessages.flat()
    ]
  }
}
