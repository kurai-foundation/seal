import { InferSchema } from "~/types"
import BaseSchema from "../base-schema"

/**
 * Interface extending SealDescriptor for array schema metadata.
 */
interface SealDescriptorExtension {
  minItems: number
  maxItems: number
  uniqueItems: true
  items: any
  valid: any[]
  invalid: any[]
  tuple: any[]
}

/**
 * Schema for array values, supporting both homogeneous and tuple validation.
 * Extends BaseSchema with array-specific metadata and validation rules.
 * @template S Schema type for array elements or tuple entries.
 */
export default class ArraySchema<S extends BaseSchema<any>> extends BaseSchema<InferSchema<S>[], Partial<SealDescriptorExtension>> {
  private readonly elementSchema?: S
  private readonly tupleSchemas?: S[]

  private allowDuplicates = true
  private whitelist: InferSchema<S>[] | undefined
  private blacklist: InferSchema<S>[] | undefined

  /**
   * Create an ArraySchema instance.
   * Supports two modes:
   *  - Homogeneous arrays: pass a single schema for all elements.
   *  - Tuple arrays: pass an array of schemas for positional validation.
   * @param arg Single element schema or array of tuple schemas.
   */
  constructor(arg: S | S[]) {
    super("array")

    if (Array.isArray(arg)) {
      this.tupleSchemas = arg
      // Store tuple schemas metadata for OpenAPI
      this.$metadata({ tuple: arg.map(s => s.__$exportMetadata()) })
    }
    else {
      this.elementSchema = arg
      // Store items schema metadata for homogeneous arrays
      this.$metadata({ items: arg.__$exportMetadata() })
    }
  }

  /**
   * Set the name metadata for this array schema.
   * @param input Custom schema name.
   * @returns The current schema instance.
   */
  public name(input: string) {
    return this.$metadata({ name: input })
  }

  /**
   * Enforce minimum number of items.
   * @param n Minimum item count.
   * @returns The current schema instance.
   */
  public min(n: number) {
    return this.$metadata({ minItems: n })
      .$add(v => [v.length >= n, `shall contain at least ${ n } items`])
  }

  /**
   * Enforce maximum number of items.
   * @param n Maximum item count.
   * @returns The current schema instance.
   */
  public max(n: number) {
    return this.$metadata({ maxItems: n })
      .$add(v => [v.length <= n, `shall contain less than ${ n + 1 } items`])
  }

  /**
   * Enforce exact array length.
   * @param n Required number of items.
   * @returns The current schema instance.
   */
  public length(n: number) {
    return this.min(n).max(n)
  }

  /**
   * Enforce uniqueness of array items.
   * @returns The current schema instance.
   */
  public unique() {
    this.allowDuplicates = false
    return this.$metadata({ uniqueItems: true })
      .$add(v => [new Set(v).size === v.length, "shall contain only unique items"])
  }

  /**
   * Whitelist specific item values allowed in the array.
   * @param values Allowed values.
   * @returns The current schema instance.
   */
  public valid(...values: InferSchema<S>[]) {
    this.whitelist = values
    return this.$metadata({ valid: values })
      .$add(v => [v.every(i => values.includes(i)), `some of provided values are not allowed`])
  }

  /**
   * Blacklist specific item values disallowed in the array.
   * @param values Disallowed values.
   * @returns The current schema instance.
   */
  public invalid(...values: InferSchema<S>[]) {
    this.blacklist = values
    return this.$metadata({ invalid: values })
      .$add(v => [!v.some(i => values.includes(i)), `some of provided values are not allowed`])
  }

  /**
   * Validate the input array against schema rules.
   * Handles tuple or element schema, duplicates, whitelist and blacklist checks.
   * Stops at the first encountered error.
   * @param input Value to validate.
   * @returns Array of error messages or empty if valid.
   * @internal
   */
  public override __$validate(input: any): string[] {
    if (!Array.isArray(input)) {
      return [`${ typeof input } is not an array`]
    }

    if (this.tupleSchemas) {
      if (input.length !== this.tupleSchemas.length) {
        return [`invalid array length`]
      }
      for (let i = 0; i < input.length; i++) {
        const msgs = this.tupleSchemas[i].__$validate(input[i])
        if (msgs.length > 0) return msgs
      }
    }
    else if (this.elementSchema) {
      for (const item of input) {
        const msgs = this.elementSchema.__$validate(item)
        if (msgs.length > 0) return msgs
      }
    }

    if (!this.allowDuplicates && new Set(input).size !== input.length) {
      return ["duplicates not allowed"]
    }

    if (this.whitelist && !input.every(i => this.whitelist!.includes(i))) {
      return ["some of provided values are not allowed"]
    }

    if (this.blacklist && input.some(i => this.blacklist!.includes(i))) {
      return ["some of provided values are not allowed"]
    }

    return super.__$validate(input)
  }

  /**
   * Export metadata for OpenAPI generation, including tuple or items schemas.
   * @returns The complete metadata descriptor.
   * @internal
   */
  public override __$exportMetadata() {
    const base = super.__$exportMetadata()
    return {
      ...base,
      ...(this.elementSchema && { items: this.elementSchema.__$exportMetadata() }),
      ...(this.tupleSchemas && { tuple: this.tupleSchemas.map(s => s.__$exportMetadata()) })
    }
  }
}