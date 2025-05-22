import {
  AllOfSchema,
  AnyOfSchema,
  ArraySchema,
  BaseSchema,
  BooleanSchema,
  DateSchema,
  NotSchema,
  NumberSchema,
  ObjectSchema,
  OneOfSchema,
  StringSchema
} from "./schemas"

/**
 * Entry point for building and using schema validators.
 * Provides factory methods for primitive and composite schemas and a validate helper.
 */
export default class Seal {
  /**
   * Create a boolean schema.
   * @returns A BooleanSchema instance for boolean validation.
   */
  public get boolean() {
    return new BooleanSchema()
  }

  /**
   * Create a string schema.
   * @returns A StringSchema instance for string validation.
   */
  public get string() {
    return new StringSchema()
  }

  /**
   * Create a number schema.
   * @returns A NumberSchema instance for numeric validation.
   */
  public get number() {
    return new NumberSchema()
  }

  /**
   * Create a date schema.
   * @returns A DateSchema instance for date validation.
   */
  public get date() {
    return new DateSchema()
  }

  /**
   * Create an object schema with a fixed shape.
   * @param shape Mapping of property keys to BaseSchema instances defining expected object structure.
   * @returns An ObjectSchema configured for the given shape.
   * @template S Shape type parameter for object schema.
   */
  public object<S extends { [key: string]: BaseSchema<any> }>(shape: S) {
    return new ObjectSchema<S>(shape)
  }

  /**
   * Create an array schema where all elements must match the provided schema or tuple of schemas.
   * @param shape One or more BaseSchema instances defining element type(s).
   * @returns An ArraySchema for the given element schema(s).
   * @template S Tuple of schema types for array elements.
   */
  public array<S extends BaseSchema<any>>(shape: S | S[]) {
    return new ArraySchema<S>(shape)
  }

  /**
   * Validate a value against the given schema.
   * @param schema The BaseSchema instance to use for validation.
   * @param input The value to validate.
   * @returns Array of validation error messages, or empty if valid.
   */
  public validate(schema: BaseSchema<any>, input: any) {
    return schema.__$validate(input)
  }

  /**
   * Retrieve metadata descriptor of specific schema.
   *
   * @param schema The BaseSchema instance.
   * @returns schema metadata descriptor.
   */
  public exportMetadataOf(schema: BaseSchema<any>) {
    return schema.__$exportMetadata()
  }

  /**
   * Create a oneOf schema requiring exactly one sub-schema to match.
   * @param schemas List of BaseSchema instances.
   * @returns A OneOfSchema combining the given schemas.
   * @template A Tuple of BaseSchema types.
   */
  public oneOf<A extends BaseSchema<any>[]>(...schemas: A) {
    return new OneOfSchema<A>(schemas)
  }

  /**
   * Create an anyOf schema requiring at least one sub-schema to match.
   * @param schemas List of BaseSchema instances.
   * @returns An AnyOfSchema combining the given schemas.
   * @template A Tuple of BaseSchema types.
   */
  public anyOf<A extends BaseSchema<any>[]>(...schemas: A) {
    return new AnyOfSchema<A>(schemas)
  }

  /**
   * Create an allOf schema requiring all sub-schemas to match (intersection).
   * @param schemas Array of BaseSchema instances.
   * @returns An AllOfSchema combining the given schemas.
   * @template A BaseSchema type for all sub-schemas.
   */
  public allOf<A extends BaseSchema<any>>(...schemas: A[]) {
    return new AllOfSchema<A[]>(schemas)
  }

  /**
   * Create a not schema requiring a value to match base schema and not the excluded schema.
   * @param schema The schema that input must satisfy.
   * @param not The schema that input must not satisfy.
   * @returns A NotSchema enforcing the exclusion.
   * @template S Base schema type for inclusion.
   * @template N Base schema type for exclusion.
   */
  public not<S extends BaseSchema<any>, N extends BaseSchema<any>>(schema: S, not: N) {
    return new NotSchema<S, N>(schema, not)
  }
}