import { describe, expect, it } from "vitest"
import Seal from "~/seal"

const seal = new Seal()

describe("Primitive Validators", () => {
  it("boolean schema accepts true/false and rejects others", () => {
    expect(seal.validate(seal.boolean, true)).toEqual([])
    expect(seal.validate(seal.boolean, false)).toEqual([])
    expect(seal.validate(seal.boolean, "yes")).toEqual(["string is not a boolean"])
  })

  it("number schema enforces integer and bounds", () => {
    const schema = seal.number.integer.gte(0).lte(100)
    expect(seal.validate(schema, 50)).toEqual([])
    expect(seal.validate(schema, -1)).toEqual(["shall be greater than or equal to 0"])
    expect(seal.validate(schema, 101)).toEqual(["shall be less than or equal to 100"])
    expect(seal.validate(schema, 2.5)).toEqual(["shall be an integer"])
  })

  it("string schema enforces length and pattern", () => {
    const schema = seal.string.min(2).max(4).pattern(/^foo/)
    expect(seal.validate(schema, "foo")).toEqual([])
    expect(seal.validate(schema, "f")).toEqual(["should be longer than 1 symbols"])
    expect(seal.validate(schema, "foobar")).toEqual(["should be shorter than 5 symbols"])
    expect(seal.validate(schema, "bar")).toEqual(["should match ^foo"])
  })
})