import BasePrimitive from "./base-primitive"

/**
 * Descriptor extension for numeric schema metadata fields.
 */
interface SealDescriptorExtension {
  minimum: number
  maximum: number
  exclusiveMinimum: number
  exclusiveMaximum: number
  multipleOf: number
  format: "float" | "double" | "int32" | "int64"
  type: "number" | "integer" | "float" | "double"
  "x-precision": number
}

/**
 * Schema for validating numeric values with rich constraints.
 * Extends BasePrimitive to provide numeric-specific rules and metadata.
 * @extends BasePrimitive<number, Partial<SealDescriptorExtension>>
 */
export default class NumberSchema
  extends BasePrimitive<number, Partial<SealDescriptorExtension>> {
  /**
   * Construct a NumberSchema, enforcing that values are finite numbers.
   */
  constructor() {
    super("number", [
      /**
       * Validation rule: value must be a finite number.
       */
      v => [
        typeof (v as any) === "number" && Number.isFinite(v),
        `${ v } is not a valid integer number`
      ]
    ])
  }

  /**
   * Mark the schema as representing a 32-bit floating-point number.
   * Disallows integer values.
   */
  public get float() {
    return this.$metadata({ type: "float" })
      .$add(v => [
        !Number.isInteger(v),
        `shall not be an integer`
      ])
  }

  /**
   * Alias for `float` schema modifier.
   */
  public get double() {
    return this.float
  }

  /**
   * Enforce that the number is greater than zero.
   */
  public get positive() {
    return this.gt(0)
  }

  /**
   * Enforce that the number is less than zero.
   */
  public get negative() {
    return this.lt(0)
  }

  /**
   * Configure schema to validate valid port numbers (integer 0–65535).
   */
  public get port() {
    return this.integer
      .format("int32")
      .gte(0)
      .lte(65535)
  }

  /**
   * Enforce integer values and set metadata type to "integer".
   */
  public get integer() {
    return this.$metadata({ type: "integer" })
      .$add(v => [
        Number.isInteger(v),
        `shall be an integer`
      ] as [boolean, string])
  }

  /**
   * Enforce a minimum inclusive value.
   * @param n Minimum allowed value.
   */
  public gte(n: number) {
    return this.$metadata({ minimum: n })
      .$add(v => [
        v >= n,
        `shall be greater than or equal to ${ n }`
      ])
  }

  /**
   * Enforce a maximum inclusive value.
   * @param n Maximum allowed value.
   */
  public lte(n: number) {
    return this.$metadata({ maximum: n })
      .$add(v => [
        v <= n,
        `shall be less than or equal to ${ n }`
      ])
  }

  /**
   * Enforce a minimum exclusive value.
   * @param n Value must be greater than this.
   */
  public gt(n: number) {
    return this.$metadata({ exclusiveMinimum: n })
      .$add(v => [
        v > n,
        `shall be greater than ${ n }`
      ])
  }

  /**
   * Enforce a maximum exclusive value.
   * @param n Value must be less than this.
   */
  public lt(n: number) {
    return this.$metadata({ exclusiveMaximum: n })
      .$add(v => [
        v < n,
        `shall be less than ${ n }`
      ])
  }

  /**
   * Alias for `gte(n)`.
   * @param n Minimum allowed value.
   */
  public min(n: number) {
    return this.gte(n)
  }

  /**
   * Alias for `lte(n)`.
   * @param n Maximum allowed value.
   */
  public max(n: number) {
    return this.lte(n)
  }

  /**
   * Set numeric format metadata without adding a new rule.
   * @param format Numeric format, defaults to "int64".
   */
  public format(format: "int32" | "int64" = "int64") {
    return this.$metadata({ format })
  }

  /**
   * Enforce that the value is a multiple of the given base.
   * @param base Divisor for the multiple check.
   */
  public multiple(base: number) {
    return this.$metadata({ multipleOf: base })
      .$add(v => [
        v % base === 0,
        `shall be a multiple of ${ base }`
      ])
  }

  /**
   * Enforce numeric precision by number of decimal places.
   * @param decimals Number of allowed decimal places.
   */
  public precision(decimals: number) {
    const factor = 10 ** decimals
    return this.$metadata({ "x-precision": decimals })
      .$add(v => [
        Number.isInteger(v * factor),
        `shall be accurate to ${ factor }`
      ])
  }
}
