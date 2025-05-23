import Seal from "~/seal"
import {
  BaseSchema,
  CoreSchema,
  NullableSchema,
  OptionalSchema,

  BasePrimitive,
  StringSchema,
  NumberSchema,
  BooleanSchema,

  ComposeSchema,
  ObjectSchema,
  ArraySchema,
  DateSchema,

  AnyOfSchema,
  OneOfSchema,
  NotSchema,
  AllOfSchema
} from "./seal"
import ValidationError from "./validation-error"

export const seal = new Seal()
export {
  ValidationError,

  BaseSchema,
  CoreSchema,
  NullableSchema,
  OptionalSchema,

  BasePrimitive,
  StringSchema,
  NumberSchema,
  BooleanSchema,

  ComposeSchema,
  ObjectSchema,
  ArraySchema,
  DateSchema,

  AnyOfSchema,
  OneOfSchema,
  NotSchema,
  AllOfSchema
}
