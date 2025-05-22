import ValidationError from "../../validation-error"
import BaseSchema from "../base-schema"

/**
 * ISO date string format for metadata (RFC 3339).
 */
type ISO = string

/**
 * Metadata extensions for date schemas.
 */
interface SealDescriptorExtension {
  /**
   * Schema format: "date" or "date-time".
   */
  format: "date" | "date-time"
  /**
   * Inclusive minimum date in ISO string.
   */
  minimum: ISO
  /**
   * Inclusive maximum date in ISO string.
   */
  maximum: ISO
  /**
   * Custom display format for dates.
   */
  "x-date-format": string
}

/**
 * Attempt to convert a Date or string to a valid Date object.
 * @param d Input date or ISO string.
 * @returns A Date instance if valid; otherwise null.
 */
function toDate(d: Date | string): Date | null {
  if (d instanceof Date) {
    return isNaN(+d) ? null : d
  }
  const parsed = new Date(d)
  return isNaN(+parsed) ? null : parsed
}

/**
 * Schema for Date values with optional constraints and formatting.
 * Extends BaseSchema to support date-specific metadata and validation.
 * @extends BaseSchema<Date, Partial<SealDescriptorExtension>>
 */
export default class DateSchema extends BaseSchema<Date, Partial<SealDescriptorExtension>> {
  private minDate?: Date
  private maxDate?: Date

  /**
   * Initialize a DateSchema.
   * Adds a rule ensuring the value is a valid Date instance.
   */
  constructor() {
    super("string", [
      /**
       * Validation rule: checks for Date instance and valid timestamp.
       */
      v => [(v as any) instanceof Date && !isNaN(+v), `${ typeof v } is not a valid date`]
    ])
    // Default metadata format is full date-time
    this.$metadata({ format: "date-time" })
  }

  /**
   * Enforce RFC 3339 date format (YYYY-MM-DD).
   * @returns The current schema instance.
   */
  public get date() {
    return this.$metadata({ format: "date" })
      .$add(v => [
        v.toISOString().length === 24,
        `${ v } is not a valid RFC 3339 date`
      ])
  }

  /**
   * Ensure full date-time format (YYYY-MM-DDThh:mm:ss.sssZ).
   * @returns The current schema instance.
   */
  public get dateTime() {
    return this.$metadata({ format: "date-time" })
  }

  /**
   * Constrain to past dates only (<= now).
   * @returns The current schema instance.
   */
  public get past() {
    return this.max(new Date())
  }

  /**
   * Constrain to future dates only (>= now).
   * @returns The current schema instance.
   */
  public get future() {
    return this.min(new Date())
  }

  /**
   * Set a custom display format pattern for dates.
   * @param pattern Date format pattern string.
   * @returns The current schema instance.
   */
  public display(pattern: string) {
    return this.$metadata({ "x-date-format": pattern })
  }

  /**
   * Enforce inclusive minimum date.
   * @param d Minimum date as Date or ISO string.
   * @throws ValidationError if input is not a valid date.
   * @returns The current schema instance.
   */
  public min(d: string | Date) {
    const parsed = toDate(d)
    if (!parsed) throw new ValidationError("Invalid min date")
    this.minDate = parsed
    return this.$metadata({ minimum: parsed.toISOString() })
      .$add(v => [v >= parsed, `shall be greater than or equal to ${ parsed.toISOString() }`])
  }

  /**
   * Enforce inclusive maximum date.
   * @param d Maximum date as Date or ISO string.
   * @throws ValidationError if input is not a valid date.
   * @returns The current schema instance.
   */
  public max(d: string | Date) {
    const parsed = toDate(d)
    if (!parsed) throw new ValidationError("Invalid max date")
    this.maxDate = parsed
    return this.$metadata({ maximum: parsed.toISOString() })
      .$add(v => [v <= parsed, `shall be less than or equal to ${ parsed.toISOString() }`])
  }

  /**
   * Enforce a date range between min and max (inclusive).
   * @param min Date or ISO string for minimum.
   * @param max Date or ISO string for maximum.
   * @returns The current schema instance.
   */
  public between(min: Date | string, max: Date | string) {
    return this.min(min).max(max)
  }

  /**
   * Validate input, optionally parsing strings to Date and checking constraints.
   * @param input Value to validate (Date or string).
   * @returns Array of error messages (empty if valid).
   * @internal
   */
  public override __$validate(input: unknown): string[] {
    let _input: Date | null = null

    if (typeof input === "string") {
      const d = toDate(input)
      if (!d) return [`${ input } is not a valid date`]
      _input = d
    }

    if (!(_input instanceof Date) || isNaN(+_input)) {
      return [`NaN is not a valid date`]
    }

    if (this.minDate && _input < this.minDate) {
      return [`shall be greater than or equal to ${ this.minDate.toISOString() }`]
    }
    if (this.maxDate && _input > this.maxDate) {
      return [`shall be less than or equal to ${ this.maxDate.toISOString() }`]
    }

    return super.__$validate(_input)
  }
}