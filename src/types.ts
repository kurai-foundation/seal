export type SealDescriptor = {
  type: string
  [key: string]: any
} & Partial<{
  name: string
  description: string
  example: any
  deprecated: boolean
  default: any
  externalDocs: {
    description: string
    url: string
  }
  readOnly: boolean
  writeOnly: boolean
}>


export interface Schema<T> {
  __$rules: Array<(input: T) => [boolean, string]>
}

export type InferSchema<S extends Schema<any>> = S extends Schema<infer T> ? T : never

export type UnionOf<A extends Schema<any>[]> = InferSchema<A[number]>
export type IntersectionOf<A extends Schema<any>[]> =
  (A extends [infer H, ...infer R]
    ? H extends Schema<any>
      ? R extends Schema<any>[]
        ? InferSchema<H> & IntersectionOf<R>
        : never
      : never
    : unknown)

export type ExcludeWith<A extends Schema<any>, B extends Schema<any>> = InferSchema<A> extends InferSchema<B> ? never : InferSchema<A>