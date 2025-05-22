import { describe, expect, it } from "vitest"
import Seal from "~/seal"

const seal = new Seal()

describe("Combinator Validators", () => {
  it("oneOf requires exactly one matching schema", () => {
    const one = seal.oneOf(seal.string, seal.number)
    expect(seal.validate(one, "hello")).toEqual([])
    expect(seal.validate(one, 42)).toEqual([])
    expect(seal.validate(one, true)).toEqual([
      "none of the provided schemas is valid",
      "type boolean is not a string",
      "true is not a valid integer number"
    ])
  })

  it("anyOf accepts if any schema matches", () => {
    const any = seal.anyOf(seal.string.min(3), seal.number.gt(10))
    expect(seal.validate(any, "abcd")).toEqual([])
    expect(seal.validate(any, 15)).toEqual([])
    expect(seal.validate(any, "a")).toEqual([
      "all schemas are invalid",
      "should be longer than 2 symbols",
      "a is not a valid integer number"
    ])
  })

  it("not rejects excluded schema", () => {
    const notSchema = seal.not(seal.number.gte(0), seal.string.length(10))
    expect(seal.validate(notSchema, 5)).toEqual([])
    expect(seal.validate(notSchema, "str")).toEqual([
      "base schema is invalid",
      "str is not a valid integer number",
    ])
  })
})
