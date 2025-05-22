import { InferSchema, SealDescriptor } from "~/types"
import CoreSchema from "./core-schema"

/**
 * Base schema class extending CoreSchema.
 * Provides optional and nullable schema modifiers based on an inner schema.
 * @template T Base type of the schema value.
 * @template MetaExtension Extra metadata fields supported by this schema.
 */
export default class BaseSchema<T, MetaExtension = any> extends CoreSchema<T, MetaExtension> {
  /**
   * @param type Identifier for the base schema type.
   * @param initialRules Optional validation rules for the schema.
   * @param descriptor Optional initial metadata descriptor.
   */
  protected constructor(
    type: string,
    initialRules?: Array<(input: T) => [boolean, string]>,
    descriptor?: SealDescriptor
  ) {
    super(type, initialRules, descriptor)
  }

  /**
   * Create a version of this schema that allows undefined as value.
   * @returns An OptionalSchema wrapping the current schema.
   */
  public get optional() {
    return new OptionalSchema(this)
  }

  /**
   * Create a version of this schema that allows null as value.
   * @returns A NullableSchema wrapping the current schema.
   */
  public get nullable() {
    return new NullableSchema(this)
  }
}

/**
 * Schema wrapper that permits null values in addition to the inner schema type.
 * @template S Type of the inner BaseSchema.
 */
export class NullableSchema<S extends BaseSchema<any>> extends BaseSchema<InferSchema<S> | null> {
  /**
   * @param inner The schema to wrap and extend with null allowance.
   */
  constructor(private readonly inner: S) {
    super(inner.__$sealDescriptor.type, [], { ...inner.__$sealDescriptor, nullable: true })
  }

  /**
   * Validate input, allowing null or delegating to the inner schema.
   * @param input Value to validate, may be null or inner type.
   * @returns Array of validation error messages (empty if valid).
   * @internal
   */
  public __$validate(input: unknown): string[] {
    if (input === null) {
      return []
    }
    return this.inner.__$validate(input)
  }
}

/**
 * Schema wrapper that permits undefined values in addition to the inner schema type.
 * @template S Type of the inner BaseSchema.
 */
export class OptionalSchema<S extends BaseSchema<any>> extends BaseSchema<InferSchema<S> | undefined> {
  /**
   * @param inner The schema to wrap and extend with undefined allowance.
   */
  constructor(private readonly inner: S) {
    super(inner.__$sealDescriptor.type, [], { ...inner.__$sealDescriptor, optional: true })
  }

  /**
   * Validate input, allowing undefined or delegating to the inner schema.
   * @param input Value to validate, may be undefined or inner type.
   * @returns Array of validation error messages (empty if valid).
   * @internal
   */
  public __$validate(input: unknown): string[] {
    if (input === undefined) {
      return []
    }
    return this.inner.__$validate(input)
  }
}