# Seal

A lightweight, TypeScript-first runtime data validator with a fluent, chainable API.


## Table of Contents

* [Installation](#installation)
* [Quick Start](#quick-start)
* [API Reference](#api-reference)
    * [Primitives](#primitives)
    * [Objects](#objects)
    * [Arrays](#arrays)
    * [Combinators](#combinators)
    * [Validation](#validation)
* [Examples](#examples)
* [License](#license)


## Installation

Install via npm or yarn:

```bash
npm install @sigiljs/seal
# or
yarn add @sigiljs/seal
```


## Quick Start

```ts
import { seal } from "@sigiljs/seal"

// Define a user schema
const userSchema = seal.object({
  id: seal.number.integer.gte(1),
  name: seal.string.min(3).max(50),
  email: seal.string.email(),
  isActive: seal.boolean,
  tags: seal.array(seal.string).min(1).unique(),
  created: seal.date.dateTime
})

// Validate data
const errors = seal.validate(userSchema, {
  id: 0,
  name: "Al",
  email: "invalid",
  isActive: true,
  tags: ["a", "a"],
  created: new Date("2025-05-22T10:00:00Z")
})

if (errors.length) {
  console.error("Validation errors:", errors)
}
else {
  console.log("Data is valid!")
}
```


## API Reference

### Primitives

* `seal.boolean` – boolean validator
* `seal.number` – numeric validator with `.integer`, `.gte(n)`, `.lte(n)`, `.float`, `.positive`, `.negative`, etc.
* `seal.string` – string validator with `.min(n)`, `.max(n)`, `.length(n)`, `.pattern(regex)`, `.email()`, `.uri()`, etc.
* `seal.date` – date validator with `.date`, `.dateTime`, `.past`, `.future`, `.between(min, max)`, etc.

### Objects

* `seal.object(shape)` – define object schema:

    * `shape` is an object mapping keys to schemas
    * `.loose` – allow extra properties
    * `.name(name)`, `.externalDocs(doc)` – metadata helpers

### Arrays

* `seal.array(itemSchema)` – homogeneous arrays
* `seal.array(...tupleSchemas)` – tuple arrays
* Chainable methods:

    * `.min(n)`, `.max(n)`, `.length(n)`, `.unique()`, `.valid(...values)`, `.invalid(...values)`

### Combinators

* `seal.oneOf(...schemas)` – exactly one schema must match
* `seal.anyOf(...schemas)` – at least one schema must match
* `seal.allOf(...schemas)` – all schemas must match
* `seal.not(schema, excludedSchema)` – base schema must match and excluded must not

### Validation

* `seal.validate(schema, input)` – returns an array of error messages (empty if valid)


## Examples

```ts
// Example: nested and combinator usage
const complex = seal.allOf(
  seal.object({ type: seal.string }),
  seal.anyOf(
    seal.object({ value: seal.number }),
    seal.object({ value: seal.string })
  )
);

const errors = seal.validate(complex, { type: 'x', value: 'abc' });
```


## License

You can copy and paste the MIT license summary from below.

```text
MIT License

Copyright (c) 2022-2025 Kurai Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```
