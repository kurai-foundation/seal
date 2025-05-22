import BasePrimitive from "./base-primitive"

/**
 * Schema for validating boolean values.
 * Extends BasePrimitive to enforce the value type is boolean.
 */
export default class BooleanSchema extends BasePrimitive<boolean> {
  /**
   * Construct a BooleanSchema.
   * Passes a validation rule checking that the input is of type boolean.
   */
  constructor() {
    super("boolean", [
      /**
       * Validation rule: checks that the value's type is boolean.
       */
      value => [
        typeof (value as any) === "boolean",
        `${ typeof value } is not a boolean`
      ]
    ])
  }
}
