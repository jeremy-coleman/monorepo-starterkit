function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const myObj = { text: "hello", count: 42 }

let s = getProp(myObj, "text")

let n = getProp(myObj, "count")

type Union<T, U> = T | U
type Intersection<T, U> = T & U
type Index<T> = keyof T

//conditional
//type myComponent extends react.component ? t1 : t2
