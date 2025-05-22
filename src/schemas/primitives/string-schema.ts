import BasePrimitive from "./base-primitive"

type RegexTuple = [pattern: string, flags: string]

interface SealDescriptorExtension {
  minLength: number
  maxLength: number
  pattern: RegexTuple
  format: string
  startsWith: string
  endsWith: string
  includes: string
}

/**
 * Schema for string values with extensive validation rules.
 * Extends BasePrimitive to include string-specific metadata and rules.
 */
export default class StringSchema extends BasePrimitive<string, Partial<SealDescriptorExtension>> {
  private canBeEmpty = false

  /**
   * Initialize a StringSchema.
   * Adds rules for type checking and non-empty by default.
   */
  constructor() {
    super("string", [
      v => [typeof (v as any) === "string", `type ${ typeof v } is not a string`],
      v => [this.canBeEmpty ? true : v.trim().length !== 0, `empty strings are not allowed`]
    ])
  }

  /**
   * Allow empty strings.
   * @returns The current schema instance.
   */
  public get empty() {
    this.canBeEmpty = true
    return this
  }

  /**
   * Enforce minimum length.
   * @param n Minimum number of characters.
   * @returns The current schema instance.
   */
  public min(n: number) {
    return this.$metadata({ minLength: n }).$add(v => [v.length >= n, `should be longer than ${ n - 1 } symbols`])
  }

  /**
   * Enforce maximum length.
   * @param n Maximum number of characters.
   * @returns The current schema instance.
   */
  public max(n: number) {
    return this.$metadata({ maxLength: n }).$add(v => [v.length <= n, `should be shorter than ${ n + 1 } symbols`])
  }

  /**
   * Enforce exact or ranged length.
   * @param a Exact length or minimum.
   * @param b Optional maximum length.
   * @returns The current schema instance.
   */
  public length(a: number, b?: number): this {
    if (b == null) {
      return this.$metadata({ minLength: a, maxLength: a }).$add(v => [v.length === a, `should be ${ a } symbols long`])
    }
    return this.$metadata({ minLength: a, maxLength: b }).$add(v => [
      v.length >= a && v.length <= b,
      `should be longer than ${ a } symbols and shorter than ${ b }`
    ])
  }

  /**
   * Enforce pattern matching via RegExp.
   * @param re Regular expression to test against.
   * @returns The current schema instance.
   */
  public pattern(re: RegExp) {
    return this.$metadata({ pattern: [re.source, re.flags] }).$add(v => [re.test(v), `should match ${ re.source }`])
  }

  /**
   * Enforce starting substring.
   * @param prefix Required starting string.
   * @returns The current schema instance.
   */
  public startsWith(prefix: string) {
    return this.$metadata({ startsWith: prefix }).$add(v => [v.startsWith(prefix), `should start with ${ prefix }`])
  }

  /**
   * Enforce ending substring.
   * @param suffix Required ending string.
   * @returns The current schema instance.
   */
  public endsWith(suffix: string) {
    return this.$metadata({ endsWith: suffix }).$add(v => [v.endsWith(suffix), `should end with ${ suffix }`])
  }

  /**
   * Enforce substring inclusion.
   * @param substr Substring that must be included.
   * @returns The current schema instance.
   */
  public includes(substr: string) {
    return this.$metadata({ includes: substr }).$add(v => [v.includes(substr), `should include ${ substr }`])
  }

  /**
   * Enforce trimmed value (no surrounding whitespace).
   * @returns The current schema instance.
   */
  public trim() {
    return this.$add(v => [v === v.trim(), "should be trimmed"])
  }

  /**
   * Enforce lowercase letters only.
   * @returns The current schema instance.
   */
  public lowercase() {
    return this.$add(v => [v === v.toLowerCase(), "should be lowercase"])
  }

  /**
   * Enforce uppercase letters only.
   * @returns The current schema instance.
   */
  public uppercase() {
    return this.$add(v => [v === v.toUpperCase(), "should be uppercase"])
  }

  /**
   * Enforce alphanumeric characters only.
   * @returns The current schema instance.
   */
  public alphanumeric() {
    const re = /^[a-zA-Z0-9]+$/
    return this.$metadata({ "x-format": "alphanumeric" }).pattern(re)
  }

  /**
   * Enforce email format.
   * @returns The current schema instance.
   */
  public email() {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return this.$metadata({ format: "email" }).pattern(re)
  }

  /**
   * Enforce URI format.
   * @returns The current schema instance.
   */
  public uri() {
    return this.$metadata({ format: "uri" }).$add(v => [safeUrl(v) !== null, "should be a valid url"] as [boolean, string])
  }

  /**
   * Enforce UUID format.
   * @returns The current schema instance.
   */
  public uuid() {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return this.$metadata({ format: "uuid" }).pattern(re)
  }

  /**
   * Enforce IP address format (IPv4 or IPv6).
   * @returns The current schema instance.
   */
  public ip() {
    const re = /^(?:\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i
    return this.$metadata({ format: "ip" }).pattern(re)
  }

  /**
   * Enforce ISO date format (YYYY-MM-DD).
   * @returns The current schema instance.
   */
  public isoDate() {
    const re = /^\d{4}-\d{2}-\d{2}$/
    return this.$metadata({ format: "date" }).pattern(re)
  }

  /**
   * Enforce ISO date-time format (YYYY-MM-DDTHH:mm:ss[.sss]Z?).
   * @returns The current schema instance.
   */
  public dateTime() {
    const re = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/
    return this.$metadata({ format: "date-time" }).pattern(re)
  }
}

/**
 * Attempt to parse a URL string; return URL object or null if invalid.
 * @param url String to validate as URL.
 * @returns A URL instance or null on failure.
 */
function safeUrl(url: string) {
  try {
    return new URL(url)
  }
  catch {
    return null
  }
}
