import { InferSchema, SealDescriptor } from "~/types"
import BaseSchema, { OptionalSchema } from "../base-schema"

/**
 * Mapping of property keys to their corresponding BaseSchema instances.
 */
export type ObjectSchemaShape = { [key: string]: BaseSchema<any> }

/**
 * Type helper to infer the resulting object shape from a schema shape.
 */
type Shape<S extends ObjectSchemaShape> = { [K in keyof S]: InferSchema<S[K]> }

/**
 * Schema for validating plain objects with a fixed set of properties.
 * Supports optional properties, loose mode, and nested schema validation.
 * @template S Mapping of keys to BaseSchema instances defining expected properties.
 */
export default class ObjectSchema<S extends ObjectSchemaShape> extends BaseSchema<Shape<S>> {
  /**
   * Internal record of property schemas.
   * @internal
   */
  public readonly __$shape: S

  /**
   * Flag indicating whether unknown properties are allowed.
   * @internal
   */
  private __$loose = false

  /**
   * Create a new ObjectSchema.
   * @param shape Object defining each property's schema.
   */
  constructor(shape: S) {
    super("object")
    this.__$shape = shape
  }

  /**
   * Allow properties not defined in the schema shape.
   * @returns A new schema instance configured in loose mode.
   */
  public get loose() {
    const schema = new ObjectSchema<S & { [key: string]: any }>(this.__$shape)
    schema.__$loose = true
    return schema
  }

  /**
   * Assign a custom name for this schema (e.g., for OpenAPI components).
   * @param name Name to assign.
   * @returns The current schema instance.
   */
  public name(name: string) {
    return this.$metadata({ name })
  }

  /**
   * Attach external documentation metadata.
   * @param input ExternalDocs object to include.
   * @returns The current schema instance.
   */
  public externalDocs(input: NonNullable<SealDescriptor["externalDocs"]>) {
    return this.$metadata({ externalDocs: input })
  }

  /**
   * Validate an input object against the defined property schemas.
   * Checks required properties, applies nested validation, and enforces loose mode.
   * @param input The value to validate.
   * @returns An array of error messages, or an empty array if valid.
   * @internal
   */
  public override __$validate(input: any): string[] {
    if (typeof input !== "object" || Array.isArray(input)) return ["not an object"]

    let hasUnknownKeys = false
    const shapeKeys = Object.keys(this.__$shape)
    const inputKeys = Object.keys(input)

    for (const key of shapeKeys) {
      // Missing required key
      if (!(key in input) && !(this.__$shape[key] instanceof OptionalSchema)) {
        return [`key "${ key }" not found`]
      }
      // Unknown key detection
      if (!shapeKeys.includes(key) && inputKeys.includes(key)) {
        hasUnknownKeys = true
      }
      // Validate known key
      if (key in input) {
        const keyErrors = this.__$shape[key]
          .__$validate(input[key])
          .map(msg => `key "${ key }" ${ msg }`)
        if (keyErrors.length > 0) {
          return keyErrors
        }
      }
    }

    // Reject unknown keys if not in loose mode
    if (hasUnknownKeys && !this.__$loose) {
      return ["unknown keys not allowed"]
    }

    return []
  }

  /**
   * Export metadata descriptor including nested shape definitions.
   * @returns The complete metadata object for OpenAPI generation.
   * @internal
   */
  public override __$exportMetadata() {
    return {
      ...this.__$sealDescriptor,
      shape: Object.fromEntries(
        Object.entries(this.__$shape).map(([key, schema]) => [
          key,
          schema.__$exportMetadata()
        ])
      )
    }
  }
}
