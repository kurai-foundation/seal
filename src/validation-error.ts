/**
 * Error thrown when a schema validation rule fails or invalid configuration is detected.
 * Extends the built-in Error class to include an HTTP status code.
 */
export default class ValidationError extends Error {
  /**
   * HTTP status code associated with validation errors (400 Bad Request).
   */
  public readonly code: number

  /**
   * Create a new ValidationError.
   * @param message Descriptive error message explaining the validation failure.
   */
  constructor(message: string) {
    super(message)
    // Set the error name to distinguish ValidationError instances
    this.name = "ValidationError"
    // Use HTTP 400 Bad Request code for validation errors
    this.code = 400
  }
}
