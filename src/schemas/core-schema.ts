import { Schema, SealDescriptor } from "~/types"

/**
 * Core implementation of the Schema interface.
 * Provides basic rule storage, metadata management, and validation logic.
 * @template T Type of the value to validate.
 * @template MetaExtension Extra metadata fields supported by this schema.
 */
export default class CoreSchema<T, MetaExtension = any> implements Schema<T> {
  /**
   * Descriptor holding type information and accumulated metadata.
   * @internal
   */
  public __$sealDescriptor: SealDescriptor

  /**
   * Array of validation rules to apply to input values.
   * Each rule returns a tuple [isValid, errorMessage].
   * @internal
   */
  public readonly __$rules: Array<(input: T) => [boolean, string]>

  /**
   * Create a new CoreSchema instance.
   * Initializes internal rules and descriptor state.
   * @param type Identifier for the schema type (e.g., "string", "number").
   * @param initialRules Optional array of initial validation rules.
   * @param descriptor Optional initial metadata descriptor.
   */
  protected constructor(
    type: string,
    initialRules?: Array<(input: T) => [boolean, string]>,
    descriptor?: SealDescriptor
  ) {
    this.__$rules = initialRules ?? []
    this.__$sealDescriptor = { type, ...descriptor }
  }

  /**
   * Mark this schema as deprecated.
   * @returns A new schema instance with the `deprecated` metadata flag set.
   */
  public get deprecated() {
    return this.$metadata({ deprecated: true })
  }

  /**
   * Mark this schema as read-only.
   * @returns A new schema instance with the `readOnly` metadata flag set.
   */
  public get readOnly() {
    return this.$metadata({ readOnly: true })
  }

  /**
   * Mark this schema as write-only.
   * @returns A new schema instance with the `writeOnly` metadata flag set.
   */
  public get writeOnly() {
    return this.$metadata({ writeOnly: true })
  }

  /**
   * Add a textual description to this schema.
   * @param input Description text.
   * @returns A new schema instance with the `description` metadata field set.
   */
  public description(input: string) {
    return this.$metadata({ description: input })
  }

  /**
   * Provide an example value for this schema.
   * @param example Example data of type T.
   * @returns A new schema instance with the `example` metadata field set.
   */
  public example(example: T) {
    return this.$metadata({ example })
  }

  /**
   * Define a default value for this schema.
   * @param input Default value of type T.
   * @returns A new schema instance with the `default` metadata field set.
   */
  public default(input: T) {
    return this.$metadata({ default: input })
  }

  /**
   * Validate an input against all stored rules.
   * Stops on first failure and returns its error message.
   * @param input Value to validate.
   * @returns Array of error messages (empty if validation passes).
   * @internal
   */
  public __$validate(input: any): string[] {
    for (const rule of this.__$rules) {
      const result = rule(input)

      if (!result[0]) return [result[1]]
    }

    return []
  }

  /**
   * Export the internal metadata descriptor for this schema.
   * Used when generating OpenAPI definitions.
   * @returns The complete SealDescriptor object.
   * @internal
   */
  public __$exportMetadata() {
    return this.__$sealDescriptor
  }

  /**
   * Add a new validation rule to the schema.
   * @param rule Function that tests an input and returns `[isValid, errorMessage]`.
   * @returns The current schema instance for chaining.
   */
  protected $add(rule: (input: T) => [boolean, string]) {
    this.__$rules.push(rule)

    return this
  }

  /**
   * Merge additional metadata into the schema descriptor.
   * @param data Partial metadata fields or extensions to apply.
   * @returns The current schema instance with updated metadata.
   */
  protected $metadata(data: Omit<SealDescriptor, "type"> | Partial<MetaExtension>) {
    this.__$sealDescriptor = {
      ...this.__$sealDescriptor,
      ...data
    }

    return this
  }
}