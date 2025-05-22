import { describe, expect, it } from "vitest"
import Seal from "~/seal"

const seal = new Seal()

describe("Object and Array Validators", () => {
  it("object schema enforces required keys and types", () => {
    const user = seal.object({ id: seal.number.integer, name: seal.string })
    expect(seal.validate(user, { id: 1, name: "Alice" })).toEqual([])
    expect(seal.validate(user, { id: 3.21, name: "Bob" })).toEqual(["key \"id\" shall be an integer"])
    expect(seal.validate(user, { id: 2 })).toEqual(["key \"name\" not found"])
  })

  it("array schema enforces uniqueness and size", () => {
    const arr = seal.array(seal.number).min(2).unique()
    expect(seal.validate(arr, [1, 2])).toEqual([])
    expect(seal.validate(arr, [1])).toEqual(["shall contain at least 2 items"])
    expect(seal.validate(arr, [1, 1])).toEqual(["duplicates not allowed"])
  })
})