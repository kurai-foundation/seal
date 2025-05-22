import BaseSchema from "../base-schema"

/**
 * Abstract base class for schema types that compose multiple child schemas.
 * Extends BaseSchema to inherit core schema functionality and optional/nullable modifiers.
 * @template T Combined schema value type.
 * @template MetaExtension Extra metadata fields supported by this composed schema.
 */
export default abstract class ComposeSchema<T, MetaExtension = any> extends BaseSchema<T, MetaExtension> {
  /**
   * Initialize a new ComposeSchema instance.
   * @param typeLabel Identifier for this composed schema (e.g., "allOf", "oneOf").
   */
  protected constructor(typeLabel: string) {
    super(typeLabel)
  }
}