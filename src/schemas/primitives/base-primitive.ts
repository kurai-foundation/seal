import BaseSchema from "../base-schema"

/**
 * Schema for primitive values with explicit allowed or disallowed sets.
 * Extends BaseSchema to provide `valid` and `invalid` utility methods.
 * @template T Type of primitive values to validate.
 */
export default class BasePrimitive<T, MetaExtension = any> extends BaseSchema<T, MetaExtension> {
  /**
   * Specify a list of allowed values for this schema.
   * Adds metadata and a validation rule checking inclusion in the provided list.
   * @param input One or more allowed values.
   * @returns The current schema instance for chaining.
   */
  public valid(...input: T[]) {
    // Store allowed values in metadata and add a rule to enforce inclusion
    return this.$metadata({ valid: input } as any)
      .$add(value => [
        input.includes(value as T),
        `${ value } is not allowed`
      ])
  }

  /**
   * Specify a list of disallowed values for this schema.
   * Adds metadata and a validation rule checking exclusion from the provided list.
   * @param input One or more disallowed values.
   * @returns The current schema instance for chaining.
   */
  public invalid(...input: T[]) {
    // Store disallowed values in metadata and add a rule to enforce exclusion
    return this.$metadata({ invalid: input } as any)
      .$add(value => [
        !input.includes(value as T),
        `${ value } is not allowed`
      ])
  }
}
